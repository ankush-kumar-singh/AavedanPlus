import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const UserMenu = () => {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Bahar click karne pe dropdown band
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    <div ref={menuRef} style={{ position: 'relative' }}>
      {/* Trigger button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '6px 12px 6px 6px',
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: 30,
          cursor: 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#f8fafc')}
        onMouseLeave={(e) => (e.currentTarget.style.background = '#fff')}
      >
        {/* Avatar */}
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563eb 0%, #1e40af 100%)',
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

        {/* Name + email */}
        <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: '#0f172a',
              margin: 0,
              maxWidth: 130,
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
              color: '#64748b',
              margin: 0,
              maxWidth: 130,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {user?.email || 'Not logged in'}
          </p>
        </div>

        {/* Chevron */}
        <span
          style={{
            fontSize: 9,
            color: '#94a3b8',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0)',
            transition: 'transform 0.2s',
          }}
        >
          ▼
        </span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            minWidth: 240,
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
            overflow: 'hidden',
            zIndex: 1000,
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 16px',
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
            }}
          >
            <p
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: '#0f172a',
                margin: 0,
              }}
            >
              {user?.name || 'Citizen'}
            </p>
            <p
              style={{
                fontSize: 11,
                color: '#64748b',
                margin: '3px 0 0 0',
              }}
            >
              {user?.email}
            </p>
          </div>

          {/* Info */}
          <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0' }}>
            <p
              style={{
                fontSize: 10,
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: 1,
                margin: 0,
              }}
            >
              User ID
            </p>
            <p
              style={{
                fontSize: 12,
                color: '#334155',
                margin: '2px 0 0 0',
                fontWeight: 600,
              }}
            >
              {user?.id || 'USR-000000'}
            </p>
          </div>

          {user?.mobile && (
            <div
              style={{
                padding: '12px 16px',
                borderBottom: '1px solid #e2e8f0',
              }}
            >
              <p
                style={{
                  fontSize: 10,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                  margin: 0,
                }}
              >
                Mobile
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: '#334155',
                  margin: '2px 0 0 0',
                  fontWeight: 600,
                }}
              >
                +91 {user.mobile}
              </p>
            </div>
          )}

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'transparent',
              border: 'none',
              color: '#dc2626',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#fef2f2')}
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = 'transparent')
            }
          >
            🚪 {t('logout') || 'Logout'}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserMenu;