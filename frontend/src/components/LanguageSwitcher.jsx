import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/useLanguage';

const LanguageSwitcher = () => {
  const { language, toggleLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Bahar click karne pe dropdown band ho jaye
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const languages = [
    { code: 'en', label: 'English', short: 'English' },
    { code: 'hi', label: 'हिंदी', short: 'Hindi' },
  ];

  const currentLang = languages.find((l) => l.code === language);

  return (
    <div ref={dropdownRef} style={{ position: 'relative' }}>
      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '8px 16px',
          background: '#fff',
          border: '1px solid #cbd5e1',
          borderRadius: 8,
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 500,
          color: '#1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {currentLang.short}
        <span style={{ fontSize: 10 }}>▼</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '110%',
            right: 0,
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            minWidth: 140,
            zIndex: 1000,
            overflow: 'hidden',
          }}
        >
          {languages.map((lang) => (
            <div
              key={lang.code}
              onClick={() => {
                toggleLanguage(lang.code);
                setIsOpen(false);
              }}
              style={{
                padding: '10px 16px',
                cursor: 'pointer',
                fontSize: 14,
                background: language === lang.code ? '#eff6ff' : '#fff',
                color: language === lang.code ? '#2563eb' : '#334155',
                fontWeight: language === lang.code ? 600 : 400,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
              onMouseEnter={(e) => {
                if (language !== lang.code)
                  e.currentTarget.style.background = '#f8fafc';
              }}
              onMouseLeave={(e) => {
                if (language !== lang.code)
                  e.currentTarget.style.background = '#fff';
              }}
            >
              {lang.label}
              {language === lang.code && <span>✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
