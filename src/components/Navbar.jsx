/**
 * ©️ 2026 لحن الحياة - مشتل | جميع الحقوق محفوظة
 *
 * المالك: قاسم (gassimstar-bit)
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
 * للتواصل: واتساب +249907200924
 * ══════════════════════════════════════════════════
 */
/**
 * src/components/Navbar.jsx
 * شريط التنقل — يظهر في كل الصفحات
 */
import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

export default function Navbar({
  dark, setDark, searchQuery, setSearchQuery, productsCount,
}) {
  const { isAdmin }  = useAuthContext();
  const navigate     = useNavigate();
  const [clicks, setClicks] = useState(0);

  // 5 نقرات على الشعار → صفحة تسجيل الدخول
  const handleLogoClick = useCallback(() => {
    const next = clicks + 1;
    setClicks(next);
    if (next >= 5) {
      setClicks(0);
      navigate(isAdmin ? '/admin' : '/login');
    }
  }, [clicks, isAdmin, navigate]);

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 100,
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(18px)',
      WebkitBackdropFilter: 'blur(18px)',
      borderBottom: '1px solid rgba(0,0,0,0.08)',
      padding: '0 16px',
    }}>
      <div style={{
        maxWidth: 1100, margin: '0 auto',
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between',
        height: 62, gap: 12,
      }}>

        {/* Logo */}
        <div
          onClick={handleLogoClick}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            cursor: 'pointer', userSelect: 'none', flexShrink: 0,
          }}
        >
          <div style={{ fontSize: 30, animation: 'float 3s ease-in-out infinite' }}>🌿</div>
          <div>
            <div style={{ fontWeight: 900, fontSize: 17, color: '#2d7a3a', lineHeight: 1 }}>
              لحن الحياة
            </div>
            <div style={{ fontSize: 10, color: '#4a6741', fontWeight: 600 }}>مشتل النباتات</div>
          </div>
        </div>

        {/* Search */}
        {setSearchQuery && (
          <div style={{ flex: 1, maxWidth: 340, position: 'relative' }}>
            <input
              value={searchQuery || ''}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="ابحث عن نبتتك..."
              style={{
                width: '100%', padding: '8px 36px 8px 14px',
                borderRadius: 12, border: '1.5px solid rgba(0,0,0,0.1)',
                background: 'rgba(0,0,0,0.03)', fontSize: 14,
                fontFamily: 'Cairo, sans-serif', outline: 'none',
                color: '#1a2e1a', direction: 'rtl',
              }}
            />
            <span style={{
              position: 'absolute', top: '50%', right: 10,
              transform: 'translateY(-50%)', fontSize: 15, pointerEvents: 'none',
            }}>
              🔍
            </span>
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            onClick={() => setDark(!dark)}
            style={{ background: 'none', border: 'none', fontSize: 19, cursor: 'pointer', padding: 5 }}
            title={dark ? 'وضع النهار' : 'الوضع الليلي'}
          >
            {dark ? '☀️' : '🌙'}
          </button>

          {productsCount !== undefined && (
            <span style={{ fontSize: 12, color: '#4a6741', fontWeight: 600 }}>
              {productsCount} منتج
            </span>
          )}

          {isAdmin && (
            <Link
              to="/admin"
              style={{
                background: 'linear-gradient(135deg,#2d7a3a,#22c55e)',
                color: 'white', borderRadius: 10,
                padding: '7px 14px', fontSize: 12,
                fontWeight: 700, textDecoration: 'none',
                fontFamily: 'Cairo, sans-serif',
              }}
            >
              لوحة التحكم
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
