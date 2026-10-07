import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  FileText,
  CheckCircle2,
  Send,
  Building2,
  User,
  Bot,
  Settings,
  Clock,
  ArrowLeft,
  Download,
  Filter,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

function AuditLog() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [filter, setFilter] = useState('all');

  const activities = [
    { time: '17:30:12', actor: 'USER', action: 'Started Income Certificate application', icon: User, color: 'blue' },
    { time: '17:30:15', actor: 'AGENT', action: 'Welcome message sent to user', icon: Bot, color: 'purple' },
    { time: '17:30:48', actor: 'USER', action: 'Responded to agent: "Haan, mere paas documents hain"', icon: User, color: 'blue' },
    { time: '17:31:02', actor: 'AGENT', action: 'Requested document upload', icon: Bot, color: 'purple' },
    { time: '17:33:20', actor: 'USER', action: 'Navigated to Documents page', icon: User, color: 'blue' },
    { time: '17:33:45', actor: 'SYSTEM', action: 'Aadhaar Card validated', icon: CheckCircle2, color: 'green' },
    { time: '17:33:48', actor: 'SYSTEM', action: 'Salary Slip validated', icon: CheckCircle2, color: 'green' },
    { time: '17:34:10', actor: 'USER', action: 'Uploaded Self Declaration', icon: User, color: 'blue' },
    { time: '17:34:12', actor: 'SYSTEM', action: 'Self Declaration validated', icon: CheckCircle2, color: 'green' },
    { time: '17:35:00', actor: 'SYSTEM', action: 'All documents validated — proceeding to review', icon: CheckCircle2, color: 'green' },
    { time: '17:35:30', actor: 'USER', action: 'Reviewed application form', icon: User, color: 'blue' },
    { time: '17:36:00', actor: 'SYSTEM', action: 'Application reviewed — proceeding to consent', icon: FileText, color: 'green' },
    { time: '17:40:15', actor: 'USER', action: 'Consent granted', icon: User, color: 'blue' },
    { time: '17:40:16', actor: 'AGENT', action: 'Notified: submitting to government portal', icon: Bot, color: 'purple' },
    { time: '17:41:00', actor: 'SYSTEM', action: 'Connecting to portal...', icon: Settings, color: 'amber' },
    { time: '17:41:05', actor: 'SYSTEM', action: 'Verifying documents with portal', icon: Settings, color: 'amber' },
    { time: '17:41:10', actor: 'SYSTEM', action: 'Validating consent', icon: Settings, color: 'amber' },
    { time: '17:41:15', actor: 'PORTAL', action: 'Application received successfully', icon: Building2, color: 'green' },
    { time: '17:41:20', actor: 'SYSTEM', action: 'Application submitted — Status: SUBMITTED', icon: Send, color: 'green' },
    { time: '17:42:00', actor: 'USER', action: 'Viewed application status', icon: User, color: 'blue' },
  ];

  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    purple: 'bg-purple-50 text-purple-600 border-purple-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    amber: 'bg-amber-50 text-amber-600 border-amber-200',
  };

  const badgeMap = {
    USER: 'bg-blue-100 text-blue-700',
    AGENT: 'bg-purple-100 text-purple-700',
    SYSTEM: 'bg-gray-100 text-gray-700',
    PORTAL: 'bg-green-100 text-green-700',
  };

  const filters = [
    { key: 'all', label: t('all') },
    { key: 'USER', label: t('user') },
    { key: 'AGENT', label: t('agent') },
    { key: 'SYSTEM', label: t('system') },
    { key: 'PORTAL', label: t('portal') },
  ];

  const filtered =
    filter === 'all' ? activities : activities.filter((a) => a.actor === filter);

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-primary">
              📋 {t('auditTitle')}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {t('auditSubtitle')} · APP-2026-1234
            </p>
          </div>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition"
          >
            <ArrowLeft size={14} /> {t('navHome')}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 mb-6 text-white"
        >
          <div className="flex items-center gap-3 mb-3">
            <Activity size={24} />
            <h2 className="text-xl font-bold">{t('activitySummary')}</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div>
              <p className="text-xs text-blue-100 uppercase tracking-wide">
                {t('totalEvents')}
              </p>
              <p className="text-2xl font-bold mt-1">{activities.length}</p>
            </div>
            <div>
              <p className="text-xs text-blue-100 uppercase tracking-wide">
                {t('userActions')}
              </p>
              <p className="text-2xl font-bold mt-1">
                {activities.filter((a) => a.actor === 'USER').length}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-100 uppercase tracking-wide">
                {t('agentActions')}
              </p>
              <p className="text-2xl font-bold mt-1">
                {activities.filter((a) => a.actor === 'AGENT').length}
              </p>
            </div>
            <div>
              <p className="text-xs text-blue-100 uppercase tracking-wide">
                {t('duration')}
              </p>
              <p className="text-2xl font-bold mt-1">12 min</p>
            </div>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 flex items-center gap-3 flex-wrap"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Filter size={16} />
            {t('filter')}
          </div>
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${
                filter === f.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-primary">{t('activityTimeline')}</h3>
            <span className="text-xs text-gray-500">
              {filtered.length} {t('events')}
            </span>
          </div>

          <div className="space-y-3">
            {filtered.map((item, i) => {
              const Icon = item.icon;
              const isLast = i === filtered.length - 1;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.02 }}
                  className="flex items-start gap-3 relative"
                >
                  {!isLast && (
                    <div className="absolute left-[15px] top-8 bottom-0 w-px bg-gray-200" />
                  )}

                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border ${colorMap[item.color]} z-10`}
                  >
                    <Icon size={14} />
                  </div>

                  <div className="flex-1 pb-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${badgeMap[item.actor]}`}
                      >
                        {item.actor}
                      </span>
                      <span className="text-xs text-gray-400 flex items-center gap-1">
                        <Clock size={10} />
                        {item.time}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 mt-1">{item.action}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Export */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 flex justify-end"
        >
          <button className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition">
            <Download size={16} /> {t('exportAudit')}
          </button>
        </motion.div>
      </main>
    </div>
  );
}

export default AuditLog;