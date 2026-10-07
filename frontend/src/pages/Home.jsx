import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mic,
  ArrowRight,
  FileText,
  Home as HomeIcon,
  GraduationCap,
  IndianRupee,
} from 'lucide-react';
import { useApplication, APP_STATUS } from '../context/ApplicationContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import UserMenu from '../components/UserMenu';
import logo from '../assets/logo.png';

function Home() {
  const [query, setQuery] = useState('');
  const [listening, setListening] = useState(false);
  const navigate = useNavigate();
  const { setApplication, setAppStatus, addActivity } =
    useApplication();
  const { t } = useLanguage();

  const services = [
    {
      icon: FileText,
      titleKey: 'incomeCert',
      descKey: 'incomeCertDesc',
      color: 'bg-blue-50 text-accent',
    },
    {
      icon: HomeIcon,
      titleKey: 'residenceCert',
      descKey: 'residenceCertDesc',
      color: 'bg-green-50 text-success',
    },
    {
      icon: GraduationCap,
      titleKey: 'casteCert',
      descKey: 'casteCertDesc',
      color: 'bg-purple-50 text-purple-600',
    },
    {
      icon: IndianRupee,
      titleKey: 'govtSubsidy',
      descKey: 'govtSubsidyDesc',
      color: 'bg-amber-50 text-warning',
    },
  ];

  const handleSubmit = (serviceName) => {
    const service = serviceName || query || t('incomeCert');
    setApplication({
      service,
      serviceKey: service === t('incomeCert') ? 'income_certificate' : undefined,
    });
    setAppStatus(APP_STATUS.REQUEST_RECEIVED);
    addActivity('USER', `Started ${service} application`);
    navigate('/agent');
  };

  const handleMic = () => {
    setListening(true);
    setTimeout(() => {
      setQuery(t('searchPlaceholder').replace('...', ''));
      setListening(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      {/* Header — User Menu ekdum right corner mein */}
      <header className="bg-white border-b border-gray-200">
        <div className="w-full px-4 py-4 flex items-center justify-between">
          {/* Left: Logo */}
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Aavaedan+"
              className="h-12 w-auto object-contain"
            />
          </div>

          {/* Right: Language + User */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-4xl mx-auto px-6 pt-20 pb-12 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl md:text-5xl font-extrabold text-primary leading-tight"
        >
          {t('heroTitle')}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mt-4 text-lg text-gray-500"
        >
          {t('heroSubtitle')}
        </motion.p>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-10"
        >
          <div className="flex items-center gap-2 bg-white rounded-2xl shadow-lg border border-gray-200 p-2 pl-6 focus-within:ring-2 focus-within:ring-accent/40 focus-within:border-accent transition">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder={t('searchPlaceholder')}
              className="flex-1 text-lg outline-none text-gray-700 placeholder:text-gray-400"
            />
            <button
              onClick={handleMic}
              className={`p-3 rounded-xl transition ${
                listening
                  ? 'bg-red-100 text-error animate-pulse'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              <Mic size={20} />
            </button>
            <button
              onClick={() => handleSubmit()}
              className="p-3 rounded-xl bg-accent text-white hover:bg-blue-700 transition"
            >
              <ArrowRight size={20} />
            </button>
          </div>

          {listening && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-3 text-error font-medium animate-pulse"
            >
              🎤 {t('listening')}
            </motion.p>
          )}
        </motion.div>

        {/* Services */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.45 }}
          className="mt-16"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-left text-sm font-semibold text-gray-400 uppercase tracking-wider">
              {t('popularServices')}
            </h2>
            <button
              onClick={() => navigate('/services')}
              className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:underline"
            >
              {t('viewAll')} →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {services.map((s, i) => (
              <motion.button
                key={s.titleKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.1 }}
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleSubmit(t(s.titleKey))}
                className="bg-white rounded-2xl border border-gray-200 p-5 text-left shadow-sm hover:shadow-xl transition-shadow"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.color}`}
                >
                  <s.icon size={24} />
                </div>
                <h3 className="mt-4 font-bold text-primary">
                  {t(s.titleKey)}
                </h3>
                <p className="mt-1 text-sm text-gray-500 leading-snug">
                  {t(s.descKey)}
                </p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}

export default Home;