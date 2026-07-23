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
 * src/pages/ProductPage.jsx
 * صفحة المنتج — URL حقيقي /product/:id
 * 3D parallax effect + image gallery + related products
 */
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import { PlaceholderImg, Stars, Badge, Btn } from '../components/UI';
import { getProduct, getProducts, incrementViews, incrementClicks } from '../lib/database';
import { formatPrice, getDiscount, openWhatsApp, buildAltText } from '../lib/utils';

const WISHLIST_KEY = 'lahn_wishlist';
const VIEWED_KEY   = 'lahn_viewed';

function getWishlist() {
  try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]'); } catch { return []; }
}

export default function ProductPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();

  const [product,  setProduct]  = useState(null);
  const [related,  setRelated]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);
  const [imgIdx,   setImgIdx]   = useState(0);
  const [wishlist, setWishlist] = useState(getWishlist);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [is3D,     setIs3D]     = useState(false);
  const imgRef = useRef(null);

  // SEO: تحديث عنوان الصفحة
  useEffect(() => {
    if (product) {
      document.title = `${product.name} | لحن الحياة - مشتل الحصاحيصا`;
    }
    return () => { document.title = 'لحن الحياة - مشتل'; };
  }, [product]);

  // جلب المنتج
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const [p, allProducts] = await Promise.all([
          getProduct(id),
          getProducts({ status: 'published' }),
        ]);
        setProduct(p);
        setRelated(allProducts.filter(x => x.id !== id && x.category_id === p.category_id).slice(0, 4));

        // تتبع المشاهدة
        await incrementViews(id);

        // حفظ في المشاهدات الأخيرة
        try {
          const viewed = JSON.parse(localStorage.getItem(VIEWED_KEY) || '[]');
          const next   = [id, ...viewed.filter(x => x !== id)].slice(0, 20);
          localStorage.setItem(VIEWED_KEY, JSON.stringify(next));
        } catch {}

      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  // تبديل الصور تلقائياً
  useEffect(() => {
    if (!product?.images?.length || product.images.length <= 1) return;
    const iv = setInterval(() => setImgIdx(i => (i + 1) % product.images.length), 3500);
    return () => clearInterval(iv);
  }, [product]);

  function toggleWishlist() {
    const next = wishlist.includes(id)
      ? wishlist.filter(x => x !== id)
      : [...wishlist, id];
    setWishlist(next);
    try { localStorage.setItem(WISHLIST_KEY, JSON.stringify(next)); } catch {}
    toast(wishlist.includes(id) ? 'تمت الإزالة من المفضلة' : '❤️ أضيف للمفضلة');
  }

  function handleImgMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x:  ((e.clientX - rect.left)  / rect.width  - 0.5) * 20,
      y: -((e.clientY - rect.top)   / rect.height - 0.5) * 15,
    });
    setIs3D(true);
  }

  function handleWA() {
    if (product) {
      incrementClicks(id);
      openWhatsApp(product);
    }
  }

  function shareProduct() {
    if (navigator.share) {
      navigator.share({ title: product.name, text: product.description, url: window.location.href });
    } else {
      navigator.clipboard?.writeText(window.location.href);
      toast('📋 تم نسخ الرابط');
    }
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cairo, sans-serif' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 48, animation: 'float 2s ease-in-out infinite', marginBottom: 16 }}>🌿</div>
          <div style={{ width: 40, height: 40, border: '3px solid #2d7a3a', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cairo, sans-serif', gap: 16 }}>
        <div style={{ fontSize: 48 }}>😕</div>
        <h2>المنتج غير موجود</h2>
        <button onClick={() => navigate('/')} style={{ background: '#2d7a3a', color: 'white', border: 'none', borderRadius: 12, padding: '10px 24px', fontFamily: 'Cairo, sans-serif', fontWeight: 700, cursor: 'pointer' }}>
          ← العودة للمتجر
        </button>
      </div>
    );
  }

  const discount   = getDiscount(product.price, product.old_price);
  const isWished   = wishlist.includes(id);
  const catName    = product.categories?.name || '';

  return (
    <div style={{ minHeight: '100vh', background: '#f0f7f0', direction: 'rtl', fontFamily: 'Cairo, sans-serif' }}>
      <Navbar dark={false} setDark={() => {}} />

      {/* Breadcrumb */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '12px 20px', fontSize: 13, color: '#4a6741', display: 'flex', alignItems: 'center', gap: 6 }}>
        <Link to="/" style={{ color: '#2d7a3a', textDecoration: 'none', fontWeight: 700 }}>المتجر</Link>
        <span>←</span>
        <span>{catName}</span>
        <span>←</span>
        <span style={{ color: '#1a2e1a', fontWeight: 600 }}>{product.name}</span>
      </div>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '16px 20px 48px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, alignItems: 'start' }}>

          {/* ── Images ── */}
          <div>
            {/* Main image with 3D parallax */}
            <div
              onMouseMove={handleImgMove}
              onMouseLeave={() => { setIs3D(false); setMousePos({ x: 0, y: 0 }); }}
              style={{
                borderRadius: 24, overflow: 'hidden', height: 360,
                background: '#e8f5e9', display: 'flex', alignItems: 'center',
                justifyContent: 'center', perspective: '800px', cursor: 'crosshair',
                boxShadow: is3D
                  ? `${mousePos.x * -2}px ${mousePos.y * 2}px 60px rgba(45,122,58,0.4)`
                  : '0 8px 32px rgba(45,122,58,0.15)',
                transition: 'box-shadow 0.3s ease',
                position: 'relative',
              }}
            >
              {product.images?.[imgIdx] ? (
                <img
                  ref={imgRef}
                  src={product.images[imgIdx]}
                  alt={buildAltText(product, imgIdx, catName)}
                  loading={imgIdx === 0 ? 'eager' : 'lazy'}
                  onContextMenu={e => e.preventDefault()}
                  draggable={false}
                  style={{
                    width: '100%', height: '100%', objectFit: 'cover',
                    userSelect: 'none',
                    transform: `rotateY(${mousePos.x}deg) rotateX(${mousePos.y}deg) scale(${is3D ? 1.04 : 1})`,
                    transition: is3D ? 'transform 0.1s ease' : 'transform 0.5s ease',
                  }}
                />
              ) : (
                <div style={{ animation: 'float 3s ease-in-out infinite' }}>
                  <PlaceholderImg index={0} size={240} />
                </div>
              )}

              {/* Glass reflection */}
              <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: 'linear-gradient(135deg,rgba(255,255,255,0.1) 0%,transparent 50%)',
              }} />
            </div>

            {/* Thumbnails */}
            {product.images?.length > 1 && (
              <>
                <div style={{ display: 'flex', gap: 10, marginTop: 12, overflowX: 'auto' }}>
                  {product.images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      style={{
                        width: 72, height: 72, borderRadius: 12,
                        overflow: 'hidden', padding: 0, cursor: 'pointer', flexShrink: 0,
                        border: `2px solid ${i === imgIdx ? '#2d7a3a' : 'rgba(0,0,0,0.08)'}`,
                        transition: 'border-color 0.2s',
                      }}
                    >
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
                {/* Dots */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 10 }}>
                  {product.images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      style={{
                        width: i === imgIdx ? 20 : 8, height: 8, borderRadius: 4,
                        background: i === imgIdx ? '#2d7a3a' : 'rgba(0,0,0,0.15)',
                        border: 'none', cursor: 'pointer', transition: 'all 0.3s',
                      }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* ── Product Info ── */}
          <div>
            {/* Badges */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
              {product.is_new           && <Badge type="new"  label="✨ جديد" />}
              {product.is_best_seller   && <Badge type="hot"  label="🔥 الأكثر مبيعاً" />}
              {product.is_limited_offer && <Badge type="sale" label="⚡ عرض محدود" />}
              {product.stock === 0      && <Badge type="out"  label="نفذ المخزون" />}
              {catName && (
                <span style={{ background: 'rgba(45,122,58,0.12)', color: '#2d7a3a', borderRadius: 8, padding: '3px 10px', fontSize: 12, fontWeight: 700 }}>
                  {product.categories?.icon} {catName}
                </span>
              )}
            </div>

            <h1 style={{ fontSize: 30, fontWeight: 900, color: '#1a2e1a', lineHeight: 1.2, marginBottom: 6 }}>
              {product.name}
            </h1>
            {product.name_en && (
              <p style={{ fontSize: 14, color: '#4a6741', direction: 'ltr', marginBottom: 16 }}>
                {product.name_en}
              </p>
            )}

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
              <span style={{ fontSize: 36, fontWeight: 900, color: '#2d7a3a' }}>
                {formatPrice(product.price)}
              </span>
              {product.old_price && (
                <>
                  <span style={{ textDecoration: 'line-through', color: '#4a6741', fontSize: 20 }}>
                    {formatPrice(product.old_price)}
                  </span>
                  <span style={{ background: '#ef4444', color: 'white', borderRadius: 8, padding: '3px 10px', fontWeight: 800, fontSize: 14 }}>
                    -{discount}%
                  </span>
                </>
              )}
            </div>

            {/* Rating */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 18 }}>
              <Stars n={Math.floor(3 + (product.views % 3))} />
              <span style={{ fontSize: 13, color: '#4a6741' }}>
                👁 {product.views || 0} مشاهدة · 🛒 {product.clicks || 0} طلب
              </span>
            </div>

            {/* Description */}
            <p style={{ lineHeight: 1.8, color: '#4a6741', fontSize: 15, marginBottom: 22 }}>
              {product.description}
            </p>

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 22 }}>
                {product.tags.map((t, i) => (
                  <span key={i} style={{ background: 'rgba(45,122,58,0.1)', color: '#2d7a3a', borderRadius: 8, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
                    #{t}
                  </span>
                ))}
              </div>
            )}

            {/* Stock */}
            <div style={{
              marginBottom: 22, padding: '12px 16px', borderRadius: 12,
              background: product.stock > 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
              border: `1px solid ${product.stock > 0 ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
            }}>
              <span style={{ fontWeight: 700, color: product.stock > 0 ? '#22c55e' : '#ef4444', fontSize: 14 }}>
                {product.stock > 0 ? `✅ متوفر — ${product.stock} قطعة` : '❌ نفذ المخزون'}
              </span>
              {product.stock > 0 && product.stock <= 5 && (
                <span style={{ color: '#f59e0b', fontSize: 13, fontWeight: 700, marginRight: 12 }}>
                  ⚠️ باقي {product.stock} فقط!
                </span>
              )}
            </div>

            {/* CTAs */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Btn
                onClick={handleWA}
                variant="wa"
                style={{ padding: '14px 24px', fontSize: 16, borderRadius: 14, boxShadow: '0 8px 24px rgba(37,211,102,0.35)' }}
              >
                <span style={{ fontSize: 22 }}>📱</span>
                اطلب الآن عبر واتساب
              </Btn>

              <div style={{ display: 'flex', gap: 10 }}>
                <Btn onClick={toggleWishlist} variant="ghost" style={{ flex: 1 }}>
                  {isWished ? '❤️ في المفضلة' : '🤍 أضف للمفضلة'}
                </Btn>
                <Btn onClick={shareProduct} variant="ghost" style={{ flex: 1 }}>
                  📤 مشاركة
                </Btn>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {related.length > 0 && (
          <div style={{ marginTop: 56 }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a2e1a', marginBottom: 20, position: 'relative', display: 'inline-block' }}>
              🌿 منتجات مشابهة
              <div style={{ position: 'absolute', bottom: -3, right: 0, width: '55%', height: 3, background: 'linear-gradient(90deg,#2d7a3a,transparent)', borderRadius: 2 }} />
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 18 }}>
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} wishlist={wishlist} onWishlist={toggleWishlist} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
