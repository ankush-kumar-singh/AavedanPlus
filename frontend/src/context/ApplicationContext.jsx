import { useEffect, useRef, useState } from 'react';
import { useAuth } from './useAuth';
import { ApplicationContext } from './applicationContext';
import { sessionAPI } from '../services/api';
import { APP_STATUS } from './applicationStatus';

export function ApplicationProvider({ children }) {
  const [application, setApplicationState] = useState(null);
  const [documents, setDocumentsState] = useState([]);
  const [messages, setMessages] = useState([]);
  const [agentSteps, setAgentSteps] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  const [consent, setConsent] = useState('pending');
  const [appStatus, setAppStatus] = useState(APP_STATUS.IDLE);
  const restoreGeneration = useRef(0);
  const [restoredForUser, setRestoredForUser] = useState(null);
  const { user, loading: authLoading } = useAuth();
  const isRestoring =
    authLoading || (user?.id ?? null) !== restoredForUser;

  const setApplication = (nextApplication) => {
    restoreGeneration.current += 1;
    setApplicationState(nextApplication);
  };

  const setDocuments = (nextDocuments) => {
    setDocumentsState(nextDocuments);
  };

  useEffect(() => {
    if (authLoading || !user?.id) return undefined;

    const generation = restoreGeneration.current;
    let active = true;
    sessionAPI
      .get(user.id)
      .then(({ data }) => {
        if (!active || generation !== restoreGeneration.current) return;
        if (!data?.found) {
          setApplicationState(null);
          setDocumentsState([]);
          setMessages([]);
          setAgentSteps([]);
          setActivityFeed([]);
          setAppStatus(APP_STATUS.IDLE);
          setConsent('pending');
          return;
        }

        setMessages(
          (data.conversation_history || []).map((turn) => ({
            sender: turn.role === 'assistant' ? 'agent' : 'user',
            text: turn.content,
            time: '',
          }))
        );
        setAgentSteps([]);
        setActivityFeed([]);
        const formFields = data.form_data?.fields || {};
        setApplicationState({
          id: data.application_id || null,
          submittedAt: data.submitted_at || null,
          userId: user.id,
          serviceId: data.service,
          service: data.service_name || data.form_data?.service_name || data.service,
          applicant: {
            name:
              formFields.applicant_name?.value ||
              formFields.student_name?.value ||
              formFields.child_name?.value ||
              user.name || '',
          },
          formData: data.form_data || null,
          requiredDocuments: data.required_documents || [],
          validatedDocuments: data.validated_documents || {},
        });
        setDocumentsState(data.uploaded_documents || []);

        const status = data.application_status || data.current_step;
        const statusMap = {
          SERVICE_NOT_SUPPORTED: APP_STATUS.SERVICE_NOT_SUPPORTED,
          SUBMITTED: APP_STATUS.SUBMITTED,
          WAITING_CONSENT: APP_STATUS.WAITING_CONSENT,
          FORM_INCOMPLETE: APP_STATUS.FORM_INCOMPLETE,
          FORM_FILLED: APP_STATUS.FORM_READY,
          FORM_READY: APP_STATUS.FORM_READY,
          DOCUMENTS_PENDING: APP_STATUS.COLLECTING_DOCUMENTS,
          SUBMITTING: APP_STATUS.SUBMITTING,
          RETRYING: APP_STATUS.RECOVERING,
          HUMAN_ESCALATION: APP_STATUS.PORTAL_ERROR,
        };
        setAppStatus(statusMap[status] || APP_STATUS.REQUEST_RECEIVED);
        setConsent(data.consent_granted ? 'granted' : 'pending');
      })
      .catch(() => {
        // Keep the local screen usable when the backend is temporarily offline.
      })
      .finally(() => {
        if (active) setRestoredForUser(user.id);
      });

    return () => {
      active = false;
    };
  }, [user?.id, user?.name, authLoading]);

  const addActivity = (actor, text) => {
    const time = new Date().toLocaleTimeString('en-IN', { hour12: false });
    setActivityFeed((prev) => [...prev, { time, actor, text }]);
  };

  const addMessage = (sender, text, metadata = {}) => {
    setMessages((prev) => [...prev, { sender, text, ...metadata, time: new Date().toLocaleTimeString() }]);
  };

  return (
    <ApplicationContext.Provider value={{
      application, setApplication,
      documents, setDocuments,
      messages, setMessages, addMessage,
      agentSteps, setAgentSteps,
      activityFeed, setActivityFeed, addActivity,
      consent, setConsent,
      appStatus, setAppStatus,
      isRestoring,
    }}>
      {children}
    </ApplicationContext.Provider>
  );
}
