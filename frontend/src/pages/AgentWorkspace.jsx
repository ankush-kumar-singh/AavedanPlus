import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bot, Mic, RotateCcw, Send, User as UserIcon } from 'lucide-react';
import { useApplication, APP_STATUS } from '../context/ApplicationContext';
import { chatAPI, sessionAPI } from '../services/api';

const USER_ID = 'frontend_user';

function AgentWorkspace() {
  const navigate = useNavigate();
  const {
    application,
    messages,
    setMessages,
    addMessage,
    appStatus,
    setAppStatus,
    addActivity,
    applyBackendResponse,
    resetApplication,
  } = useApplication();

  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    if (messages.length === 0) {
      sendToBackend('I want to apply for an income certificate', true);
    }
    // This intentionally runs once for a new frontend session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const sendToBackend = async (message, silent = false, documents = []) => {
    if (!message.trim()) return;

    if (!silent) {
      addMessage('user', message);
      addActivity('USER', message);
    }

    setInput('');
    setError('');
    setIsTyping(true);

    try {
      const response = await chatAPI.send({
        userId: USER_ID,
        message,
        documents,
      });

      const data = response.data;
      applyBackendResponse(data);

      if (data.message) {
        addMessage('agent', data.message);
        addActivity('AGENT', 'Backend agent response received');
      }

      if (data.current_step === 'WAITING_CONSENT') {
        setAppStatus(APP_STATUS.WAITING_CONSENT);
      }

      if (data.application_id && data.application_status === 'SUBMITTED') {
        addActivity('SYSTEM', `Application submitted: ${data.application_id}`);
      }
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Could not connect to the Aavedan+ backend. Make sure FastAPI and Ollama are running.';
      setError(message);
      addActivity('SYSTEM', 'Backend connection failed');
    } finally {
      setIsTyping(false);
    }
  };

  const handleSend = () => sendToBackend(input);

  const handleMic = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      setError('Voice input is not supported by this browser.');
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => {
      setListening(false);
      setError('Voice input could not be captured.');
    };
    recognition.onresult = (event) => {
      setInput(event.results[0][0].transcript);
    };
    recognition.start();
  };

  const handleReset = async () => {
    try {
      await sessionAPI.clear(USER_ID);
    } catch {
      // The local UI is reset even if the backend session is already gone.
    }
    resetApplication();
    setMessages([]);
  };

  const statusLabel = {
    [APP_STATUS.IDLE]: 'Ready',
    [APP_STATUS.COLLECTING_DOCUMENTS]: 'Collecting documents',
    [APP_STATUS.VALIDATING_DOCUMENTS]: 'Validating documents',
    [APP_STATUS.FORM_READY]: 'Form ready',
    [APP_STATUS.WAITING_CONSENT]: 'Waiting for consent',
    [APP_STATUS.SUBMITTING]: 'Submitting',
    [APP_STATUS.SUBMITTED]: 'Submitted',
    [APP_STATUS.UNDER_REVIEW]: 'Under review',
    [APP_STATUS.APPROVED]: 'Approved',
    [APP_STATUS.REJECTED]: 'Rejected',
    [APP_STATUS.HUMAN_ESCALATION]: 'Human escalation',
  }[appStatus] || 'Processing';

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Bot size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary">Aavedan+ AI Agent</h1>
              <p className="text-xs text-gray-500">
                {application?.service || 'Income Certificate'} · Local AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-xs font-semibold">
              ● {statusLabel}
            </span>
            <button
              onClick={handleReset}
              title="Reset conversation"
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-600"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, index) => (
            <motion.div
              key={`${msg.time}-${index}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-purple-100 text-purple-700'
                }`}
              >
                {msg.sender === 'user' ? <UserIcon size={18} /> : <Bot size={18} />}
              </div>

              <div
                className={`max-w-[78%] px-4 py-3 rounded-2xl whitespace-pre-line text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-sm'
                    : 'bg-white text-gray-700 border border-gray-200 rounded-tl-sm shadow-sm'
                }`}
              >
                {msg.text}
                <div
                  className={`text-[10px] mt-1 ${
                    msg.sender === 'user' ? 'text-blue-100' : 'text-gray-400'
                  }`}
                >
                  {msg.time}
                </div>
              </div>
            </motion.div>
          ))}

          {isTyping && (
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
                <Bot size={18} />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:100ms]" />
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:200ms]" />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
              {error}
            </div>
          )}

          <div ref={endRef} />
        </div>
      </main>

      <div className="max-w-3xl mx-auto w-full px-6 pb-3">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => navigate('/documents')}
            className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            📄 Documents
          </button>
          {application?.id && (
            <button
              onClick={() => navigate('/status')}
              className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              📊 Track application
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-2 bg-gray-50 rounded-2xl border border-gray-200 p-2 pl-4">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => event.key === 'Enter' && handleSend()}
            placeholder="Type your response..."
            className="flex-1 outline-none text-gray-700 placeholder:text-gray-400 bg-transparent py-2"
          />
          <button
            onClick={handleMic}
            className={`p-2.5 rounded-xl ${
              listening
                ? 'bg-red-100 text-red-600 animate-pulse'
                : 'text-gray-500 hover:bg-gray-200'
            }`}
          >
            <Mic size={18} />
          </button>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isTyping}
            className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AgentWorkspace;
