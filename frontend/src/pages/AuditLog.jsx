import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Bot,
  Building2,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Filter,
  Send,
  User,
} from 'lucide-react';
import { useLanguage } from '../context/useLanguage';
import { useApplication } from '../context/useApplication';
import { useAuth } from '../context/useAuth';
import { auditAPI } from '../services/api';

const ACTOR_ICONS = {
  USER: User,
  AGENT: Bot,
  SYSTEM: SettingsIcon,
  PORTAL: Building2,
};

function AuditLog() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { application } = useApplication();
  const { user } = useAuth();
  const [filter, setFilter] = useState('all');
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (!user?.id) return () => { active = false; };

    auditAPI
      .get(user.id)
      .then(({ data }) => {
        if (!active) return;
        setEvents(Array.isArray(data.events) ? data.events : []);
        setError('');
      })
      .catch(() => {
        if (active) setError('Could not load audit events from the backend.');
      });

    return () => {
      active = false;
    };
  }, [user?.id]);

  const currentSessionEvents = useMemo(() => {
    const latestSessionStart = events.map((event) => event.event).lastIndexOf('SESSION_STARTED');
    return latestSessionStart >= 0 ? events.slice(latestSessionStart) : events;
  }, [events]);
  const filteredEvents = useMemo(
    () => filter === 'all'
      ? currentSessionEvents
      : currentSessionEvents.filter((event) => event.actor === filter),
    [currentSessionEvents, filter]
  );
  const userCount = currentSessionEvents.filter((event) => event.actor === 'USER').length;
  const systemCount = currentSessionEvents.filter((event) => event.actor === 'SYSTEM').length;
  const portalCount = currentSessionEvents.filter((event) => event.actor === 'PORTAL').length;
  const duration = getDuration(currentSessionEvents);

  const exportAudit = () => {
    if (!currentSessionEvents.length) return;
    const content = JSON.stringify(
      {
        exported_at: new Date().toISOString(),
        application_id: application?.id || null,
        events: currentSessionEvents,
      },
      null,
      2
    );
    const blob = new Blob([content], { type: 'application/json' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `aavedan-audit-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(downloadUrl);
  };

  const filters = [
    { key: 'all', label: t('all') },
    { key: 'USER', label: t('user') },
    { key: 'SYSTEM', label: t('system') },
    { key: 'PORTAL', label: 'Demo portal' },
  ];

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 px-6 py-4">
          <div>
            <h1 className="text-xl font-bold text-primary">📋 {t('auditTitle')}</h1>
            <p className="mt-0.5 text-xs text-gray-500">
              {t('auditSubtitle')} · {application?.id || 'No application ID yet'}
            </p>
          </div>
          <button type="button" onClick={() => navigate('/')} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
            <ArrowLeft size={14} /> {t('navHome')}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        {error && (
          <div role="alert" className="mb-5 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <AlertCircle size={18} className="mt-0.5 shrink-0" /> {error}
          </div>
        )}

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-2xl bg-gradient-to-r from-blue-700 to-blue-800 p-6 text-white">
          <div className="mb-3 flex items-center gap-3">
            <Activity size={24} />
            <h2 className="text-xl font-bold">{t('activitySummary')}</h2>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            <Summary label={t('totalEvents')} value={currentSessionEvents.length} />
            <Summary label={t('userActions')} value={userCount} />
            <Summary label={t('systemActions')} value={systemCount} />
            <Summary label="Demo portal" value={portalCount} />
          </div>
          <p className="mt-4 text-sm text-blue-100">Recorded activity span: {duration}</p>
        </motion.section>

        <section className="mb-6 flex flex-wrap items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4">
          <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <Filter size={16} /> {t('filter')}
          </div>
          {filters.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setFilter(item.key)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition ${filter === item.key ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {item.label}
            </button>
          ))}
        </section>

        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-6 flex items-center justify-between">
              <h3 className="font-bold text-primary">{t('activityTimeline')}</h3>
              <span className="text-xs text-gray-500">{filteredEvents.length} {t('events')} in this application</span>
          </div>
          {filteredEvents.length ? (
            <div className="space-y-3">
              {filteredEvents.map((event) => {
                const Icon = eventIcon(event.event, event.actor);
                return (
                  <motion.div key={event.event_id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-start gap-3 border-b border-gray-100 pb-3 last:border-0">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${actorColor(event.actor)}`}>
                      <Icon size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${actorBadge(event.actor)}`}>{event.actor}</span>
                        <span className="flex items-center gap-1 text-xs text-gray-400"><Clock size={10} />{formatTimestamp(event.timestamp)}</span>
                      </div>
                      <p className="mt-1 text-sm text-gray-700">{describeEvent(event)}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-gray-500">
              {error ? 'Audit events are unavailable.' : 'No audit events have been recorded for this account yet.'}
            </p>
          )}
        </section>

        <div className="mt-6 flex justify-end">
            <button type="button" onClick={exportAudit} disabled={!currentSessionEvents.length} className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
            <Download size={16} /> {t('exportAudit')}
          </button>
        </div>
      </main>
    </div>
  );
}

function Summary({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-blue-100">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function SettingsIcon({ size = 14 }) {
  return <FileText size={size} />;
}

function eventIcon(eventName, actor) {
  if (eventName.includes('DOCUMENT') || eventName === 'FORM_SAVED') return FileText;
  if (eventName.includes('SUBMISSION')) return Send;
  if (actor === 'PORTAL') return Building2;
  return ACTOR_ICONS[actor] || CheckCircle2;
}

function actorColor(actor) {
  return {
    USER: 'border-blue-200 bg-blue-50 text-blue-600',
    AGENT: 'border-purple-200 bg-purple-50 text-purple-600',
    SYSTEM: 'border-gray-200 bg-gray-50 text-gray-600',
    PORTAL: 'border-green-200 bg-green-50 text-green-600',
  }[actor] || 'border-gray-200 bg-gray-50 text-gray-600';
}

function actorBadge(actor) {
  return {
    USER: 'bg-blue-100 text-blue-700',
    AGENT: 'bg-purple-100 text-purple-700',
    SYSTEM: 'bg-gray-100 text-gray-700',
    PORTAL: 'bg-green-100 text-green-700',
  }[actor] || 'bg-gray-100 text-gray-700';
}

function describeEvent(event) {
  const details = event.details || {};
  switch (event.event) {
    case 'SESSION_STARTED':
      return `Started a ${formatLabel(details.service || 'service')} application session.`;
    case 'SERVICE_SWITCHED':
      return `Switched the active application from ${formatLabel(details.from || 'previous service')} to ${formatLabel(details.to || 'new service')}.`;
    case 'DOCUMENT_UPLOADED':
      return `Uploaded ${details.filename || 'a document'} (${formatLabel(details.document_type)}); the PDF was readable.`;
    case 'DOCUMENT_REJECTED':
      return `A document upload was rejected: ${details.reason || 'the file could not be processed'}.`;
    case 'FORM_SAVED':
      return `Saved application details. ${details.missing_required_fields || 0} required field(s) remain incomplete.`;
    case 'CONSENT_GRANTED':
      return 'Granted consent to submit the application to the demo portal.';
    case 'WORKFLOW_STEP_CHANGED':
      return `Workflow moved from ${formatLabel(details.from || 'start')} to ${formatLabel(details.to || 'unknown')}.`;
    case 'DEMO_SUBMISSION_COMPLETED':
      return `Demo submission completed${details.application_id ? ` with reference ${details.application_id}` : ''}. No real government portal was contacted.`;
    case 'SUBMISSION_RETRY_LIMIT_REACHED':
    case 'HUMAN_ESCALATION':
      return 'The demo submission retry limit was reached. No human helper or government service was contacted.';
    case 'SESSION_CLEARED':
      return 'Cleared the active application session.';
    default:
      return formatLabel(event.event);
  }
}

function formatLabel(value) {
  return String(value || '')
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function formatTimestamp(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Time unavailable' : date.toLocaleString('en-IN');
}

function getDuration(events) {
  const timestamps = events
    .map((event) => new Date(event.timestamp).getTime())
    .filter(Number.isFinite);
  if (timestamps.length < 2) return '—';
  const minutes = Math.max(0, Math.round((Math.max(...timestamps) - Math.min(...timestamps)) / 60000));
  return `${minutes} min`;
}

export default AuditLog;
