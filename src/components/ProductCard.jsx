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
 * src/components/ProductCard.jsx
 * بطاقة المنتج — مع 3D tilt effect
 */
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { PlaceholderImg, Badge, Stars } from './UI';
import { formatPrice, getDiscount } from '../lib/utils';

export default function ProductCard({ product: p, index = 0, wishlist = [], onWishlist }) {
  const cardRef = useRef(null);
  const discount = getDiscount(p.price, p.old_price);
  const isWished = wishlist.includes(p.id);

  function handleMouseMove(e) {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width  - 0.5) * 10;
    const y = ((e.clientY - rect.top)  / rect.height - 0.5) * -10;
    card.style.transform = `translateY(-7px) scale(1.02) rotateY(${x}deg) rotateX(${y}deg)`;
  }

  function handleMouseLeave() {
    if (cardRef.current) cardRef.current.style.transform = '';
  }

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(18px)',
        border: '1px solid rgba(0,0,0,0.08)',
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
        cursor: 'pointer',
        transition: 'transform 0.35s cubic-bezier(0.23,1,0.32,1), box-shadow 0.35s ease',
        animation: `fadeInUp 0.5s ease ${index * 0.06}s both`,
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Image area */}
      <Link to={`/product/${p.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
          {p.images?.[0] ? (
            <img
              src={p.images[0]}
              alt={`${p.name} - مشتل لحن الحياة`}
              loading="lazy"
              decoding="async"
              onContextMenu={e => e.preventDefault()}
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                transition: 'transform 0.5s ease',
                userSelect: 'none',
              }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.1)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            />
          ) : (
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: '100%', background: '#e8f5e9',
            }}>
              <PlaceholderImg index={index} size={150} />
            </div>
          )}

          {/* Badges */}
          <div style={{
            position: 'absolute', top: 10, right: 10,
            display: 'flex', flexDirection: 'column', gap: 5,
          }}>
            {p.is_new          && <Badge type="new"  label="✨ جديد" />}
            {p.is_best_seller  && <Badge type="hot"  label="🔥" />}
            {p.is_limited_offer && <Badge type="sale" label="⚡" />}
            {p.stock === 0     && <Badge type="out"  label="نفذ" />}
            {discount > 0 && (
              <span style={{
                background: '#ef4444', color: 'white',
                borderRadius: 7, padding: '2px 7px',
                fontSize: 10, fontWeight: 800,
              }}>
                -{discount}%
              </span>
            )}
          </div>

          {/* Wishlist */}
          <button
            onClick={e => { e.preventDefault(); onWishlist?.(p.id); }}
            style={{
              position: 'absolute', top: 10, left: 10,
              width: 32, height: 32, borderRadius: '50%',
              background: 'rgba(255,255,255,0.85)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(0,0,0,0.08)',
              cursor: 'pointer', fontSize: 15,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s',
            }}
          >
            {isWished ? '❤️' : '🤍'}
          </button>

          {/* Views */}
          <div style={{
            position: 'absolute', bottom: 7, left: 7,
            background: 'rgba(0,0,0,0.55)', color: 'white',
            fontSize: 10, padding: '2px 7px', borderRadius: 7,
            backdropFilter: 'blur(4px)',
          }}>
            👁 {p.views || 0}
          </div>
        </div>
      </Link>

      {/* Info */}
      <div style={{ padding: '14px' }}>
        {p.categories && (
          <span style={{
            background: 'rgba(45,122,58,0.12)', color: '#2d7a3a',
            borderRadius: 7, padding: '2px 9px', fontSize: 11, fontWeight: 600,
            marginBottom: 6, display: 'inline-block',
          }}>
            {p.categories.icon} {p.categories.name}
          </span>
        )}

        <Link to={`/product/${p.id}`} style={{ textDecoration: 'none' }}>
          <div style={{ fontWeight: 800, fontSize: 15, color: '#1a2e1a', lineHeight: 1.3, marginTop: 4 }}>
            {p.name}
          </div>
          {p.name_en && (
            <div style={{ fontSize: 10, color: '#4a6741', direction: 'ltr', textAlign: 'left', marginTop: 1 }}>
              {p.name_en}
            </div>
          )}
          <div style={{
            fontSize: 12, color: '#4a6741', marginTop: 7,
            lineHeight: 1.5, height: 36, overflow: 'hidden',
          }}>
            {p.description}
          </div>
        </Link>

        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', marginTop: 12, flexWrap: 'wrap', gap: 6,
        }}>
          <div>
            <span style={{ fontWeight: 900, fontSize: 18, color: '#2d7a3a' }}>
              {p.price + "ج.س."}
            </span>
            {p.old_price && (
              <span style={{
                textDecoration: 'line-through', color: '#4a6741',
                fontSize: 12, marginRight: 6,
              }}>
                {p.old_price + "ج.س."}
              </span>
            )}
          </div>
          <Stars n={Math.floor(3 + (p.views % 3))} />
        </div>

        {p.stock > 0 && p.stock <= 5 && (
          <div style={{ color: '#f59e0b', fontSize: 11, fontWeight: 700, marginTop: 5 }}>
            ⚠️ باقي {p.stock} فقط!
          </div>
        )}
      </div>
    </div>
  );
}
