import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApplication } from '../context/ApplicationContext';
import { useLanguage } from '../context/LanguageContext';

const Sidebar = () => {
  const { resetApplication } = useApplication();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  const [applications] = useState([
    { id: 1, name: 'Income Certificate', date: '07 Oct 2026', status: 'SUCCESS' },
    { id: 2, name: 'Residence Certificate', date: '05 Oct 2026', status: 'PENDING' },
    { id: 3, name: 'Caste Certificate', date: '02 Oct 2026', status: 'SUCCESS' },
  ]);

  const navLinks = [
    { path: '/', labelKey: 'navHome', icon: '🏠' },
    { path: '/services', labelKey: 'navServices', icon: '📋' },
    { path: '/status', labelKey: 'navStatus', icon: '📊' },
    { path: '/audit', labelKey: 'navAudit', icon: '📜' },
  ];

  const handleNavClick = (path) => {
    navigate(path);
  };

  const handleNewApplication = () => {
    resetApplication();
    navigate('/');
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            top: 20,
            left: 20,
            zIndex: 1000,
            padding: '10px 14px',
            background: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 18,
          }}
        >
          ☰
        </button>
      )}

      <aside
        style={{
          width: isOpen ? 280 : 0,
          minWidth: isOpen ? 280 : 0,
          height: '100vh',
          background: '#0f172a',
          color: '#e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.3s ease',
          overflow: 'hidden',
          position: 'sticky',
          top: 0,
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 18px',
            borderBottom: '1px solid #1e293b',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 style={{ fontSize: 18, margin: 0, color: '#fff' }}>
            📋 Aavaedan+
          </h2>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: 18,
            }}
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <div style={{ padding: '12px 12px 0' }}>
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <button
                key={link.path}
                onClick={() => handleNavClick(link.path)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  marginBottom: 6,
                  background: isActive ? '#2563eb' : 'transparent',
                  color: isActive ? '#fff' : '#cbd5e1',
                  border: 'none',
                  borderRadius: 10,
                  cursor: 'pointer',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  textAlign: 'left',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = '#1e293b';
                }}
                onMouseLeave={(e) => {
                  if (!isActive)
                    e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{ fontSize: 16 }}>{link.icon}</span>
                {t(link.labelKey)}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: '#1e293b', margin: '12px 16px' }} />

        {/* New Application */}
        <div style={{ padding: '0 16px 12px' }}>
          <button
            onClick={handleNewApplication}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: '#2563eb',
              color: 'white',
              border: 'none',
              borderRadius: 10,
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 14,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            ➕ {t('newApplication')}
          </button>
        </div>

        {/* Recent */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 12px' }}>
          <p
            style={{
              fontSize: 11,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: 1,
              margin: '12px 8px 8px',
            }}
          >
            {t('recent')}
          </p>

          {applications.map((app) => (
            <div
              key={app.id}
              onClick={() => navigate('/status')}
              style={{
                padding: '12px 14px',
                borderRadius: 10,
                marginBottom: 8,
                background: '#1e293b',
                cursor: 'pointer',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = '#334155')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = '#1e293b')
              }
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 4,
                }}
              >
                <span
                  style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9' }}
                >
                  {app.name}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    padding: '2px 8px',
                    borderRadius: 6,
                    background:
                      app.status === 'SUCCESS' ? '#065f46' : '#78350f',
                    color: app.status === 'SUCCESS' ? '#6ee7b7' : '#fcd34d',
                    fontWeight: 600,
                  }}
                >
                  {app.status === 'SUCCESS' ? t('success') : t('pending')}
                </span>
              </div>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>
                {app.date}
              </span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: 16,
            borderTop: '1px solid #1e293b',
            fontSize: 12,
            color: '#64748b',
            textAlign: 'center',
          }}
        >
          {t('aavaedanVersion')}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;