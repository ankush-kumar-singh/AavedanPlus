import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FileText,
  Home as HomeIcon,
  GraduationCap,
  IndianRupee,
  Award,
  Baby,
  ArrowLeft,
  ArrowRight,
  Shield,
  Clock,
  CheckCircle2,
  Users,
  Star,
} from 'lucide-react';
import { useLanguage } from '../context/useLanguage';
import { useApplication } from '../context/useApplication';
import { APP_STATUS } from '../context/applicationStatus';
import { useAuth } from '../context/useAuth';
import { sessionAPI } from '../services/api';
import LanguageSwitcher from '../components/LanguageSwitcher';
import UserMenu from '../components/UserMenu';
import logo from '../assets/logo.png';

const HERO_IMG =
  'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1920&q=80';
const CTA_IMG =
  'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=1920&q=80';

const SERVICE_IMGS = {
  incomeCert:
    'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=600&q=80',
  casteCert:
    'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80',
  residenceCert:
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&q=80',
  ewsCert:
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&q=80',
  birthCert:
    'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=600&q=80',
  scholarship:
    'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=600&q=80',
};

const Services = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const {
    setApplication,
    setAppStatus,
    addActivity,
    setMessages,
    setDocuments,
    setAgentSteps,
    setActivityFeed,
    setConsent,
  } = useApplication();
  const { user } = useAuth();
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState(location.state?.query || '');
  const [startError, setStartError] = useState('');
  const [starting, setStarting] = useState(false);

  const services = [
    {
      icon: FileText,
      titleKey: 'incomeCert',
      descKey: 'incomeCertDesc',
      gradient: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
      category: 'Income',
      img: SERVICE_IMGS.incomeCert,
      featured: true,
    },
    {
      icon: Award,
      titleKey: 'casteCert',
      descKey: 'casteCertDesc',
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
      category: 'Identity',
      img: SERVICE_IMGS.casteCert,
    },
    {
      icon: HomeIcon,
      titleKey: 'residenceCert',
      descKey: 'residenceCertDesc',
      gradient: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
      category: 'Address',
      img: SERVICE_IMGS.residenceCert,
      featured: true,
    },
    {
      icon: GraduationCap,
      titleKey: 'ewsCert',
      descKey: 'ewsCertDesc',
      gradient: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
      category: 'Education',
      img: SERVICE_IMGS.ewsCert,
    },
    {
      icon: Baby,
      titleKey: 'birthCert',
      descKey: 'birthCertDesc',
      gradient: 'linear-gradient(135deg, #db2777 0%, #ec4899 100%)',
      category: 'Identity',
      img: SERVICE_IMGS.birthCert,
    },
    {
      icon: IndianRupee,
      titleKey: 'scholarship',
      descKey: 'scholarshipDesc',
      gradient: 'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)',
      category: 'Financial',
      img: SERVICE_IMGS.scholarship,
      featured: true,
    },
  ];

  const filters = ['All', 'Income', 'Identity', 'Address', 'Education', 'Financial'];
  const serviceIds = {
    incomeCert: 'income_certificate',
    casteCert: 'caste_certificate',
    residenceCert: 'residence_certificate',
    ewsCert: 'ews_certificate',
    birthCert: 'birth_certificate',
    scholarship: 'scholarship',
  };

  const normalizedQuery = searchQuery.trim().toLocaleLowerCase();
  const searchTerms = normalizedQuery
    .split(/\s+/)
    .filter((term) => term.length > 2 && !['the', 'and', 'for', 'want', 'apply', 'application', 'service'].includes(term));
  const filteredServices = services.filter((service) => {
    const matchesCategory = activeFilter === 'All' || service.category === activeFilter;
    if (!matchesCategory || !normalizedQuery) return matchesCategory;

    const searchableText = `${t(service.titleKey)} ${t(service.descKey)} ${service.titleKey} ${serviceIds[service.titleKey]}`
      .toLocaleLowerCase();
    return searchableText.includes(normalizedQuery) ||
      normalizedQuery.includes(t(service.titleKey).toLocaleLowerCase()) ||
      (searchTerms.length > 0 && searchTerms.every((term) => searchableText.includes(term)));
  });

  const handleApply = async (titleKey) => {
    if (starting) return;
    if (!user?.id) {
      setStartError('Your sign-in session is missing. Please sign in again.');
      return;
    }

    const serviceName = t(titleKey);
    setStarting(true);
    setStartError('');
    try {
      await sessionAPI.clear(user.id);
    } catch {
      setStartError('Could not clear the previous application session. Check the backend connection and try again.');
      setStarting(false);
      return;
    }
    setMessages([]);
    setDocuments([]);
    setAgentSteps([]);
    setActivityFeed([]);
    setConsent('pending');
    setApplication(null);
    setAppStatus(APP_STATUS.IDLE);

    try {
      await sessionAPI.start(user.id, serviceIds[titleKey]);
    } catch {
      setStartError('Could not start a saved application session. Check the backend connection and try again.');
      setStarting(false);
      return;
    }

    setApplication({
      id: null,
      serviceId: serviceIds[titleKey],
      service: serviceName,
      applicant: { name: user?.name || '' },
      userId: user.id,
    });
    setAppStatus(APP_STATUS.REQUEST_RECEIVED);
    addActivity('USER', `Started ${serviceName} application`);
    setStarting(false);
    navigate('/agent');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* HEADER */}
      <header
        style={{
          background: '#fff',
          borderBottom: '1px solid #e2e8f0',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: 1400,
            margin: '0 auto',
            padding: '16px 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <img
            src={logo}
            alt="Aavaedan+"
            style={{ height: 48, width: 'auto', objectFit: 'contain' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <LanguageSwitcher />
            <UserMenu />
          </div>
        </div>
      </header>

      {/* HERO */}
      <section
        style={{
          position: 'relative',
          padding: '80px 32px',
          overflow: 'hidden',
          backgroundImage: `url(${HERO_IMG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: 480,
        }}
      >
        <div
  style={{
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(135deg, rgba(15,23,42,0.55) 0%, rgba(30,58,138,0.45) 100%)',
     }}
    />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
            pointerEvents: 'none',
          }}
        />

        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: '#fff',
              padding: '8px 16px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              marginBottom: 24,
            }}
          >
            <ArrowLeft size={14} /> {t('back') || 'Back'}
          </button>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '6px 16px',
              background: 'rgba(59,130,246,0.2)',
              border: '1px solid rgba(59,130,246,0.4)',
              borderRadius: 100,
              marginBottom: 20,
              backdropFilter: 'blur(10px)',
            }}
          >
            <Shield size={12} color="#60a5fa" />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#bfdbfe',
                letterSpacing: '0.5px',
              }}
            >
              AAVAEDAN+ · PROTOTYPE FLOWS
            </span>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              fontSize: 'clamp(28px, 4vw, 48px)',
              fontWeight: 900,
              lineHeight: 1.1,
              margin: 0,
              color: '#fff',
              letterSpacing: '-1px',
              maxWidth: 700,
            }}
          >
            Service applications,{' '}
            <span
              style={{
                background:
                  'linear-gradient(135deg, #60a5fa 0%, #fbbf24 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              simplified
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              fontSize: 16,
              color: '#cbd5e1',
              marginTop: 18,
              marginBottom: 0,
              lineHeight: 1.6,
              maxWidth: 620,
            }}
          >
            Choose a demo flow for a government service. The prototype guides you through documents, form review, consent, and a local mock submission.
          </motion.p>

          <div
            style={{
              display: 'flex',
              gap: 40,
              marginTop: 40,
              flexWrap: 'wrap',
            }}
          >
            <StatItem icon={FileText} value="6" label="Demo service flows" />
            <StatItem icon={Users} value="PDF" label="Document format" />
            <StatItem icon={Clock} value="Local" label="Mock portal" />
            <StatItem icon={CheckCircle2} value="Required" label="User consent" />
          </div>
        </div>
      </section>

      {startError && (
        <div role="alert" className="mx-auto mt-6 max-w-5xl rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          {startError}
        </div>
      )}

      {/* FILTERS */}
      <section style={{ padding: '40px 32px 0', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <label style={{ display: 'block', maxWidth: 520, marginBottom: 16 }}>
            <span className="sr-only">Search supported demo services</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search supported demo services"
              style={{ width: '100%', padding: '12px 16px', border: '1px solid #cbd5e1', borderRadius: 12, fontSize: 14 }}
            />
          </label>
          <div
            style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              paddingBottom: 24,
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                style={{
                  padding: '9px 20px',
                  border:
                    activeFilter === f
                      ? '1.5px solid #1e40af'
                      : '1.5px solid #e2e8f0',
                  background: activeFilter === f ? '#1e40af' : '#fff',
                  color: activeFilter === f ? '#fff' : '#475569',
                  borderRadius: 100,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section style={{ padding: '40px 32px 80px', background: '#f8fafc' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: 24,
            }}
          >
            {filteredServices.map((s, i) => (
              <motion.div
                key={s.titleKey}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -8 }}
                style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 20,
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  transition: 'all 0.3s',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    height: 140,
                    backgroundImage: `url(${s.img})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: s.gradient,
                      opacity: 0.85,
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: 20,
                      left: 20,
                      width: 48,
                      height: 48,
                      borderRadius: 14,
                      background: 'rgba(255,255,255,0.25)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                    }}
                  >
                    <s.icon size={22} />
                  </div>
                  {s.featured && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 20,
                        right: 20,
                        padding: '4px 10px',
                        background: 'rgba(251,191,36,0.95)',
                        color: '#78350f',
                        borderRadius: 6,
                        fontSize: 10,
                        fontWeight: 800,
                        letterSpacing: '0.5px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Star size={10} fill="#78350f" /> FEATURED
                    </div>
                  )}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 16,
                      left: 20,
                      fontSize: 11,
                      fontWeight: 800,
                      color: '#fff',
                      letterSpacing: '1.5px',
                      textTransform: 'uppercase',
                      opacity: 0.9,
                    }}
                  >
                    {s.category}
                  </div>
                </div>

                <div
                  style={{
                    padding: 24,
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                  }}
                >
                  <h3
                    style={{
                      fontSize: 19,
                      fontWeight: 800,
                      color: '#0f172a',
                      margin: 0,
                      marginBottom: 8,
                      letterSpacing: '-0.3px',
                    }}
                  >
                    {t(s.titleKey)}
                  </h3>
                  <p
                    style={{
                      fontSize: 14,
                      color: '#64748b',
                      margin: 0,
                      marginBottom: 20,
                      lineHeight: 1.55,
                      flex: 1,
                    }}
                  >
                    {t(s.descKey)}
                  </p>

                  <button
                    onClick={() => handleApply(s.titleKey)}
                    disabled={starting}
                    aria-busy={starting}
                    style={{
                      width: '100%',
                      padding: '13px 16px',
                      background: s.gradient,
                      color: '#fff',
                      border: 'none',
                      borderRadius: 12,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: starting ? 'wait' : 'pointer',
                      opacity: starting ? 0.7 : 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      boxShadow: '0 6px 16px rgba(0,0,0,0.08)',
                    }}
                  >
                    {starting ? 'Starting…' : t('applyNow') || 'Start demo flow'}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </motion.div>
            ))}
            {filteredServices.length === 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-700">
                No supported demo service matches that search. Try a shorter service name or clear the search.
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="ml-2 font-semibold text-blue-800 underline"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          position: 'relative',
          padding: '100px 32px',
          overflow: 'hidden',
          backgroundImage: `url(${CTA_IMG})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
       <div
  style={{
    position: 'absolute',
    inset: 0,
    background:
      'linear-gradient(135deg, rgba(15,23,42,0.55) 0%, rgba(30,58,138,0.45) 100%)',
     }}
/>
        <div
          style={{
            maxWidth: 800,
            margin: '0 auto',
            textAlign: 'center',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <h2
            style={{
              fontSize: 'clamp(26px, 3.5vw, 40px)',
              fontWeight: 900,
              color: '#fff',
              margin: 0,
              letterSpacing: '-0.8px',
            }}
          >
            Can't find what you're looking for?
          </h2>
          <p
            style={{
              fontSize: 16,
              color: '#cbd5e1',
              marginTop: 16,
              marginBottom: 32,
              lineHeight: 1.6,
            }}
          >
            Tell our AI assistant what you need, and it will guide you to the
            right service.
          </p>
          <button
            onClick={() => navigate('/agent')}
            style={{
              padding: '16px 36px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 15px 40px rgba(59,130,246,0.4)',
            }}
          >
            Chat with AI Assistant <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </div>
  );
};

function StatItem({ icon: Icon, value, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div
        style={{
          width: 42,
          height: 42,
          borderRadius: 12,
          background: 'rgba(59,130,246,0.2)',
          border: '1px solid rgba(59,130,246,0.35)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#60a5fa',
          backdropFilter: 'blur(10px)',
        }}
      >
        <Icon size={18} />
      </div>
      <div>
        <p
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: '#fff',
            margin: 0,
            letterSpacing: '-0.3px',
          }}
        >
          {value}
        </p>
        <p
          style={{
            fontSize: 11,
            color: '#94a3b8',
            margin: 0,
            fontWeight: 500,
          }}
        >
          {label}
        </p>
      </div>
    </div>
  );
}

export default Services;
