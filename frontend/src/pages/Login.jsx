import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react';
import { useAuth } from '../context/useAuth';
import loginBg from '../assets/login.png';

function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [mode, setMode] = useState('login');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });

  const updateForm = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError('');
    setSuccess('');
  };

  const switchMode = (newMode) => {
    setMode(newMode);
    setError('');
    setSuccess('');
    setForm({
      name: '',
      email: '',
      mobile: '',
      password: '',
      confirmPassword: '',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'register') {
      if (!form.name.trim()) return setError('Enter full name');
      if (!form.email.trim()) return setError('Enter email');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
        return setError('Enter a valid email address');
      if (form.mobile.length !== 10) return setError('Mobile 10 digits');
      if (form.password.length < 8) return setError('Password must be at least 8 characters');
      if (form.password !== form.confirmPassword)
        return setError('Passwords do not match');
    } else {
      if (!form.email.trim()) return setError('Enter email');
      if (!form.password) return setError('Enter password');
    }

    setLoading(true);
    try {
      const result = mode === 'register'
        ? await register({
          name: form.name,
          email: form.email,
          mobile: form.mobile,
          password: form.password,
        }, rememberMe)
        : await login(
            { email: form.email, password: form.password },
            rememberMe
          );

      if (!result.success) {
        setError(result.error);
        return;
      }

      setSuccess(mode === 'register' ? 'Account created!' : 'Login successful!');
      setTimeout(() => navigate('/agent'), 500);
    } catch {
      setError('Could not complete sign-in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        width: '100vw',
        backgroundImage: `url(${loginBg})`,
        backgroundSize: '100% 100%',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* ===== WHITE CARD — image ke card pe exact fit ===== */}
      <div
        style={{
          position: 'absolute',
          top: '9%',
          right: '5%',
          width: '40%',
          height: '90%',
          background: '#ffffff',
          borderRadius: 28,
          boxShadow:
            '0 25px 70px rgba(30, 64, 175, 0.15), 0 10px 30px rgba(0,0,0,0.08)',
          padding: '32px 38px',
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          overflowY: 'auto',
        }}
      >
        {/* ===== AAVEDAN+ LOGO (CSS) ===== */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 12,
            marginBottom: 22,
          }}
        >
          {/* Logo mark */}
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 14,
              background:
                'linear-gradient(135deg, #1e40af 0%, #0b3d91 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              boxShadow: '0 8px 20px rgba(30,64,175,0.3)',
              overflow: 'hidden',
            }}
          >
            <span style={{ fontSize: 26, zIndex: 2 }}>🏛️</span>
            {/* Tiranga stripes at bottom */}
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 10,
                display: 'flex',
              }}
            >
              <div style={{ flex: 1, background: '#ff9933' }} />
              <div style={{ flex: 1, background: '#ffffff' }} />
              <div style={{ flex: 1, background: '#138808' }} />
            </div>
          </div>

          {/* AAVEDAN+ text */}
          <h1
            style={{
              fontSize: 32,
              fontWeight: 900,
              margin: 0,
              letterSpacing: '-1px',
              background: 'linear-gradient(135deg, #1e40af 0%, #0b3d91 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            AAVEDAN
            <span
              style={{
                color: '#138808',
                WebkitTextFillColor: '#138808',
                fontSize: 28,
              }}
            >
              +
            </span>
          </h1>
        </div>

        {/* ===== HEADING ===== */}
        <div style={{ textAlign: 'center', marginBottom: 22 }}>
          <h2
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: '#0f172a',
              margin: 0,
              letterSpacing: '-0.3px',
            }}
          >
            {mode === 'login'
              ? 'Login to Your Account'
              : 'Create Your Account'}
          </h2>
          <p
            style={{
              fontSize: 13,
              color: '#64748b',
              margin: '6px 0 0 0',
              fontWeight: 500,
            }}
          >
            {mode === 'login'
              ? 'Sign in to your local prototype account'
              : 'Create a local demo account in this browser'}
          </p>
        </div>

        {/* ===== TABS ===== */}
        <div
          style={{
            display: 'flex',
            background: '#f1f5f9',
            borderRadius: 12,
            padding: 5,
            marginBottom: 20,
          }}
        >
          {[
            { key: 'login', label: 'Login' },
            { key: 'register', label: 'Register' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => switchMode(tab.key)}
              style={{
                flex: 1,
                padding: '10px 14px',
                border: 'none',
                borderRadius: 9,
                background: mode === tab.key ? '#ffffff' : 'transparent',
                color: mode === tab.key ? '#1e40af' : '#64748b',
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
                boxShadow:
                  mode === tab.key
                    ? '0 2px 8px rgba(30,64,175,0.12)'
                    : 'none',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ===== FORM ===== */}
        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <InputField
              icon={UserIcon}
              placeholder="Full Name"
              value={form.name}
              onChange={(v) => updateForm('name', v)}
            />
          )}

          <InputField
            icon={Mail}
            placeholder={mode === 'register' ? 'Email address' : 'Email or mobile number'}
            type="text"
            value={form.email}
            onChange={(v) => updateForm('email', v)}
          />

          {mode === 'register' && (
            <InputField
              icon={Phone}
              placeholder="Mobile Number"
              value={form.mobile}
              onChange={(v) =>
                updateForm('mobile', v.replace(/\D/g, '').slice(0, 10))
              }
            />
          )}

          {/* Password */}
          <div style={{ position: 'relative', marginBottom: 14 }}>
            <Lock
              size={17}
              style={{
                position: 'absolute',
                left: 15,
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
                zIndex: 2,
              }}
            />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={form.password}
              onChange={(e) => updateForm('password', e.target.value)}
              style={{
                width: '100%',
                padding: '14px 44px 14px 44px',
                background: '#fff',
                border: '1.5px solid #e2e8f0',
                borderRadius: 12,
                fontSize: 14,
                fontWeight: 500,
                color: '#0f172a',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border 0.2s',
              }}
              onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
              onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: '#94a3b8',
                padding: 4,
                zIndex: 2,
              }}
            >
              {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>

          {mode === 'register' && (
            <InputField
              icon={Lock}
              placeholder="Confirm Password"
              type="password"
              value={form.confirmPassword}
              onChange={(v) => updateForm('confirmPassword', v)}
            />
          )}

          {/* Remember + Forgot */}
          {mode === 'login' && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 18,
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: 13,
                  color: '#475569',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{
                    width: 16,
                    height: 16,
                    accentColor: '#2563eb',
                    cursor: 'pointer',
                  }}
                />
                Remember me
              </label>
              <button
                type="button"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#2563eb',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Forgot Password?
              </button>
            </div>
          )}

          {/* Error / Success */}
          {error && (
            <div
              style={{
                padding: '10px 14px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 10,
                color: '#b91c1c',
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 14,
              }}
            >
              ⚠️ {error}
            </div>
          )}
          {success && (
            <div
              style={{
                padding: '10px 14px',
                background: '#ecfdf5',
                border: '1px solid #a7f3d0',
                borderRadius: 10,
                color: '#059669',
                fontSize: 13,
                fontWeight: 600,
                marginBottom: 14,
              }}
            >
              ✅ {success}
            </div>
          )}

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '15px',
              background: loading
                ? '#94a3b8'
                : 'linear-gradient(135deg, #1e40af 0%, #0b3d91 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              fontSize: 15,
              fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              boxShadow: loading
                ? 'none'
                : '0 10px 24px rgba(30,64,175,0.3)',
              transition: 'all 0.2s',
              letterSpacing: '0.3px',
            }}
          >
            {loading
              ? 'Please wait...'
              : mode === 'login'
              ? 'Login'
              : 'Create Account'}
            {!loading && <ArrowRight size={17} />}
          </button>
        </form>

        {/* Divider */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            margin: '18px 0',
          }}
        >
          <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
          <span
            style={{
              fontSize: 11,
              color: '#94a3b8',
              fontWeight: 600,
              letterSpacing: '0.5px',
            }}
          >
            OR CONTINUE WITH
          </span>
          <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
        </div>

        {/* DigiLocker */}
        <button
          type="button"
          style={{
            width: '100%',
            padding: '13px',
            background: '#fff',
            border: '1.5px solid #e2e8f0',
            borderRadius: 12,
            cursor: 'pointer',
            fontSize: 14,
            fontWeight: 700,
            color: '#334155',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = '#2563eb';
            e.currentTarget.style.background = '#f8fafc';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = '#e2e8f0';
            e.currentTarget.style.background = '#fff';
          }}
        >
          <span style={{ fontSize: 18 }}>🔐</span> Login with DigiLocker
        </button>

        {/* Register link */}
        <p
          style={{
            textAlign: 'center',
            fontSize: 13,
            color: '#64748b',
            marginTop: 18,
            marginBottom: 0,
            fontWeight: 500,
          }}
        >
          {mode === 'login'
            ? "Don't have an account?"
            : 'Already registered?'}{' '}
          <button
            type="button"
            onClick={() =>
              switchMode(mode === 'login' ? 'register' : 'login')
            }
            style={{
              background: 'transparent',
              border: 'none',
              color: '#2563eb',
              fontWeight: 800,
              fontSize: 13,
              cursor: 'pointer',
              padding: 0,
            }}
          >
            {mode === 'login' ? 'Register' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
}

function InputField({
  icon: Icon,
  placeholder,
  type = 'text',
  value,
  onChange,
}) {
  return (
    <div style={{ position: 'relative', marginBottom: 14 }}>
      <Icon
        size={17}
        style={{
          position: 'absolute',
          left: 15,
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#94a3b8',
          zIndex: 2,
        }}
      />
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: '100%',
          padding: '14px 14px 14px 44px',
          border: '1.5px solid #e2e8f0',
          borderRadius: 12,
          fontSize: 14,
          fontWeight: 500,
          color: '#0f172a',
          outline: 'none',
          boxSizing: 'border-box',
          background: '#fff',
          transition: 'border 0.2s',
        }}
        onFocus={(e) => (e.target.style.borderColor = '#2563eb')}
        onBlur={(e) => (e.target.style.borderColor = '#e2e8f0')}
      />
    </div>
  );
}

export default Login;
