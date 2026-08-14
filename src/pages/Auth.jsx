import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const Auth = () => {
  const { t } = useLanguage();
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateForm = () => {
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError(t('auth.errorEmailRequired'));
      return false;
    }
    if (!validateEmail(email)) {
      setError(t('auth.errorEmailInvalid'));
      return false;
    }
    if (!password) {
      setError(t('auth.errorPasswordRequired'));
      return false;
    }
    if (password.length < 6) {
      setError(t('auth.errorPasswordShort'));
      return false;
    }

    if (!isLogin) {
      if (!fullName.trim()) {
        setError(t('auth.errorNameRequired'));
        return false;
      }
      if (password !== confirmPassword) {
        setError(t('auth.errorPasswordMismatch'));
        return false;
      }
    }

    return true;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(email, password);
    } catch (err) {
      console.error("Login Error:", err);
      const msg = err.message || '';
      if (msg.includes('Invalid login credentials')) {
        setError(t('auth.errorInvalidCredentials'));
      } else if (msg.includes('Email not confirmed')) {
        setError(t('auth.errorEmailNotConfirmed'));
      } else {
        setError(t('auth.errorLoginFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const data = await signup(email, password, fullName);
      
      if (data && data.user) {
        if (data.session) {
          // Auto-login successful — AuthContext will handle redirect
          setSuccess(t('auth.successSignup'));
        } else {
          // Email confirmation might be required
          setSuccess(t('auth.successCheckEmail'));
        }
      }
    } catch (err) {
      console.error("Signup Error:", err);
      const msg = err.message || '';
      if (msg.includes('already registered') || msg.includes('already exists')) {
        setError(t('auth.errorEmailExists'));
      } else {
        setError(t('auth.errorSignupFailed'));
      }
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccess('');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f8fcf8', padding: '20px' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px' }}>
        
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '10px' }}>
          <div style={{ width: '50px', height: '50px', background: '#e7f5e9', borderRadius: '14px', display: 'inline-flex', justifyContent: 'center', alignItems: 'center', fontSize: '26px', marginBottom: '12px' }}>🌿</div>
          <h2 style={{ margin: '0 0 5px 0', color: '#166534', fontFamily: 'Manrope, sans-serif' }}>KrishiSetu</h2>
        </div>

        <h3 style={{ textAlign: 'center', marginBottom: '25px', color: '#506158', fontWeight: '500', fontSize: '16px' }}>
          {isLogin ? t('auth.signIn') : t('auth.signUp')}
        </h3>
        
        {error && (
          <div style={{ color: '#991b1b', marginBottom: '15px', textAlign: 'center', fontSize: '14px', padding: '12px 15px', background: '#fef2f2', borderRadius: '10px', border: '1px solid #fecaca', lineHeight: 1.4 }}>
            {error}
          </div>
        )}

        {success && (
          <div style={{ color: '#166534', marginBottom: '15px', textAlign: 'center', fontSize: '14px', padding: '12px 15px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0', lineHeight: 1.4 }}>
            {success}
          </div>
        )}
        
        {isLogin ? (
          <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="email" placeholder={t('auth.email')} value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '12px 15px', borderRadius: '10px', border: '1px solid #d8e5da', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#15803d'} onBlur={e => e.target.style.borderColor = '#d8e5da'} />
            <input type="password" placeholder={t('auth.password')} value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '12px 15px', borderRadius: '10px', border: '1px solid #d8e5da', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#15803d'} onBlur={e => e.target.style.borderColor = '#d8e5da'} />
            
            <button type="submit" className="primary-btn" disabled={loading} style={{ marginTop: '5px', opacity: loading ? 0.7 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '13px' }}>
              {loading && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
              {loading ? t('auth.processing') : t('auth.signIn')}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <input type="text" placeholder={t('auth.fullName')} value={fullName} onChange={e => setFullName(e.target.value)} style={{ padding: '12px 15px', borderRadius: '10px', border: '1px solid #d8e5da', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#15803d'} onBlur={e => e.target.style.borderColor = '#d8e5da'} />
            <input type="email" placeholder={t('auth.email')} value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '12px 15px', borderRadius: '10px', border: '1px solid #d8e5da', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#15803d'} onBlur={e => e.target.style.borderColor = '#d8e5da'} />
            <input type="password" placeholder={t('auth.password')} value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '12px 15px', borderRadius: '10px', border: '1px solid #d8e5da', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#15803d'} onBlur={e => e.target.style.borderColor = '#d8e5da'} />
            <input type="password" placeholder={t('auth.confirmPassword')} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{ padding: '12px 15px', borderRadius: '10px', border: '1px solid #d8e5da', fontSize: '15px', outline: 'none', transition: 'border-color 0.2s' }} onFocus={e => e.target.style.borderColor = '#15803d'} onBlur={e => e.target.style.borderColor = '#d8e5da'} />
            
            <p style={{ margin: 0, fontSize: '12px', color: '#718278' }}>{t('auth.passwordHint')}</p>

            <button type="submit" className="primary-btn" disabled={loading} style={{ marginTop: '5px', opacity: loading ? 0.7 : 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '13px' }}>
              {loading && <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />}
              {loading ? t('auth.processing') : t('auth.signUp')}
            </button>
          </form>
        )}
        
        <div style={{ marginTop: '20px', textAlign: 'center' }}>
          <button onClick={switchMode} type="button" style={{ background: 'none', border: 'none', color: '#166534', cursor: 'pointer', textDecoration: 'underline', fontSize: '14px' }}>
            {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
