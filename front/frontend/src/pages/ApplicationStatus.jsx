import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  CheckCircle2,
  Clock,
  Send,
  Building2,
  ArrowLeft,
  Download,
  Copy,
} from 'lucide-react';
import { useApplication } from '../context/ApplicationContext';
import { useLanguage } from '../context/LanguageContext';

function ApplicationStatus() {
  const navigate = useNavigate();
  const { application } = useApplication();
  const { t } = useLanguage();

  const serviceName = application?.service || t('incomeCert');
  const applicantName = application?.applicant?.name || 'Rahul Sharma';
  const appId = application?.id || 'APP-2026-1234';

  const submittedDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const timeline = [
    {
      labelKey: 'stepRequestCreated',
      descKey: 'stepRequestCreatedDesc',
      icon: FileText,
    },
    {
      labelKey: 'stepDocsValidated',
      descKey: 'stepDocsValidatedDesc',
      icon: CheckCircle2,
    },
    {
      labelKey: 'stepFormPrepared',
      descKey: 'stepFormPreparedDesc',
      icon: FileText,
    },
    {
      labelKey: 'stepConsentGranted',
      descKey: 'stepConsentGrantedDesc',
      icon: CheckCircle2,
    },
    {
      labelKey: 'stepSubmissionAttempted',
      descKey: 'stepSubmissionAttemptedDesc',
      icon: Send,
    },
    {
      labelKey: 'stepPortalAccepted',
      descKey: 'stepPortalAcceptedDesc',
      icon: Building2,
    },
  ];

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-primary">
              📊 {t('statusTitle')}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              {t('statusSubtitle')}
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
        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-600 to-green-700 rounded-2xl p-6 mb-6 text-white"
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm font-medium text-green-100">
                {t('currentStatus')}
              </p>
              <h2 className="text-3xl font-bold mt-1">
                {t('submittedStatus')} ✅
              </h2>
              <p className="text-sm text-green-100 mt-1">
                {serviceName} · {t('submittedOn')} {submittedDate}
              </p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-right">
              <p className="text-xs text-green-100">{t('applicationId')}</p>
              <p className="text-lg font-bold mt-1">{appId}</p>
            </div>
          </div>
        </motion.div>

        {/* Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 mb-6"
        >
          <h3 className="font-bold text-primary mb-4">{t('appDetails')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InfoRow label={t('applicant')} value={applicantName} />
            <InfoRow label={t('service')} value={serviceName} />
            <InfoRow label={t('applicationId')} value={appId} />
            <InfoRow label={t('submittedOn')} value={submittedDate} />
            <InfoRow label={t('documentsCount')} value={`3 ${t('documentsVerified')}`} />
            <InfoRow label={t('consentLabel')} value={t('consentGranted')} />
          </div>
        </motion.div>

        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-200 p-6 mb-6"
        >
          <h3 className="font-bold text-primary mb-6">{t('timeline')}</h3>

          <div className="relative">
            {timeline.map((step, i) => {
              const Icon = step.icon;
              const isLast = i === timeline.length - 1;
              return (
                <motion.div
                  key={step.labelKey}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex gap-4 relative"
                >
                  {!isLast && (
                    <div
                      className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-green-500"
                      style={{ height: 'calc(100% - 8px)' }}
                    />
                  )}

                  <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 z-10 border-4 border-white">
                    <Icon size={16} />
                  </div>

                  <div className={`flex-1 ${isLast ? 'pb-0' : 'pb-8'}`}>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-gray-800">
                        {t(step.labelKey)}
                      </p>
                      <CheckCircle2 size={14} className="text-green-600" />
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {t(step.descKey)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6 flex items-start gap-3"
        >
          <Clock className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-semibold text-blue-900">
              {t('expectedTime')}
            </p>
            <p className="text-sm text-blue-700 mt-1">{t('expectedTimeDesc')}</p>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="flex justify-end gap-3"
        >
          <button
            onClick={() => {
              navigator.clipboard?.writeText(appId);
            }}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
          >
            <Copy size={16} /> {t('copyId')}
          </button>
          <button className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">
            <Download size={16} /> {t('downloadReceipt')}
          </button>
        </motion.div>
      </main>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-gray-100 last:border-0">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
        {label}
      </p>
      <p className="text-sm font-semibold text-gray-800 text-right">{value}</p>
    </div>
  );
}

export default ApplicationStatus;