import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mic,
  ArrowRight,
  FileText,
  Home as HomeIcon,
  GraduationCap,
  IndianRupee,
  Shield,
  Users,
  Award,
  Clock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../context/useLanguage';
import LanguageSwitcher from '../components/LanguageSwitcher';
import UserMenu from '../components/UserMenu';
import logo from '../assets/logo.png';

function Home() {
  const [query, setQuery] = useState('');
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState('');
  const recognitionRef = useRef(null);
  const navigate = useNavigate();
  const { t, language } = useLanguage();

  useEffect(() => () => recognitionRef.current?.stop(), []);

  const services = [
    {
      icon: FileText,
      titleKey: 'incomeCert',
      descKey: 'incomeCertDesc',
      gradient: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
    },
    {
      icon: HomeIcon,
      titleKey: 'residenceCert',
      descKey: 'residenceCertDesc',
      gradient: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
    },
    {
      icon: GraduationCap,
      titleKey: 'casteCert',
      descKey: 'casteCertDesc',
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    },
    {
      icon: IndianRupee,
      titleKey: 'scholarship',
      descKey: 'scholarshipDesc',
      gradient: 'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)',
    },
  ];

  const handleSubmit = () => {
    navigate('/services', { state: { query: query.trim() } });
  };

  const handleMic = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceError('Voice input is not available in this browser. Type a service name instead.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript?.trim();
        if (transcript) setQuery(transcript);
      };
      recognition.onerror = () => {
        setVoiceError('Voice input could not start. Check microphone permission or type a service name.');
      };
      recognition.onend = () => {
        recognitionRef.current = null;
        setListening(false);
      };
      recognition.start();
      setVoiceError('');
      setListening(true);
    } catch {
      recognitionRef.current = null;
      setListening(false);
      setVoiceError('Voice input could not start. Type a service name instead.');
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* ==================== HEADER ==================== */}
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

      {/* ==================== HERO SECTION ==================== */}
      <section
        style={{
          position: 'relative',
          background:
            'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
          padding: '80px 32px 100px',
          overflow: 'hidden',
        }}
      >
        {/* Background decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: 400,
            height: 400,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(59,130,246,0.15) 0%, transparent 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-150px',
            left: '-150px',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)',
          }}
        />

        {/* Grid pattern */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)',
            backgroundSize: '50px 50px',
            pointerEvents: 'none',
          }}
        />

        {/* Content */}
        <div
          style={{
            maxWidth: 1000,
            margin: '0 auto',
            textAlign: 'center',
            position: 'relative',
            zIndex: 2,
          }}
        >
          {/* Trust badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 18px',
              background: 'rgba(59,130,246,0.15)',
              border: '1px solid rgba(59,130,246,0.3)',
              borderRadius: 100,
              marginBottom: 28,
            }}
          >
            <Shield size={14} color="#60a5fa" />
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: '#93c5fd',
                letterSpacing: '0.5px',
              }}
            >
              AAVAEDAN+ · SERVICE APPLICATION PROTOTYPE
            </span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            style={{
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 900,
              lineHeight: 1.1,
              margin: 0,
              letterSpacing: '-1px',
              color: '#fff',
            }}
          >
            What government service
            <br />
            <span
              style={{
                background:
                  'linear-gradient(135deg, #60a5fa 0%, #fbbf24 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              do you need?
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            style={{
              fontSize: 17,
              color: '#cbd5e1',
              marginTop: 20,
              marginBottom: 0,
              lineHeight: 1.6,
              maxWidth: 640,
              marginLeft: 'auto',
              marginRight: 'auto',
            }}
          >
            Choose one of the supported demo services. This prototype can help
            prepare a sample application, but it does not contact a government
            service.
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{ marginTop: 40 }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 16,
                padding: '8px 8px 8px 24px',
                maxWidth: 680,
                margin: '0 auto',
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
              }}
            >
              <Sparkles size={18} color="#60a5fa" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder={t('searchPlaceholder')}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: 16,
                  color: '#fff',
                  padding: '12px 0',
                }}
              />
              <button
                onClick={handleMic}
                type="button"
                aria-label={listening ? 'Stop voice input' : 'Start voice input'}
                aria-pressed={listening}
                style={{
                  padding: 12,
                  borderRadius: 12,
                  border: 'none',
                  background: listening
                    ? 'rgba(239,68,68,0.2)'
                    : 'rgba(255,255,255,0.1)',
                  color: listening ? '#f87171' : '#cbd5e1',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Mic size={20} />
              </button>
              <button
                onClick={() => handleSubmit()}
                type="button"
                aria-label="Search supported services"
                style={{
                  padding: 12,
                  borderRadius: 12,
                  border: 'none',
                  background:
                    'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 8px 20px rgba(59,130,246,0.4)',
                }}
              >
                <ArrowRight size={20} />
              </button>
            </div>

            {listening && (
              <p
                style={{
                  marginTop: 12,
                  color: '#f87171',
                  fontSize: 14,
                  fontWeight: 500,
                  animation: 'pulse 1.5s ease-in-out infinite',
                }}
              >
                🎤 {t('listening')}
              </p>
            )}
            {voiceError && (
              <p role="status" style={{ marginTop: 12, color: '#fecaca', fontSize: 14 }}>
                {voiceError}
              </p>
            )}
          </motion.div>

          {/* Stats Row */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: 60,
              marginTop: 60,
              flexWrap: 'wrap',
            }}
          >
            <StatItem icon={Users} value="6" label="Demo service flows" />
            <StatItem icon={Award} value="PDF" label="Document format" />
            <StatItem icon={Clock} value="Local" label="Mock portal" />
            <StatItem icon={CheckCircle2} value="Required" label="User consent" />
          </motion.div>
        </div>
      </section>

      {/* ==================== SERVICES SECTION ==================== */}
      <section
        style={{
          padding: '80px 32px',
          background: '#fff',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Heading + View All */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: 40,
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div>
              <p
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: '#1e40af',
                  letterSpacing: '2px',
                  margin: 0,
                  marginBottom: 8,
                }}
              >
                POPULAR SERVICES
              </p>
              <h2
                style={{
                  fontSize: 36,
                  fontWeight: 800,
                  color: '#0f172a',
                  margin: 0,
                  letterSpacing: '-0.5px',
                }}
              >
                What can we help you with?
              </h2>
            </div>
            <button
              onClick={() => navigate('/services')}
              style={{
                background: 'transparent',
                border: '1.5px solid #1e40af',
                color: '#1e40af',
                padding: '10px 20px',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              View All Services <ArrowRight size={14} />
            </button>
          </div>

          {/* Service Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: 20,
            }}
          >
            {services.map((s, i) => (
              <motion.button
                key={s.titleKey}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                onClick={() => navigate('/services', { state: { query: t(s.titleKey) } })}
                style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 20,
                  padding: 28,
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Top gradient line */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: s.gradient,
                  }}
                />

                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: s.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    marginBottom: 20,
                    boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
                  }}
                >
                  <s.icon size={26} />
                </div>

                <h3
                  style={{
                    fontSize: 18,
                    fontWeight: 800,
                    color: '#0f172a',
                    margin: 0,
                    marginBottom: 8,
                  }}
                >
                  {t(s.titleKey)}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: '#64748b',
                    margin: 0,
                    lineHeight: 1.5,
                  }}
                >
                  {t(s.descKey)}
                </p>

                <div
                  style={{
                    marginTop: 20,
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#1e40af',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  View service <ArrowRight size={14} />
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== WHY CHOOSE US ==================== */}
      <section
        style={{
          padding: '80px 32px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #eff6ff 100%)',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#1e40af',
                letterSpacing: '2px',
                margin: 0,
                marginBottom: 8,
              }}
            >
              WHY CHOOSE AAVAEDAN+
            </p>
            <h2
              style={{
                fontSize: 36,
                fontWeight: 800,
                color: '#0f172a',
                margin: 0,
                letterSpacing: '-0.5px',
              }}
            >
              Smart governance, simplified
            </h2>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 24,
            }}
          >
            <FeatureCard
              icon={Sparkles}
              title="AI-Powered"
              desc="Advanced AI guides you through each step of the application"
            />
            <FeatureCard
              icon={Shield}
              title="Local prototype"
              desc="Application data is stored by this local demo. Do not upload real sensitive documents."
            />
            <FeatureCard
              icon={CheckCircle2}
              title="PDF readability checks"
              desc="The demo checks whether a PDF is readable and identifies a likely document type."
            />
            <FeatureCard
              icon={Clock}
              title="Demo status history"
              desc="View status events recorded by the local mock portal."
            />
          </div>
        </div>
      </section>

      {/* ==================== CTA SECTION ==================== */}
      <section
        style={{
          padding: '80px 32px',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            right: '-100px',
            width: 300,
            height: 300,
            borderRadius: '50%',
            background:
              'radial-gradient(circle, rgba(59,130,246,0.2) 0%, transparent 70%)',
          }}
        />

        <div
          style={{
            maxWidth: 700,
            margin: '0 auto',
            position: 'relative',
            zIndex: 2,
          }}
        >
          <h2
            style={{
              fontSize: 36,
              fontWeight: 800,
              color: '#fff',
              margin: 0,
              letterSpacing: '-0.5px',
            }}
          >
            Ready to get started?
          </h2>
          <p
            style={{
              fontSize: 17,
              color: '#cbd5e1',
              marginTop: 16,
              marginBottom: 32,
              lineHeight: 1.6,
            }}
          >
            Choose one of six example service flows. The local prototype saves
            demo records only and does not submit government applications.
          </p>
          <button
            onClick={() => navigate('/services')}
            style={{
              padding: '16px 36px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
              border: 'none',
              borderRadius: 12,
              color: '#fff',
              fontSize: 16,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: '0 15px 40px rgba(59,130,246,0.4)',
            }}
          >
            Start Application <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* ==================== FOOTER ==================== */}
      <footer
        style={{
          background: '#0a0f1a',
          color: '#94a3b8',
          padding: '40px 32px 20px',
        }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingBottom: 24,
              borderBottom: '1px solid #1e293b',
              flexWrap: 'wrap',
              gap: 16,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background:
                    'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                }}
              >
                🏛️
              </div>
              <div>
                <p
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#fff',
                    margin: 0,
                  }}
                >
                  Aavaedan+
                </p>
                <p
                  style={{
                    fontSize: 11,
                    color: '#64748b',
                    margin: 0,
                  }}
                >
                  Local application prototype
                </p>
              </div>
            </div>
            <p
              style={{
                fontSize: 12,
                color: '#64748b',
                margin: 0,
              }}
            >
              © 2026 Aavaedan+ · Demonstration project
            </p>
          </div>
          <p style={{ paddingTop: 20, margin: 0, textAlign: 'center', fontSize: 12 }}>
            Prototype only · no government service is connected
          </p>
        </div>
      </footer>
    </div>
  );
}

// ==================== HELPER COMPONENTS ====================

function StatItem({ icon: Icon, value, label }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          marginBottom: 6,
        }}
      >
        <Icon size={20} color="#60a5fa" />
        <span
          style={{
            fontSize: 28,
            fontWeight: 900,
            color: '#fff',
            letterSpacing: '-0.5px',
          }}
        >
          {value}
        </span>
      </div>
      <p
        style={{
          fontSize: 12,
          color: '#94a3b8',
          margin: 0,
          fontWeight: 500,
          letterSpacing: '0.3px',
        }}
      >
        {label}
      </p>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: 18,
        padding: 28,
        transition: 'all 0.3s',
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#1e40af',
          marginBottom: 18,
        }}
      >
        <Icon size={22} />
      </div>
      <h3
        style={{
          fontSize: 17,
          fontWeight: 800,
          color: '#0f172a',
          margin: 0,
          marginBottom: 8,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: 14,
          color: '#64748b',
          margin: 0,
          lineHeight: 1.5,
        }}
      >
        {desc}
      </p>
    </motion.div>
  );
}

export default Home;
