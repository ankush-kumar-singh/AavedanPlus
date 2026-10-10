import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  RefreshCw,
} from 'lucide-react';
import { useApplication } from '../context/useApplication';
import { useLanguage } from '../context/useLanguage';
import { statusAPI } from '../services/api';

function ApplicationStatus() {
  const navigate = useNavigate();
  const { application, documents, isRestoring } = useApplication();
  const { t } = useLanguage();
  const applicationId = application?.id;
  const [liveStatus, setLiveStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [copyMessage, setCopyMessage] = useState('');

  const refreshStatus = async () => {
    if (!applicationId) return;
    setLoadingStatus(true);
    setStatusMessage('');
    try {
      const response = await statusAPI.get(applicationId);
      if (response.data?.found) {
        setLiveStatus(response.data);
      } else {
        setLiveStatus(null);
        setStatusMessage(response.data?.message || 'Application status is unavailable.');
      }
    } catch {
      setLiveStatus(null);
      setStatusMessage('Could not load status from the demo backend.');
    } finally {
      setLoadingStatus(false);
    }
  };

  useEffect(() => {
    if (isRestoring || !applicationId) return undefined;

    let active = true;
    const loadInitialStatus = async () => {
      try {
        const response = await statusAPI.get(applicationId);
        if (!active) return;
        if (response.data?.found) {
          setLiveStatus(response.data);
          setStatusMessage('');
        } else {
          setLiveStatus(null);
          setStatusMessage(response.data?.message || 'Application status is unavailable.');
        }
      } catch {
        if (!active) return;
        setLiveStatus(null);
        setStatusMessage('Could not load status from the demo backend.');
      }
    };

    void loadInitialStatus();
    return () => {
      active = false;
    };
  }, [applicationId, isRestoring]);

  const isLoadingStatus = loadingStatus ||
    (!isRestoring && Boolean(applicationId) && !liveStatus && !statusMessage);

  const visibleStatusMessage = statusMessage ||
    (!applicationId ? 'No submitted demo application is selected.' : '');

  const copyApplicationId = async () => {
    if (!liveStatus?.application_id) return;
    try {
      await navigator.clipboard.writeText(liveStatus.application_id);
      setCopyMessage('Demo reference copied.');
    } catch {
      setCopyMessage('Clipboard access is unavailable in this browser.');
    }
  };

  const downloadRecord = () => {
    if (!liveStatus) return;
    const receipt = {
      type: 'Aavedan+ demo application status',
      ...liveStatus,
      notice: 'This status belongs to a local mock portal and is not a real government application status.',
    };
    const blob = new Blob([JSON.stringify(receipt, null, 2)], {
      type: 'application/json',
    });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${liveStatus.application_id}-demo-status.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(downloadUrl), 0);
  };

  const applicantName =
    liveStatus?.applicant_name ||
    application?.applicant?.name ||
    application?.formData?.fields?.applicant_name?.value ||
    application?.formData?.fields?.student_name?.value ||
    application?.formData?.fields?.child_name?.value ||
    'Not available';
  const statusTone = toneForStatus(liveStatus?.status);

  if (isRestoring) {
    return <LoadingCard message="Restoring your saved application…" />;
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold text-primary">📊 {t('statusTitle')}</h1>
            <p className="mt-0.5 text-xs text-gray-500">Aavedan+ demo status</p>
          </div>
          <button type="button" onClick={() => navigate('/')} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
            <ArrowLeft size={14} /> {t('navHome')}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-8">
        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className={`mb-6 rounded-2xl border p-6 ${statusTone.card}`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium">Status recorded by the mock portal</p>
              <h2 className="mt-1 text-3xl font-bold">
                {isLoadingStatus ? 'Loading…' : liveStatus?.status || 'Status unavailable'}
              </h2>
              <p className="mt-1 text-sm">
                {liveStatus?.service_name || application?.service || 'Service unavailable'}
                {liveStatus?.submitted_at ? ` · ${formatDate(liveStatus.submitted_at)}` : ''}
              </p>
            </div>
            <div className="rounded-xl bg-white/60 p-4 text-right">
              <p className="text-xs">Demo reference</p>
              <p className="mt-1 break-all font-mono text-lg font-bold">
                {liveStatus?.application_id || application?.id || '—'}
              </p>
            </div>
          </div>
        </motion.section>

        {visibleStatusMessage && (
          <div role="status" className="mb-6 flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <AlertCircle size={18} className="mt-0.5 shrink-0" /> {visibleStatusMessage}
          </div>
        )}

        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-6">
          <h3 className="mb-4 font-bold text-primary">{t('appDetails')}</h3>
          <div className="grid gap-x-8 sm:grid-cols-2">
            <InfoRow label={t('applicant')} value={applicantName} />
            <InfoRow label={t('service')} value={liveStatus?.service_name || application?.service || '—'} />
            <InfoRow label="Demo reference" value={liveStatus?.application_id || application?.id || '—'} />
            <InfoRow label={t('submittedOn')} value={liveStatus?.submitted_at ? formatDate(liveStatus.submitted_at) : '—'} />
            <InfoRow label={t('documentsCount')} value={documents.length} />
            <InfoRow label={t('consentLabel')} value={liveStatus ? 'Granted before demo submission' : '—'} />
          </div>
        </section>

        <section className="mb-6 rounded-2xl border border-gray-200 bg-white p-6">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-primary">Recorded status history</h3>
              <p className="mt-1 text-xs text-gray-500">Only status changes stored by the demo backend are shown.</p>
            </div>
            <Clock size={18} className="text-blue-700" />
          </div>
          {liveStatus?.status_history?.length ? (
            <ol className="space-y-4">
              {liveStatus.status_history.map((item, index) => (
                <li key={`${item.status}-${item.timestamp}-${index}`} className="flex gap-3">
                  <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-green-700" />
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{formatLabel(item.status)}</p>
                    <p className="mt-0.5 text-xs text-gray-500">{formatDate(item.timestamp)}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-sm text-gray-600">No status history is available.</p>
          )}
        </section>

        <aside className="mb-6 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
          This project records status in a local mock portal. It does not contact a government service, so this page cannot show an official application status or processing time.
        </aside>

        <div className="flex flex-wrap justify-end gap-3">
          <button type="button" onClick={refreshStatus} disabled={isLoadingStatus || !applicationId} className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
            <RefreshCw size={16} className={isLoadingStatus ? 'animate-spin' : ''} /> Refresh status
          </button>
          <button type="button" onClick={copyApplicationId} disabled={!liveStatus?.application_id} className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50">
            <Copy size={16} /> Copy demo reference
          </button>
          <button type="button" onClick={downloadRecord} disabled={!liveStatus} className="inline-flex items-center gap-2 rounded-xl bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-gray-300">
            <Download size={16} /> Download demo status
          </button>
        </div>
        {copyMessage && <p role="status" className="mt-3 text-right text-sm text-gray-600">{copyMessage}</p>}
      </main>
    </div>
  );
}

function LoadingCard({ message }) {
  return (
    <main className="min-h-screen bg-slate-50 p-8">
      <div role="status" className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-600">{message}</div>
    </main>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-gray-100 py-3 last:border-0">
      <p className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</p>
      <p className="break-words text-right text-sm font-semibold text-gray-800">{value}</p>
    </div>
  );
}

function toneForStatus(status) {
  if (status === 'APPROVED') return { card: 'border-green-200 bg-green-700 text-white' };
  if (status === 'REJECTED') return { card: 'border-red-200 bg-red-700 text-white' };
  if (status) return { card: 'border-blue-200 bg-blue-700 text-white' };
  return { card: 'border-slate-200 bg-slate-200 text-slate-800' };
}

function formatLabel(value) {
  return String(value || '')
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Time unavailable' : date.toLocaleString('en-IN');
}

export default ApplicationStatus;
