import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2,
  CheckCircle2,
  FileText,
  User,
  Shield,
  Loader2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { useApplication } from '../context/ApplicationContext';
import { useLanguage } from '../context/LanguageContext';

function GovernmentPortal() {
  const navigate = useNavigate();
  const { application, addActivity, setAppStatus } = useApplication();
  const { t } = useLanguage();

  const [phase, setPhase] = useState('submitting');
  const [progress, setProgress] = useState(0);

  const serviceName = application?.service || t('incomeCert');
  const applicantName = application?.applicant?.name || 'Rahul Sharma';
  const appId = application?.id || 'APP-2026-1234';

  useEffect(() => {
    addActivity('SYSTEM', 'Submitting to Government Portal...');

    const steps = [20, 45, 70, 90, 100];
    let i = 0;
    const interval = setInterval(() => {
      if (i < steps.length) {
        setProgress(steps[i]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setPhase('success');
          setAppStatus('SUBMITTED');
          addActivity('PORTAL', 'Application submitted successfully');
        }, 500);
      }
    }, 700);

    return () => clearInterval(interval);
  }, []); // eslint-disable-line

  const submittedDate = new Date().toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
  const submittedTime = new Date().toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  // ============ PHASE 1: SUBMITTING ============
  if (phase === 'submitting') {
    return (
      <div className="min-h-screen bg-[#f4f6f9] flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-xl p-10 max-w-md w-full text-center"
        >
          <div className="w-20 h-20 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-5">
            <Loader2 className="text-blue-600 animate-spin" size={36} />
          </div>
          <h2 className="text-xl font-bold text-primary">
            {t('submittingTitle')}
          </h2>
          <p className="text-sm text-gray-500 mt-2">
            {t('submittingDesc')}
          </p>

          <div className="mt-8 bg-gray-100 rounded-full h-2 overflow-hidden">
            <motion.div
              className="h-full bg-blue-600"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2 font-medium">{progress}%</p>

          <div className="mt-6 space-y-2 text-left">
            {progress >= 20 && <StepLine done text={t('connectingPortal')} />}
            {progress >= 45 && <StepLine done text={t('verifyingDocs')} />}
            {progress >= 70 && <StepLine done text={t('validatingConsent')} />}
            {progress >= 90 && <StepLine done text={t('submittingApp')} />}
          </div>
        </motion.div>
      </div>
    );
  }

  // ============ PHASE 2: SUCCESS ============
  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <header className="bg-[#0b3d91] text-white shadow-md">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
            <Building2 size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide">
              {t('portalTitle')}
            </h1>
            <p className="text-xs text-blue-100">{t('portalMinistry')}</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6 flex items-start gap-4"
        >
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="text-green-600" size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-green-900">
              {t('appReceived')}
            </h2>
            <p className="text-sm text-green-700 mt-1">
              {t('appReceivedDesc')}
            </p>
          </div>
        </motion.div>

        {/* Receipt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border-2 border-dashed border-gray-300 p-8"
        >
          <div className="text-center border-b border-dashed border-gray-300 pb-5 mb-5">
            <p className="text-xs font-semibold text-gray-500 tracking-widest uppercase">
              {t('officialReceipt')}
            </p>
            <p className="text-2xl font-bold text-[#0b3d91] mt-2">{appId}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <ReceiptRow icon={FileText} label={t('service')} value={serviceName} />
            <ReceiptRow icon={User} label={t('applicant')} value={applicantName} />
            <ReceiptRow
              icon={Building2}
              label={t('submittedOn')}
              value={`${submittedDate}, ${submittedTime}`}
            />
            <ReceiptRow icon={Shield} label={t('consentLabel')} value={t('granted')} />
          </div>

          <div className="mt-6 pt-5 border-t border-dashed border-gray-300">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
              {t('documentsReceived')}
            </p>
            <div className="space-y-2">
              {['Aadhaar Card', 'Salary Slip', 'Self Declaration'].map((doc) => (
                <div
                  key={doc}
                  className="flex items-center gap-2 text-sm text-gray-700"
                >
                  <CheckCircle2 size={16} className="text-green-600" />
                  {doc}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-5 border-t border-dashed border-gray-300 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                {t('statusLabel')}
              </p>
              <p className="text-lg font-bold text-green-700">
                {t('submittedStatus')}
              </p>
            </div>
            <div className="border-4 border-green-600 text-green-600 rounded-lg px-4 py-2 rotate-[-8deg] font-bold text-lg">
              {t('receivedStamp')}
            </div>
          </div>
        </motion.div>

        {/* Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-5 flex items-start gap-3"
        >
          <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-semibold text-blue-900">
              {t('whatNext')}
            </p>
            <p className="text-sm text-blue-700 mt-1">{t('whatNextDesc')}</p>
          </div>
        </motion.div>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-8 flex justify-end gap-3"
        >
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-xl bg-white border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
          >
            {t('backToHome')}
          </button>
          <button
            onClick={() => navigate('/status')}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            {t('trackApplication')} <ArrowRight size={18} />
          </button>
        </motion.div>
      </main>
    </div>
  );
}

function StepLine({ done, text }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <CheckCircle2
        size={16}
        className={done ? 'text-green-600' : 'text-gray-300'}
      />
      <span className={done ? 'text-gray-700' : 'text-gray-400'}>{text}</span>
    </div>
  );
}

function ReceiptRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
        <Icon size={16} />
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
          {label}
        </p>
        <p className="text-sm font-bold text-gray-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default GovernmentPortal;