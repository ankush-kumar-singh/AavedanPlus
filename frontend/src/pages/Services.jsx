import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Home as HomeIcon,
  GraduationCap,
  IndianRupee,
  Award,
  Baby,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useApplication, APP_STATUS } from '../context/ApplicationContext';

const Services = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { setApplication, updateStatus } = useApplication();

  // 6 services — structure ke hisaab se
  const services = [
    {
      icon: FileText,
      titleKey: 'incomeCert',
      descKey: 'incomeCertDesc',
      color: 'bg-blue-50 text-blue-600',
    },
    {
      icon: Award,
      titleKey: 'casteCert',
      descKey: 'casteCertDesc',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      icon: HomeIcon,
      titleKey: 'residenceCert',
      descKey: 'residenceCertDesc',
      color: 'bg-green-50 text-green-600',
    },
    {
      icon: GraduationCap,
      titleKey: 'ewsCert',
      descKey: 'ewsCertDesc',
      color: 'bg-orange-50 text-orange-600',
    },
    {
      icon: Baby,
      titleKey: 'birthCert',
      descKey: 'birthCertDesc',
      color: 'bg-pink-50 text-pink-600',
    },
    {
      icon: IndianRupee,
      titleKey: 'scholarship',
      descKey: 'scholarshipDesc',
      color: 'bg-amber-50 text-amber-600',
    },
  ];

  const handleApply = (titleKey) => {
    const serviceName = t(titleKey);
    setApplication({
      id: 'APP-2026-' + Math.floor(1000 + Math.random() * 9000),
      service: serviceName,
      applicant: { name: 'Rahul Sharma' },
    });
    updateStatus(APP_STATUS.REQUEST_RECEIVED);
    navigate('/agent');
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">
            {t('allServices') || 'Government Services'}
          </h1>
          <button
            onClick={() => navigate('/')}
            className="text-sm font-medium text-gray-600 border border-gray-300 rounded-lg px-4 py-2 hover:bg-gray-50 transition"
          >
            ← {t('back') || 'Back'}
          </button>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-extrabold text-primary">
            {t('servicesHero') || 'Apply for Government Services Easily'}
          </h2>
          <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
            {t('servicesSubtitle') ||
              'Aavaedan+ helps citizens complete government applications with AI assistance, document validation, form filling, consent-based submission, and application tracking.'}
          </p>
        </motion.div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => (
            <motion.div
              key={s.titleKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              whileHover={{ y: -6 }}
              className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-xl transition-shadow flex flex-col"
            >
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center ${s.color}`}
              >
                <s.icon size={26} />
              </div>

              <h3 className="mt-5 text-lg font-bold text-primary">
                {t(s.titleKey)}
              </h3>
              <p className="mt-2 text-sm text-gray-500 leading-snug flex-1">
                {t(s.descKey)}
              </p>

              <button
                onClick={() => handleApply(s.titleKey)}
                className="mt-5 w-full py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
              >
                {t('applyNow') || 'Apply Now'} →
              </button>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Services;