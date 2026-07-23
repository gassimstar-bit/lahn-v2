/**
 * ©️ 2026 لحن الحياة - مشتل | جميع الحقوق محفوظة
 *
 * المالك: غاسم (gassimstar-bit)
 * المشروع: موقع مشتل لحن الحياة — الحصاحيصا · مروي · حلفا
 *
 * ⚠️  محمي بموجب قانون حقوق الملكية الفكرية والمؤلف.
 *
 * يُحظر تمامًا بدون إذن كتابي صريح من المالك:
 *   ✗ نسخ هذا الكود أو أي جزء منه
 *   ✗ تعديله أو إعادة توزيعه
 *   ✗ استخدامه لأغراض تجارية أو شخصية
 *   ✗ إنشاء أعمال مشتقة منه
 *   ✗ رفعه على أي منصة عامة
 *
 * المخالفة تعرض مرتكبها للمساءلة القانونية.
 *
 * للتواصل: واتساب +249912345678
 * ══════════════════════════════════════════════════
 */
/**
 * src/pages/LoginPage.jsx
 * صفحة تسجيل الدخول — Supabase Auth الرسمي
 * URL: /login (مخفي — لا يظهر في القائمة)
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { Spinner } from '../components/UI';

export default function LoginPage() {
  const { login, isAdmin } = useAuthContext();
  const navigate           = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  // لو مسجّل دخوله أصلاً
  if (isAdmin) {
    navigate('/admin', { replace: true });
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) return;
    setError('');
    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/admin', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', padding: 20, position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(135deg,#0d1117 0%,#0d2b0d 100%)',
      fontFamily: 'Cairo, sans-serif', direction: 'rtl',
    }}>
      {/* Decorative circles */}
      {[300, 500, 700].map((size, i) => (
        <div key={i} style={{
          position: 'absolute', width: size, height: size, borderRadius: '50%',
          border: '1px solid rgba(45,122,58,0.1)',
          top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          pointerEvents: 'none', animation: `pulse ${3+i}s ease-in-out infinite`,
        }} />
      ))}

      <div style={{
        background: 'rgba(22,27,34,0.92)', backdropFilter: 'blur(30px)',
        border: '1px solid rgba(45,122,58,0.25)', borderRadius: 24,
        padding: '48px 40px', width: '100%', maxWidth: 400,
        position: 'relative', boxShadow: '0 0 80px rgba(45,122,58,0.15)',
        animation: 'fadeInUp 0.5s ease',
      }}>
        {/* Back */}
        <button
          onClick={() => navigate('/')}
          style={{ position: 'absolute', top: 20, right: 20, background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: 18 }}
        >
          ✕
        </button>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 48, animation: 'float 3s ease-in-out infinite', display: 'inline-block' }}>🔐</div>
          <div style={{ color: 'white', fontWeight: 900, fontSize: 20, marginTop: 8 }}>لوحة التحكم</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, marginTop: 4 }}>لحن الحياة - مشتل</div>
        </div>

        {/* Security notice */}
        <div style={{
          background: 'rgba(45,122,58,0.1)', border: '1px solid rgba(45,122,58,0.3)',
          borderRadius: 12, padding: '10px 14px', marginBottom: 24,
          fontSize: 12, color: 'rgba(255,255,255,0.6)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>🛡</span>
          <span>مشفّر بـ Supabase Auth · 5 محاولات فقط</span>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 6, fontWeight: 600 }}>
              البريد الإلكتروني
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@example.com"
              autoComplete="email"
              required
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 12,
                border: '1.5px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                color: 'white', fontSize: 14, outline: 'none',
                fontFamily: 'Cairo, sans-serif', direction: 'ltr',
              }}
              onFocus={e => e.target.style.borderColor = '#2d7a3a'}
              onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: 'rgba(255,255,255,0.7)', fontSize: 13, marginBottom: 6, fontWeight: 600 }}>
              كلمة المرور
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
              style={{
                width: '100%', padding: '12px 16px', borderRadius: 12,
                border: '1.5px solid rgba(255,255,255,0.1)',
                background: 'rgba(255,255,255,0.05)',
                color: 'white', fontSize: 14, outline: 'none',
                fontFamily: 'Cairo, sans-serif', direction: 'ltr',
              }}
              onFocus={e => e.target.style.borderColor = '#2d7a3a'}
              onBlur={e  => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 10, padding: '10px 14px', color: '#fca5a5',
              fontSize: 13, fontWeight: 600,
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            style={{
              background: 'linear-gradient(135deg,#2d7a3a,#22c55e)',
              color: 'white', border: 'none', borderRadius: 12, padding: '14px',
              fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: 16,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: (loading || !email || !password) ? 0.6 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
              transition: 'all 0.25s',
            }}
          >
            {loading ? <><Spinner size={20} color="white" /> جارٍ التحقق...</> : '🔓 دخول آمن'}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>
          هذه الصفحة مخفية عن الزوار العاديين
        </div>
      </div>
    </div>
  );
}
