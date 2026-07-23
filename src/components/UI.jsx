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
 * src/components/UI.jsx
 * مكونات الواجهة المشتركة
 */
import { useEffect, useState } from 'react';
import { PLANT_EMOJIS } from '../lib/utils';

/** صورة بديلة عند غياب الصورة الحقيقية */
export function PlaceholderImg({ index = 0, size = 200 }) {
  const emoji = PLANT_EMOJIS[index % PLANT_EMOJIS.length];
  const hue   = (index * 47 + 120) % 360;
  return (
    <div style={{
      width: size, height: size, borderRadius: 16, userSelect: 'none',
      background: `linear-gradient(135deg,hsl(${hue},60%,88%),hsl(${(hue+40)%360},50%,78%))`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.38,
    }}>
      {emoji}
    </div>
  );
}

/** عداد تنازلي للعروض */
export function Countdown({ endTs }) {
  const [t, setT] = useState(endTs - Date.now());
  useEffect(() => {
    const iv = setInterval(() => setT(endTs - Date.now()), 1000);
    return () => clearInterval(iv);
  }, [endTs]);

  if (t <= 0) return <span>انتهى</span>;
  const h = Math.floor(t / 3600000);
  const m = Math.floor((t % 3600000) / 60000);
  const s = Math.floor((t % 60000) / 1000);
  const p = n => String(n).padStart(2, '0');
  return (
    <span style={{ fontFamily: 'monospace', letterSpacing: 2 }}>
      {p(h)}:{p(m)}:{p(s)}
    </span>
  );
}

/** نجوم التقييم */
export function Stars({ n = 4 }) {
  return (
    <span style={{ color: '#f59e0b', fontSize: 13 }}>
      {'★'.repeat(Math.min(5, Math.max(0, n)))}
      {'☆'.repeat(5 - Math.min(5, Math.max(0, n)))}
    </span>
  );
}

/** شريط تحميل Skeleton */
export function Skeleton({ w = '100%', h = 20, r = 8 }) {
  return (
    <div style={{
      width: w, height: h, borderRadius: r,
      background: 'linear-gradient(90deg,#e0e0e0 25%,#f0f0f0 50%,#e0e0e0 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.4s infinite',
    }} />
  );
}

/** شارة منتج */
export function Badge({ type, label }) {
  const styles = {
    new:    { bg: '#3b82f6' },
    hot:    { bg: '#ef4444' },
    sale:   { bg: '#f59e0b' },
    out:    { bg: '#6b7280' },
    draft:  { bg: '#7c3aed' },
  };
  const s = styles[type] || styles.out;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 10px', borderRadius: 20,
      fontSize: 11, fontWeight: 700,
      background: s.bg, color: 'white',
      animation: 'badgePop 0.4s ease',
    }}>
      {label}
    </span>
  );
}

/** زر رئيسي */
export function Btn({ children, onClick, disabled, style = {}, variant = 'primary' }) {
  const base = {
    fontFamily: 'Cairo, sans-serif', fontWeight: 700,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    border: 'none', borderRadius: 12,
    padding: '10px 20px', fontSize: 14,
    transition: 'all 0.25s', display: 'inline-flex',
    alignItems: 'center', justifyContent: 'center', gap: 8,
  };
  const variants = {
    primary: { background: 'linear-gradient(135deg,#2d7a3a,#22c55e)', color: 'white' },
    ghost:   { background: 'transparent', border: '1.5px solid rgba(0,0,0,0.1)', color: '#1a2e1a' },
    danger:  { background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444' },
    wa:      { background: 'linear-gradient(135deg,#25d366,#128c7e)', color: 'white' },
  };
  return (
    <button
      onClick={disabled ? undefined : onClick}
      style={{ ...base, ...variants[variant], ...style }}
      onMouseEnter={e => { if (!disabled && variant === 'primary') e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; }}
    >
      {children}
    </button>
  );
}

/** Spinner تحميل */
export function Spinner({ size = 24, color = '#2d7a3a' }) {
  return (
    <div style={{
      width: size, height: size,
      border: `3px solid ${color}33`,
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
  );
}

/** بطاقة زجاجية */
export function GlassCard({ children, style = {}, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(18px)',
        WebkitBackdropFilter: 'blur(18px)',
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 20,
        boxShadow: '0 8px 32px rgba(45,122,58,0.15)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/** حقل إدخال */
export function Field({ label, children, required }) {
  return (
    <div>
      <label style={{
        display: 'block', fontWeight: 700,
        fontSize: 13, marginBottom: 6, color: '#1a2e1a',
      }}>
        {label}{required && <span style={{ color: '#ef4444' }}> *</span>}
      </label>
      {children}
    </div>
  );
}

export function inputCss(dark = false) {
  return {
    width: '100%', padding: '10px 14px', borderRadius: 10, fontSize: 14,
    fontFamily: 'Cairo, sans-serif', outline: 'none', direction: 'rtl',
    border: `1.5px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`,
    background: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
    color: dark ? 'white' : '#1a2e1a',
  };
}
