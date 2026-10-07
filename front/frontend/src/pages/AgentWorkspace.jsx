import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mic, Send, Bot, User as UserIcon, RotateCcw } from 'lucide-react';
import { useApplication, APP_STATUS } from '../context/ApplicationContext';
import { useLanguage } from '../context/LanguageContext';

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
  } = useApplication();
  const { t } = useLanguage();

  const [input, setInput] = useState('');
  const [listening, setListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const hasWelcomed = useRef(false);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Welcome message (only once, translated)
  useEffect(() => {
    if (!hasWelcomed.current && messages.length === 0) {
      hasWelcomed.current = true;
      const serviceName = application?.service || t('incomeCert');
      const welcome = t('agentWelcomeBody', { service: serviceName });
      setTimeout(() => {
        addMessage('agent', welcome);
        addActivity('AGENT', 'Welcome message sent');
      }, 500);
    }
  }, []); // eslint-disable-line

  const handleSend = (text) => {
    const msg = text || input.trim();
    if (!msg) return;

    addMessage('user', msg);
    addActivity('USER', msg);
    setInput('');

    setIsTyping(true);
    setAppStatus(APP_STATUS.COLLECTING_DOCUMENTS);

    setTimeout(() => {
      setIsTyping(false);
      let reply = '';

      const lower = msg.toLowerCase();
      if (lower.includes('haan') || lower.includes('yes') || lower.includes('hai')) {
        reply = t('agentYesReply');
      } else if (lower.includes('nahi') || lower.includes('no')) {
        reply = t('agentNoReply');
      } else {
        reply = t('agentGenericReply', { msg });
      }

      setTimeout(() => {
        addMessage('agent', reply);
        addActivity('AGENT', 'Replied to user');
      }, 200);
    }, 1500);
  };

  const handleMic = () => {
    setListening(true);
    setTimeout(() => {
      setInput(t('agentYesReply').split('.')[0]);
      setListening(false);
    }, 2000);
  };

  const handleReset = () => {
    setMessages([]);
    setAppStatus(APP_STATUS.IDLE);
    addActivity('SYSTEM', 'Chat reset');
    hasWelcomed.current = false;
  };

  const statusColors = {
    [APP_STATUS.IDLE]: { bg: '#f1f5f9', color: '#64748b', key: 'statusIdle' },
    [APP_STATUS.REQUEST_RECEIVED]: { bg: '#dbeafe', color: '#1d4ed8', key: 'statusRequestReceived' },
    [APP_STATUS.COLLECTING_DOCUMENTS]: { bg: '#fef3c7', color: '#b45309', key: 'statusCollectingDocs' },
    [APP_STATUS.VALIDATING_DOCUMENTS]: { bg: '#fef3c7', color: '#b45309', key: 'statusValidating' },
    [APP_STATUS.FORM_READY]: { bg: '#d1fae5', color: '#065f46', key: 'statusFormReady' },
    [APP_STATUS.WAITING_CONSENT]: { bg: '#e0e7ff', color: '#4338ca', key: 'statusWaitingConsent' },
    [APP_STATUS.SUBMITTING]: { bg: '#fce7f3', color: '#9d174d', key: 'statusSubmitting' },
    [APP_STATUS.SUBMITTED]: { bg: '#d1fae5', color: '#065f46', key: 'statusSubmitted' },
  };
  const statusStyle = statusColors[appStatus] || statusColors[APP_STATUS.IDLE];

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Bot size={22} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-primary">
                {t('agentTitle')}
              </h1>
              <p className="text-xs text-gray-500">
                {application?.service || t('incomeCert')} · {t('agentSubtitle')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span
              style={{
                background: statusStyle.bg,
                color: statusStyle.color,
                padding: '6px 14px',
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              ● {t(statusStyle.key)}
            </span>
            <button
              onClick={handleReset}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-600"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
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
                className={`max-w-[75%] px-4 py-3 rounded-2xl whitespace-pre-line text-sm leading-relaxed ${
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-start gap-3"
            >
              <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
                <Bot size={18} />
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  />
                  <span
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Quick Actions */}
      <div className="max-w-3xl mx-auto w-full px-6">
        <div className="flex gap-2 mb-3 flex-wrap">
          <button
            onClick={() => navigate('/documents')}
            className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            📄 {t('uploadDocuments')}
          </button>
          <button
            onClick={() => navigate('/review')}
            className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700"
          >
            📝 {t('reviewApplication')}
          </button>
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-2 bg-gray-50 rounded-2xl border border-gray-200 p-2 pl-4 focus-within:ring-2 focus-within:ring-blue-200 focus-within:border-blue-400 transition">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={listening ? `🎤 ${t('listening')}` : t('typeMessage')}
            className="flex-1 outline-none text-gray-700 placeholder:text-gray-400 bg-transparent py-2"
          />
          <button
            onClick={handleMic}
            className={`p-2.5 rounded-xl transition ${
              listening
                ? 'bg-red-100 text-red-600 animate-pulse'
                : 'text-gray-500 hover:bg-gray-200'
            }`}
          >
            <Mic size={18} />
          </button>
          <button
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AgentWorkspace;