import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Bot,
  Home,
  FileText,
  BarChart3,
  Activity,
  LogOut,
  Menu,
  X,
} from 'lucide-react';
import { useLanguage } from '../context/useLanguage';
import { useAuth } from '../context/useAuth';

const Sidebar = () => {
  const { t } = useLanguage();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  const navLinks = [
    { path: '/agent', labelKey: 'navChat', icon: Bot },
    { path: '/', labelKey: 'navHome', icon: Home },
    { path: '/services', labelKey: 'navServices', icon: FileText },
    { path: '/status', labelKey: 'navStatus', icon: BarChart3 },
    { path: '/audit', labelKey: 'navAudit', icon: Activity },
  ];

  const handleNavClick = (path) => navigate(path);
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <>
      {/* Open Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed',
            top: 16,
            left: 16,
            zIndex: 1000,
            width: 42,
            height: 42,
            background: '#0f172a',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(15,23,42,0.3)',
          }}
        >
          <Menu size={18} />
        </button>
      )}

      {/* Sidebar */}
      <aside
        style={{
          width: isOpen ? 280 : 0,
          minWidth: isOpen ? 280 : 0,
          maxWidth: isOpen ? 280 : 0,
          height: '100vh',
          maxHeight: '100vh',
          background: '#0f172a',
          color: '#e2e8f0',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.25s ease',
          overflow: 'hidden',
          position: 'sticky',
          top: 0,
          fontFamily:
            "'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
        }}
      >
        {/* HEADER */}
        <div
          style={{
            padding: '20px 22px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            borderBottom: '1px solid #1e293b',
          }}
        >
          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: '#fff',
              letterSpacing: '-0.2px',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: 6,
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 14,
                fontWeight: 800,
                color: '#fff',
              }}
            >
              A
            </div>
            Aavaedan<span style={{ color: '#10b981' }}>+</span>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 4,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#e2e8f0')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
          >
            <X size={16} />
          </button>
        </div>

        {/* USER CARD */}
        <div
          style={{
            margin: '16px 16px 16px',
            padding: '12px 14px',
            background: '#1e293b',
            border: '1px solid #334155',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: 12,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: '#f1f5f9',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.name || 'Citizen'}
            </p>
            <p
              style={{
                fontSize: 10,
                color: '#94a3b8',
                margin: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {user?.email || 'Not logged in'}
            </p>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav
          style={{
            flex: 1,
            padding: '0 12px',
            overflowY: 'auto',
            minHeight: 0,
          }}
        >
          {/* Section Label */}
          <div
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: 1,
              padding: '10px 12px 8px',
            }}
          >
            Menu
          </div>

          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            const Icon = link.icon;
            return (
              <button
                key={link.path}
                onClick={() => handleNavClick(link.path)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  marginBottom: 2,
                  background: isActive ? '#1e293b' : 'transparent',
                  color: isActive ? '#fff' : '#cbd5e1',
                  border: 'none',
                  borderLeft: isActive
                    ? '2px solid #3b82f6'
                    : '2px solid transparent',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: 13,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  textAlign: 'left',
                  transition: 'all 0.15s',
                  fontFamily: 'inherit',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = '#1e293b';
                    e.currentTarget.style.color = '#fff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#cbd5e1';
                  }
                }}
              >
                <Icon size={16} />
                {t(link.labelKey)}
              </button>
            );
          })}

          <div
            style={{
              height: 1,
              background: '#1e293b',
              margin: '16px 4px',
            }}
          />

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '11px 14px',
              background: 'transparent',
              color: '#cbd5e1',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              textAlign: 'left',
              transition: 'all 0.15s',
              fontFamily: 'inherit',
              marginBottom: 2,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#7f1d1d33';
              e.currentTarget.style.color = '#f87171';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#cbd5e1';
            }}
          >
            <LogOut size={16} />
            {t('logout') || 'Logout'}
          </button>
        </nav>

        {/* FOOTER */}
        <div
          style={{
            padding: '16px 22px',
            borderTop: '1px solid #1e293b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 11,
            color: '#64748b',
            flexShrink: 0,
          }}
        >
          <span style={{ fontWeight: 600 }}>Aavaedan+ v1.0</span>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              color: '#10b981',
              fontWeight: 700,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#10b981',
              }}
            />
            Live
          </span>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
