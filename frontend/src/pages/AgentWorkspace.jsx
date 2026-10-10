import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  CheckCircle2,
  FileText,
  LoaderCircle,
  Mic,
  Paperclip,
  Send,
  Shield,
  Sparkles,
  User as UserIcon,
} from 'lucide-react';
import { useApplication } from '../context/useApplication';
import { APP_STATUS } from '../context/applicationStatus';
import { useLanguage } from '../context/useLanguage';
import { useAuth } from '../context/useAuth';
import { chatAPI, formAPI, sessionAPI, uploadAPI } from '../services/api';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const STATUS_MAP = {
  REQUEST_RECEIVED: APP_STATUS.REQUEST_RECEIVED,
  SERVICE_NOT_SUPPORTED: APP_STATUS.SERVICE_NOT_SUPPORTED,
  DOCUMENTS_PENDING: APP_STATUS.COLLECTING_DOCUMENTS,
  COLLECTING_DOCUMENTS: APP_STATUS.COLLECTING_DOCUMENTS,
  VALIDATING_DOCUMENTS: APP_STATUS.VALIDATING_DOCUMENTS,
  FORM_READY: APP_STATUS.FORM_READY,
  FORM_FILLED: APP_STATUS.FORM_READY,
  FORM_INCOMPLETE: APP_STATUS.FORM_INCOMPLETE,
  WAITING_CONSENT: APP_STATUS.WAITING_CONSENT,
  SUBMITTING: APP_STATUS.SUBMITTING,
  SUBMITTED: APP_STATUS.SUBMITTED,
  HUMAN_ESCALATION: APP_STATUS.PORTAL_ERROR,
  RETRYING: APP_STATUS.RECOVERING,
};

const FLOW_STEPS = ['Request', 'Documents', 'Review', 'Consent', 'Saved'];

function normalizeFieldName(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

function getExplicitServiceRequest(message) {
  const normalized = normalizeFieldName(message);
  const clauses = normalized.split(/[,;.!?]+|\b(?:and|but|however|instead|now|then)\b/);
  const patterns = [
    ['income_certificate', /\bincome(?: certificate)?\b|\baay praman patra\b/],
    ['caste_certificate', /\bcaste(?: certificate)?\b|\bjaati?(?: certificate)?\b/],
    ['residence_certificate', /\b(?:residence|domicile)(?: certificate)?\b|\bniwas praman patra\b/],
    ['ews_certificate', /\bews(?: certificate)?\b|\beconomically weaker section(?: certificate)?\b/],
    ['birth_certificate', /\bbirth(?: certificate)?\b|\bjanam praman patra\b/],
    ['scholarship', /\bscholarship(?: application| form)?\b/],
  ];
  const action = /\b(?:want|need|create|make|get|apply|start|begin|switch|change|move|prefer|request|looking for|chahiye|banana|banwana|mujhe)\b/;
  const negation = /\b(?:dont|don t|do not|not|never|no longer|nahi|nahin|mat)\b/;
  const requests = [];

  clauses.forEach((clause, clauseIndex) => {
    patterns.forEach(([serviceId, pattern]) => {
      const match = pattern.exec(clause);
      if (!match) return;
      const prefix = clause.slice(0, match.index);
      const suffix = clause.slice(match.index + match[0].length);
      const hasAction = action.test(prefix) || /\b(?:chahiye|banana|banwana|bana do|karna hai|krna hai)\b/.test(suffix);
      if (hasAction && !negation.test(prefix)) requests.push([clauseIndex, match.index, serviceId]);
    });
  });

  return requests.sort((left, right) => left[0] - right[0] || left[1] - right[1]).at(-1)?.[2] || null;
}

function parseChatFieldUpdates(message, fields, missingFields = [], latestAssistantMessage = '') {
  const updates = {};
  const entries = Object.entries(fields || {});
  for (const line of String(message || '').split(/[;\n]+/)) {
    const separator = line.indexOf(':');
    if (separator < 1) continue;
    const requestedField = normalizeFieldName(line.slice(0, separator));
    const value = line.slice(separator + 1).trim();
    if (!value) continue;
    const match = entries.find(([key, field]) =>
      [key, field.label].some((candidate) => normalizeFieldName(candidate) === requestedField)
    );
    if (match) updates[match[0]] = value;
  }
  if (Object.keys(updates).length) return updates;
  if (String(message || '').includes(':')) return updates;

  const answer = String(message || '').trim();
  if (!answer || /[?？]/.test(answer) || /^(why|what|how|review|status|track|progress|yes|haan|no|ok|okay|done|save|submit|start|new|not now)\b/i.test(answer)) {
    return updates;
  }
  const prompt = String(latestAssistantMessage || '');
  if (/tell me|share|provide|send|reply with/i.test(prompt)) {
    const promptedFields = missingFields.filter(([key, field]) => {
      const label = String(field.label || key.replace(/_/g, ' '));
      return normalizeFieldName(prompt).includes(normalizeFieldName(label));
    });
    if (promptedFields.length === 1) updates[promptedFields[0][0]] = answer;
  }
  return updates;
}

function AgentWorkspace() {
  const {
    application,
    setApplication,
    messages,
    setMessages,
    documents,
    setDocuments,
    setAgentSteps,
    setActivityFeed,
    setConsent,
    addMessage,
    appStatus,
    setAppStatus,
    addActivity,
    isRestoring,
  } = useApplication();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const userId = user?.id;

  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formSaving, setFormSaving] = useState(false);
  const [formEdits, setFormEdits] = useState({});
  const [isDraggingFiles, setIsDraggingFiles] = useState(false);
  const [formSaveMessage, setFormSaveMessage] = useState('');
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const fileInputRef = useRef(null);
  const hasWelcomed = useRef(false);
  const lastSavedFormRef = useRef('');
  const formSavePromiseRef = useRef(null);

  const requirements = application?.requiredDocuments || [];
  const requiredRequirements = requirements.filter((item) => item.required !== false);
  const formFields = application?.formData?.fields || {};
  const formFieldEntries = Object.entries(formFields);
  const serverFormValues = Object.fromEntries(
    formFieldEntries.map(([key, field]) => [key, field.value == null ? '' : String(field.value)])
  );
  const formValues = { ...serverFormValues, ...formEdits };
  const missingFormFields = formFieldEntries.filter(([key, field]) =>
    field.required !== false && !String(formValues[key] ?? field.value ?? '').trim()
  );
  const hasForm = formFieldEntries.length > 0;
  const isSubmitted = appStatus === APP_STATUS.SUBMITTED;

  const flowIndex = useMemo(() => {
    if (appStatus === APP_STATUS.SUBMITTED) return 4;
    if ([APP_STATUS.WAITING_CONSENT, APP_STATUS.SUBMITTING].includes(appStatus)) return 3;
    if ([APP_STATUS.FORM_READY, APP_STATUS.FORM_INCOMPLETE].includes(appStatus)) return 2;
    if ([APP_STATUS.COLLECTING_DOCUMENTS, APP_STATUS.VALIDATING_DOCUMENTS].includes(appStatus)) return 1;
    return application?.serviceId ? 1 : 0;
  }, [appStatus, application?.serviceId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, application?.formData, formSaving]);

  useEffect(() => () => recognitionRef.current?.stop(), []);

  useEffect(() => {
    if (!application?.formData?.fields) return;
    const values = Object.fromEntries(
      Object.entries(application.formData.fields).map(([key, field]) => [
        key,
        field.value == null ? '' : String(field.value),
      ])
    );
    lastSavedFormRef.current = JSON.stringify(values);
  }, [application?.serviceId, application?.formData]);

  useEffect(() => {
    if (isRestoring || hasWelcomed.current || messages.length > 0) return undefined;
    const welcome = application?.service
      ? t('agentWelcomeSelected', { service: application.service })
      : t('agentWelcomeBody');
    const timer = setTimeout(() => {
      hasWelcomed.current = true;
      addMessage('agent', welcome);
      addActivity('AGENT', 'Welcome message sent');
    }, 250);
    return () => clearTimeout(timer);
  }, [application?.service, isRestoring, messages.length, t, addMessage, addActivity]);

  const applyChatResult = (data) => {
    const nextServiceId = data.service && data.service !== 'unknown'
      ? data.service
      : null;
    const serviceChanged = Boolean(
      data.service_switched ||
      (nextServiceId && application?.serviceId && nextServiceId !== application.serviceId)
    );
    const nextStatus = STATUS_MAP[data.application_status] || STATUS_MAP[data.current_step];

    if (serviceChanged) {
      setDocuments(data.uploaded_documents || []);
      setConsent('pending');
      setFormEdits({});
      setFormSaveMessage('');
      lastSavedFormRef.current = '';
    }

    setApplication((previous) => ({
      ...(previous || {}),
      id: data.application_id || (serviceChanged ? null : previous?.id || null),
      submittedAt: data.submitted_at || (serviceChanged ? null : previous?.submittedAt || null),
      serviceId: nextServiceId || previous?.serviceId || null,
      service: data.service_name || previous?.service || null,
      requiredDocuments: data.required_documents ?? (serviceChanged ? [] : previous?.requiredDocuments || []),
      validatedDocuments: data.validated_documents ?? (serviceChanged ? {} : previous?.validatedDocuments ?? {}),
      formData: data.form_data ?? (serviceChanged ? null : previous?.formData ?? null),
      applicant: serviceChanged ? {} : previous?.applicant,
      userId,
    }));

    if (data.form_data?.fields) {
      const values = Object.fromEntries(
        Object.entries(data.form_data.fields).map(([key, field]) => [
          key,
          field.value == null ? '' : String(field.value),
        ])
      );
      lastSavedFormRef.current = JSON.stringify(values);
      setFormEdits({});
    }

    if (nextStatus) setAppStatus(nextStatus);
    if (data.application_status === 'SUBMITTED' || data.current_step === 'SUBMITTED') {
      setConsent('granted');
    }
    if (data.application_id) addActivity('SYSTEM', `Demo reference: ${data.application_id}`);
    if (data.escalated) {
      addActivity('SYSTEM', 'Demo retry limit reached; no human helper was contacted');
    }
  };

  const resetLocalApplication = () => {
    setMessages([]);
    setDocuments([]);
    setAgentSteps([]);
    setActivityFeed([]);
    setConsent('pending');
    setApplication(null);
    setAppStatus(APP_STATUS.IDLE);
    setFormEdits({});
    setFormSaveMessage('');
    lastSavedFormRef.current = '';
    hasWelcomed.current = true;
  };

  const handleSend = async (text) => {
    const message = (text || input).trim();
    if (!message || isTyping || formSaving) return;
    if (!userId) {
      addMessage('agent', 'Please sign in again before continuing.');
      return;
    }

    const startsNewApplication = /\b(?:new|another|start|begin|restart|clear)\b.{0,40}\b(?:application|certificate|scholarship|session|chat|over)\b/i.test(message);
    let serviceId = application?.serviceId || null;
    const requestedService = getExplicitServiceRequest(message);
    const switchesService = Boolean(requestedService && application?.serviceId && requestedService !== application.serviceId);

    setInput('');
    setIsTyping(true);
    try {
      if (formSavePromiseRef.current) await formSavePromiseRef.current;

      if (startsNewApplication) {
        await sessionAPI.clear(userId);
        resetLocalApplication();
        serviceId = null;
      }

      addMessage('user', message);
      addActivity('USER', message);

      const mentionsService = /\b(income|caste|jaat|residence|domicile|ews|birth|scholarship)\b/i.test(message);
      if (startsNewApplication && !mentionsService) {
        setAppStatus(APP_STATUS.IDLE);
        addMessage('agent', language === 'hi'
          ? 'Naya chat session shuru ho gaya hai. Kaunsa application chahiye—Income, Caste, Residence/Domicile, EWS, Birth Certificate ya Scholarship?'
          : 'Your fresh chat session is ready. Which application do you need: Income, Caste, Residence/Domicile, EWS, Birth Certificate, or Scholarship?');
        return;
      }

      if (!startsNewApplication && !switchesService && hasForm && !isSubmitted) {
        const latestAssistantMessage = [...messages].reverse().find((item) => item.sender === 'agent')?.text || '';
        const updates = parseChatFieldUpdates(message, formFields, missingFormFields, latestAssistantMessage);
        if (Object.keys(updates).length > 0) {
          const nextValues = { ...formValues, ...updates };
          setFormEdits((previous) => ({ ...previous, ...updates }));
          const saved = await saveFormValues(nextValues, true);
          if (saved && !saved.missing_fields?.length) {
            addMessage('agent', language === 'hi'
              ? 'यह जरूरी जानकारी चैट से फॉर्म में जोड़कर सेव कर दी है। अब फॉर्म यहीं देख सकते हैं।'
              : 'I added that required detail from chat and saved it in your form here. You can review the form above.');
          }
          return;
        }
      }

      setAppStatus(APP_STATUS.REQUEST_RECEIVED);

      const response = await chatAPI.send({ userId, message, serviceId });
      const data = response.data || {};
      if (data.message) addMessage('agent', data.message, data.status_report ? { statusReport: data.status_report } : {});
      applyChatResult(data);

      if (data.application_status === 'SUBMITTED' || data.current_step === 'SUBMITTED') {
        addActivity('SYSTEM', `Demo application saved: ${data.application_id || 'reference unavailable'}`);
      }
    } catch (error) {
      const detail = error.response?.data?.detail ||
        error.response?.data?.message ||
        'I could not complete that step. Please check the connection and try again.';
      addMessage('agent', detail);
      addActivity('SYSTEM', 'Chat action failed');
      setAppStatus(APP_STATUS.PORTAL_ERROR);
    } finally {
      setIsTyping(false);
    }
  };

  const prepareFormInChat = async () => {
    if (!userId || !application?.serviceId || isTyping) return;
    setIsTyping(true);
    try {
      const response = await chatAPI.send({
        userId,
        serviceId: application.serviceId,
        message: 'Prepare my application form for review.',
      });
      const data = response.data || {};
      if (data.message) addMessage('agent', data.message);
      applyChatResult(data);
      addActivity('SYSTEM', 'Review form prepared inside chat');
    } catch (error) {
      addMessage(
        'agent',
        error.response?.data?.detail || 'I could not prepare the form. Please try again in this chat.'
      );
    } finally {
      setIsTyping(false);
    }
  };

  const handleUploadFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length || uploading || isTyping) return;
    if (!userId) {
      addMessage('agent', 'Please sign in again before uploading a PDF.');
      return;
    }
    if (!application?.serviceId) {
      addMessage('agent', language === 'hi'
        ? 'पहले चैट में बताइए कि कौन-सा प्रमाणपत्र या स्कॉलरशिप आवेदन चाहिए; फिर यहीं PDF जोड़ दीजिए।'
        : 'Tell me which certificate or scholarship you need first, then attach the PDF here.');
      return;
    }
    if (isSubmitted) {
      addMessage('agent', 'This demo application is already saved. Type “new application for …” to start another one.');
      return;
    }

    setUploading(true);
    let nextDocuments = [...documents];
    let shouldRefreshForm = false;
    try {
      for (const file of files) {
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
          addMessage('agent', `${file.name}: please attach a PDF file.`);
          continue;
        }
        if (file.size > MAX_UPLOAD_BYTES) {
          addMessage('agent', `${file.name}: PDF files must be 10 MB or smaller.`);
          continue;
        }

        const { data } = await uploadAPI.upload(userId, application.serviceId, file);
        const replacedIds = new Set((data.replaced_documents || []).map((document) => document.id));
        shouldRefreshForm ||= replacedIds.size > 0;
        nextDocuments = [
          ...nextDocuments.filter((document) => !replacedIds.has(document.id) && document.id !== data.id),
          data,
        ];
        setDocuments(nextDocuments);
        addActivity('USER', `Uploaded ${data.filename} (${data.document_type})`);

        const matches = requirements.filter((requirement) =>
          requirement.accepted_documents?.includes(data.document_type)
        );
        const replacedNames = (data.replaced_documents || []).map((document) => document.filename).filter(Boolean);
        const replacementNote = replacedNames.length
          ? language === 'hi'
            ? ` Pichhli matching file ${replacedNames.join(', ')} ko isse replace kar diya.`
            : ` Replaced the earlier matching file: ${replacedNames.join(', ')}.`
          : '';
        addMessage(
          'user',
          `Attached PDF: ${data.filename}`
        );
        addMessage(
          'agent',
          matches.length
            ? language === 'hi'
              ? `${data.filename} पढ़ने योग्य है और ${formatLabel(data.document_type)} के रूप में पहचाना गया। यह ${matches.map((requirement) => requirement.label).join(', ')} को पूरा करता है।${replacementNote}`
              : `${data.filename} is readable and was identified as ${formatLabel(data.document_type)}. It matches: ${matches.map((requirement) => requirement.label).join(', ')}.${replacementNote}`
            : language === 'hi'
              ? `${data.filename} पढ़ने योग्य है, लेकिन पहचाना गया प्रकार इस सेवा की तय जरूरतों से मेल नहीं खाता; जरूरी गिनती नहीं बढ़ेगी।`
              : `${data.filename} is readable, but its detected type does not match a configured requirement for this service, so required progress will not change.`
        );
      }

      const allRequiredPresent = requiredRequirements.length > 0 &&
        requiredRequirements.every((requirement) =>
          nextDocuments.some((document) => requirement.accepted_documents?.includes(document.document_type))
        );
      if (allRequiredPresent && (!application?.formData || shouldRefreshForm)) {
        addMessage('agent', shouldRefreshForm
          ? 'Replacement document received. I’m refreshing your form from the current documents and keeping details you already gave me.'
          : 'The required documents are in. I’m preparing your form here in chat.');
        await prepareFormInChat();
      }
    } catch (error) {
      addMessage(
        'agent',
        error.response?.data?.detail || 'I could not read that PDF. Please try another file in this chat.'
      );
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const saveFormValues = async (values, promptForNext = false) => {
    const snapshot = JSON.stringify(values);
    const previousSave = formSavePromiseRef.current;
    const operation = (previousSave || Promise.resolve()).catch(() => {}).then(async () => {
      if (snapshot === lastSavedFormRef.current) return null;
      setFormSaving(true);
      setFormSaveMessage('Saving…');
      const { data } = await formAPI.save(userId, values);
      lastSavedFormRef.current = snapshot;
      setApplication((previous) => ({ ...(previous || {}), formData: data.form_data }));
      setAppStatus(STATUS_MAP[data.current_step] || APP_STATUS.FORM_INCOMPLETE);
      setFormSaveMessage('Saved automatically');
      if (data.current_step === 'WAITING_CONSENT' && appStatus !== APP_STATUS.WAITING_CONSENT) {
        addMessage('agent', language === 'hi'
          ? 'फॉर्म की सभी जरूरी जानकारी सेव हो गई है। ऊपर फॉर्म देख लें; स्थानीय डेमो रिकॉर्ड सेव करने के लिए चैट में हाँ लिखें। किसी सरकारी कार्यालय से संपर्क नहीं होगा।'
          : 'All required form details are saved. Review the form above; reply YES in this chat to save a local demo record. No government office will be contacted.');
      } else if (data.missing_fields?.length) {
        setFormSaveMessage(`${data.missing_fields.length} required detail(s) remaining`);
        if (promptForNext) {
          addMessage('agent', `Thanks, I saved that. The next required detail I could not read is ${data.missing_fields[0]}. Please tell me just that here; optional fields can be left blank.`);
        }
      }
      return data;
    });
    formSavePromiseRef.current = operation;
    try {
      return await operation;
    } catch (error) {
      setFormSaveMessage('Could not save yet');
      addMessage(
        'agent',
        error.response?.data?.detail || 'Form details could not be saved. Your values are still visible above; try editing a field again.'
      );
      throw error;
    } finally {
      if (formSavePromiseRef.current === operation) {
        formSavePromiseRef.current = null;
        setFormSaving(false);
      }
    }
  };

  const handleMic = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      addMessage('agent', 'Voice input is not available in this browser. You can type your message instead.');
      return;
    }
    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript?.trim();
        if (transcript) setInput((previous) => [previous.trim(), transcript].filter(Boolean).join(' '));
      };
      recognition.onerror = () => addMessage('agent', 'Voice input could not start. Check microphone permission or type your message instead.');
      recognition.onend = () => {
        recognitionRef.current = null;
        setListening(false);
      };
      recognition.start();
      setListening(true);
    } catch {
      recognitionRef.current = null;
      setListening(false);
      addMessage('agent', 'Voice input could not start. Please type your message instead.');
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDraggingFiles(false);
    if (event.dataTransfer.files?.length) void handleUploadFiles(event.dataTransfer.files);
  };

  const statusText = {
    [APP_STATUS.IDLE]: 'Tell me what you need',
    [APP_STATUS.REQUEST_RECEIVED]: 'Working on your request',
    [APP_STATUS.SERVICE_NOT_SUPPORTED]: 'Service not supported',
    [APP_STATUS.COLLECTING_DOCUMENTS]: 'Documents needed',
    [APP_STATUS.VALIDATING_DOCUMENTS]: 'Checking documents',
    [APP_STATUS.FORM_READY]: 'Form ready to review',
    [APP_STATUS.FORM_INCOMPLETE]: 'Some form details are needed',
    [APP_STATUS.WAITING_CONSENT]: 'Waiting for your YES in chat',
    [APP_STATUS.SUBMITTING]: 'Saving demo record',
    [APP_STATUS.SUBMITTED]: 'Demo record saved',
    [APP_STATUS.PORTAL_ERROR]: 'Needs another try',
    [APP_STATUS.RECOVERING]: 'Retrying demo save',
  };

  return (
    <div
      className="flex min-h-screen flex-col bg-slate-50 text-slate-800"
      onDragEnter={(event) => {
        if (Array.from(event.dataTransfer.types || []).includes('Files')) setIsDraggingFiles(true);
      }}
      onDragOver={(event) => event.preventDefault()}
      onDragLeave={(event) => {
        if (event.target === event.currentTarget) setIsDraggingFiles(false);
      }}
      onDrop={handleDrop}
    >
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative rounded-xl bg-blue-800 p-3 text-white shadow-sm">
              <Bot size={22} />
              <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-emerald-500" />
            </div>
            <div>
              <h1 className="flex items-center gap-2 font-bold text-slate-900">
                {t('agentTitle')} <Sparkles size={14} className="text-blue-600" />
              </h1>
              <p className="text-xs text-slate-500">{application?.service || 'Certificates and scholarship help'} · everything stays in this chat</p>
            </div>
          </div>
          <div className="rounded-full bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800">
            {statusText[appStatus] || 'In this chat'}
          </div>
        </div>
        <div className="mx-auto mt-3 flex max-w-5xl items-center gap-2 overflow-x-auto pb-1">
          {FLOW_STEPS.map((step, index) => (
            <div key={step} className="flex min-w-0 flex-1 items-center gap-2">
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${index <= flowIndex ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-400'}`}>
                {index < flowIndex ? '✓' : index + 1}
              </span>
              <span className={`truncate text-[11px] font-semibold ${index <= flowIndex ? 'text-blue-800' : 'text-slate-400'}`}>{step}</span>
              {index < FLOW_STEPS.length - 1 && <span className={`h-0.5 min-w-2 flex-1 ${index < flowIndex ? 'bg-blue-700' : 'bg-slate-200'}`} />}
            </div>
          ))}
        </div>
      </header>

      <main className="relative flex-1 overflow-y-auto px-3 py-5 sm:px-6 sm:py-8">
        <div className="mx-auto flex max-w-4xl flex-col gap-4">
          {messages.map((message, index) => (
            <motion.div
              key={`${index}-${message.sender}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-2.5 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div className={`shrink-0 rounded-full p-2.5 text-white ${message.sender === 'user' ? 'bg-blue-800' : 'bg-violet-600'}`}>
                {message.sender === 'user' ? <UserIcon size={17} /> : <Bot size={17} />}
              </div>
              <div className={`max-w-[88%] rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm sm:max-w-[78%] ${message.sender === 'user' ? 'rounded-tr-sm bg-blue-800 text-white' : 'rounded-tl-sm border border-slate-200 bg-white text-slate-700'}`}>
                <p className="whitespace-pre-line">{message.text}</p>
                {message.statusReport && (
                  <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 p-3 text-slate-700">
                    <p className="font-semibold">{message.statusReport.service_name}</p>
                    <p className="mt-1 text-xs">Reference: <span className="font-mono font-bold">{message.statusReport.application_id}</span></p>
                    <p className="mt-1 text-xs">Current status: <span className="font-semibold">{String(message.statusReport.status || '').replace(/_/g, ' ')}</span></p>
                    {message.statusReport.status_history?.length > 0 && (
                      <ol className="mt-2 space-y-1 border-l border-blue-200 pl-3">
                        {message.statusReport.status_history.map((item, historyIndex) => (
                          <li key={`${item.status}-${historyIndex}`} className="text-xs">
                            <span className="font-semibold">{String(item.status || '').replace(/_/g, ' ')}</span>
                            {item.timestamp && <span className="ml-1 text-slate-500">· {formatTimestamp(item.timestamp)}</span>}
                          </li>
                        ))}
                      </ol>
                    )}
                  </div>
                )}
                {message.time && <p className={`mt-1 text-[10px] ${message.sender === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>{message.time}</p>}
              </div>
            </motion.div>
          ))}

          {isTyping && <div className="ml-12 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500 shadow-sm"><LoaderCircle size={16} className="animate-spin" /> Assistant is working…</div>}

          {requirements.length > 0 && !isSubmitted && (
            <section className="ml-0 rounded-2xl border border-blue-200 bg-white p-4 shadow-sm sm:ml-12">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-bold text-slate-900">{application?.service || 'Application'} documents</h2>
                  <p className="text-xs text-slate-500">Upload any one accepted type per required row. Optional rows will not stop the process.</p>
                </div>
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-800">
                  {requiredRequirements.filter((requirement) => documents.some((document) => requirement.accepted_documents?.includes(document.document_type))).length}/{requiredRequirements.length} required
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {requirements.map((requirement) => {
                  const matches = documents.filter((document) => requirement.accepted_documents?.includes(document.document_type));
                  return (
                    <div key={requirement.key} className="py-3 first:pt-1 last:pb-1">
                      <div className="flex items-start gap-2">
                        {matches.length ? <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-600" /> : <FileText size={17} className="mt-0.5 shrink-0 text-slate-400" />}
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-sm font-semibold text-slate-800">{requirement.label}</span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${requirement.required === false ? 'bg-slate-100 text-slate-500' : matches.length ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                              {requirement.required === false ? 'Optional' : matches.length ? 'Received' : 'Required'}
                            </span>
                          </div>
                          <p className="mt-0.5 text-xs text-slate-500">Any one: {(requirement.accepted_documents || []).map(formatLabel).join(', ')}</p>
                          {matches.length > 0 && <p className="mt-1 break-all text-xs text-emerald-800">{matches.map((document) => document.filename).join(', ')}</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {hasForm && (
            <section className="ml-0 overflow-hidden rounded-2xl border border-emerald-200 bg-white shadow-sm sm:ml-12">
              <div className="border-b border-emerald-100 bg-emerald-50 px-4 py-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-700" />
                  <div>
                    <h2 className="font-bold text-emerald-950">Your form · review it here</h2>
                    <p className="text-xs text-emerald-900">Edit a value here or send “Field name: value” in chat. Changes save automatically when you leave a field.</p>
                  </div>
                </div>
              </div>
              <div className="grid gap-4 p-4 sm:grid-cols-2">
                {formFieldEntries.map(([key, field]) => {
                  const value = formValues[key] ?? (field.value == null ? '' : String(field.value));
                  const missing = field.required !== false && !value.trim();
                  return (
                    <label key={key} className={key === 'address' ? 'sm:col-span-2' : ''}>
                      <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                        {field.label}
                        {field.required === false ? <span className="text-xs font-normal text-slate-500">Optional</span> : <span className="text-red-600">*</span>}
                      </span>
                      <input
                        value={value}
                        onChange={(event) => setFormEdits((previous) => ({ ...previous, [key]: event.target.value }))}
                        onBlur={() => { void saveFormValues(formValues).catch(() => {}); }}
                        disabled={isSubmitted || formSaving}
                        maxLength={500}
                        aria-invalid={missing}
                        className={`mt-1.5 w-full rounded-lg border px-3 py-2.5 text-sm outline-none focus:ring-2 ${missing ? 'border-amber-400 focus:border-amber-600 focus:ring-amber-100' : 'border-slate-300 focus:border-blue-600 focus:ring-blue-100'}`}
                      />
                      <span className="mt-1 block text-[11px] text-slate-500">
                        {field.status === 'USER_PROVIDED' ? 'You provided this' : value ? 'Read from your PDF' : missing ? 'Needed to finish the form' : 'Not provided'}
                      </span>
                    </label>
                  );
                })}
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 px-4 py-3">
                <p className={`text-xs font-semibold ${missingFormFields.length ? 'text-amber-800' : 'text-emerald-800'}`}>
                  {missingFormFields.length ? `${missingFormFields.length} required detail(s) still needed` : 'All required form details are filled'}
                </p>
                <p role="status" className="text-xs text-slate-500">{formSaving ? 'Saving…' : formSaveMessage || 'Edits save automatically'}</p>
              </div>
            </section>
          )}

          {isSubmitted && (
            <section className="ml-0 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 shadow-sm sm:ml-12" role="status">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-800">Local demo record saved</p>
              <p className="mt-1 text-lg font-bold text-emerald-950">{application?.service || 'Application'}</p>
              <p className="mt-2 text-sm text-emerald-900">Reference: <span className="font-mono font-bold">{application?.id || 'Unavailable'}</span></p>
              <p className="mt-2 text-xs text-emerald-800">This is a local demo record. No government agency was contacted.</p>
            </section>
          )}

          {isDraggingFiles && <div className="rounded-2xl border-2 border-dashed border-blue-500 bg-blue-50 p-6 text-center font-semibold text-blue-800">Drop PDF files here to attach them to this chat</div>}
          <div ref={messagesEndRef} />
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white px-3 py-3 sm:px-6 sm:py-4">
        <div className="mx-auto max-w-4xl">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf,.pdf"
            multiple
            className="hidden"
            onChange={(event) => { void handleUploadFiles(event.target.files); }}
          />
          <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-2 focus-within:border-blue-400 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100">
            <button
              type="button"
              aria-label="Attach PDF documents"
              title={application?.serviceId ? 'Attach PDF' : 'Tell me the service first'}
              onClick={() => fileInputRef.current?.click()}
              disabled={!application?.serviceId || uploading || isTyping || isSubmitted}
              className="rounded-xl p-2.5 text-slate-500 hover:bg-blue-50 hover:text-blue-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {uploading ? <LoaderCircle size={20} className="animate-spin" /> : <Paperclip size={20} />}
            </button>
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter' && !event.shiftKey) {
                  event.preventDefault();
                  void handleSend();
                }
              }}
              placeholder={listening ? `🎤 ${t('listening')}` : t('typeMessage')}
              disabled={isRestoring}
              className="min-w-0 flex-1 bg-transparent px-1 py-2 text-sm outline-none placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={handleMic}
              title="Voice input"
              className={`rounded-xl p-2.5 ${listening ? 'bg-red-100 text-red-700' : 'text-slate-500 hover:bg-slate-200'}`}
            >
              <Mic size={19} />
            </button>
            <button
              type="button"
              onClick={() => { void handleSend(); }}
              disabled={!input.trim() || isTyping || formSaving}
              aria-label="Send message"
              className="rounded-xl bg-blue-800 p-2.5 text-white hover:bg-blue-900 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {isTyping ? <LoaderCircle size={19} className="animate-spin" /> : <Send size={19} />}
            </button>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 px-1 text-[11px] text-slate-400">
            <span className="flex items-center gap-1"><Shield size={12} /> PDF attach karo ya chat me PDF drag-drop karo. PDF readability/type check hota hai, authenticity verification nahi.</span>
            {uploading && <span className="font-semibold text-blue-700">Uploading PDF…</span>}
          </div>
        </div>
      </footer>
    </div>
  );
}

function formatLabel(value) {
  return String(value || '')
    .split('_')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatTimestamp(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}

export default AgentWorkspace;
