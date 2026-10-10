import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  FileText,
  User,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  Send,
} from 'lucide-react';
import { useApplication } from '../context/useApplication';
import { useLanguage } from '../context/useLanguage';
import { useAuth } from '../context/useAuth';
import { chatAPI } from '../services/api';

function Consent() {
  const navigate = useNavigate();
  const {
    application,
    setApplication,
    addActivity,
    addMessage,
    setAppStatus,
    setConsent,
    appStatus,
    documents,
    isRestoring,
  } = useApplication();
  const { t } = useLanguage();
  const { user } = useAuth();

  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const canShowConsent =
    Boolean(application?.formData) &&
    ['WAITING_CONSENT', 'SUBMITTING', 'PORTAL_ERROR', 'SUBMITTED'].includes(appStatus);
  const serviceName = application?.service || 'Service not selected';
  const formFields = application?.formData?.fields || {};
  const applicantName =
    formFields.applicant_name?.value ||
    formFields.student_name?.value ||
    formFields.child_name?.value ||
    application?.applicant?.name ||
    'Not available';
  const appId = application?.id || 'Assigned after submission';

  useEffect(() => {
    if (isRestoring) return;
    if (!canShowConsent) navigate('/review', { replace: true });
  }, [canShowConsent, isRestoring, navigate]);

  const handleApprove = async () => {
    if (
      !canShowConsent ||
      !['WAITING_CONSENT', 'PORTAL_ERROR'].includes(appStatus) ||
      !agreed ||
      submitting
    ) return;

    setSubmitting(true);
    setSubmitError('');
    setConsent('granted');
    setAppStatus('SUBMITTING');
    addActivity('USER', 'Consent granted');
    addMessage('agent', t('submittingTitle'));

    try {
      const response = await chatAPI.send({
        userId: user?.id,
        serviceId: application?.serviceId,
        message: 'yes',
      });

      const data = response.data || {};

      if (data.message) {
        addMessage('agent', data.message);
      }

      if (data.application_status !== 'SUBMITTED' || !data.application_id) {
        const message = data.message ||
          'The backend has not confirmed a submission. Please resolve the pending steps first.';
        setSubmitError(message);
        setConsent('pending');
        setAppStatus(
          data.current_step === 'HUMAN_ESCALATION'
            ? 'PORTAL_ERROR'
            : data.current_step || 'PORTAL_ERROR'
        );
        setSubmitting(false);
        return;
      }

      setApplication((previous) => ({
        ...(previous || {}),
        id: data.application_id,
        submittedAt: data.submitted_at || null,
        serviceId: data.service || previous?.serviceId,
        service: data.service_name || previous?.service,
      }));
      setAppStatus('SUBMITTED');
      addActivity('SYSTEM', `Application submitted: ${data.application_id}`);
      navigate('/portal');
    } catch (error) {
      const detail =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        'Application submit nahi ho saka.';

      addMessage('agent', detail);
      addActivity('SYSTEM', 'Application submission failed');
      setAppStatus('PORTAL_ERROR');
      setConsent('pending');
      setSubmitError(detail);
      setSubmitting(false);
    }
  };

  if (isRestoring || !canShowConsent) return null;

  const documentSummary = documents.length
    ? documents.map((document) => `${document.filename} (${formatLabel(document.document_type)})`).join(', ')
    : 'No document details available';

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-primary">
              ✅ {t('consentTitle')}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {t('consentSubtitle')}
            </p>
          </div>
          <button
            onClick={() => navigate('/review')}
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition"
          >
            <ArrowLeft size={14} /> {t('back')}
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Info banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6 flex items-start gap-3"
        >
          <ShieldCheck
            className="text-blue-600 flex-shrink-0 mt-0.5"
            size={20}
          />
          <div>
            <p className="text-sm font-semibold text-blue-900">
              {t('consentReady')}
            </p>
            <p className="text-sm text-blue-700 mt-1">
              {t('consentReadyDesc')}
            </p>
          </div>
        </motion.div>

        {submitError && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"
          >
            {submitError}
          </div>
        )}

        {/* Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 mb-6"
        >
          <h3 className="font-bold text-primary mb-5">
            {t('applicationSummary')}
          </h3>

          <div className="space-y-4">
            <SummaryRow
              icon={FileText}
              label={t('service')}
              value={serviceName}
            />
            <SummaryRow
              icon={User}
              label={t('applicant')}
              value={applicantName}
            />
            <SummaryRow
              icon={CheckCircle2}
              label={t('documentsLabel')}
              value={documentSummary}
            />
            <SummaryRow
              icon={FileText}
              label={t('applicationId')}
              value={appId}
            />
          </div>
        </motion.div>

        {/* Consent Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 mb-6"
        >
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle
              className="text-amber-600 flex-shrink-0 mt-0.5"
              size={20}
            />
            <div>
              <h3 className="font-bold text-amber-900">
                {t('consentRequired')}
              </h3>
              <p className="text-sm text-amber-800 mt-1">
                {t('consentRequiredDesc')}
              </p>
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer p-4 bg-white rounded-xl border border-amber-200">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-0.5 w-5 h-5 accent-blue-600 cursor-pointer"
            />
            <span className="text-sm text-gray-700 leading-relaxed">
              {t('consentCheckbox')}
            </span>
          </label>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-end gap-3"
        >
          <button
            onClick={() => navigate('/review')}
            className="px-6 py-3 rounded-xl bg-white border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleApprove}
            disabled={!agreed || submitting || appStatus === 'SUBMITTED'}
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition ${
              agreed && !submitting
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {submitting ? (
              <>{t('submitting')}</>
            ) : (
              <>
                <Send size={18} /> {t('approveSubmit')}
              </>
            )}
          </button>
        </motion.div>
      </main>
    </div>
  );
}

function SummaryRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
      <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0">
        <Icon size={16} />
      </div>
      <div className="flex-1">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm font-semibold text-gray-800 mt-0.5">{value}</p>
      </div>
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

export default Consent;
