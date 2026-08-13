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
 * src/pages/StorePage.jsx
 * الصفحة الرئيسية — كتالوج المنتجات
 */
import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import ProductCard from '../components/ProductCard';
import { Countdown, Skeleton, GlassCard } from '../components/UI';
import { useProducts } from '../hooks/useProducts';
import { formatPrice, openWhatsApp } from '../lib/utils';
import { incrementClicks } from '../lib/database';

const WISHLIST_KEY = 'lahn_wishlist';

function getWishlist() {
  try { return JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]'); } catch { return []; }
}
function saveWishlist(list) {
  try { localStorage.setItem(WISHLIST_KEY, JSON.stringify(list)); } catch {}
}

export default function StorePage() {
  const [dark,          setDark]          = useState(false);
  const [searchQuery,   setSearchQuery]   = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy,        setSortBy]        = useState('newest');
  const [wishlist,      setWishlist]      = useState(getWishlist);
  const [heroIdx,       setHeroIdx]       = useState(0);

  const { products, categories, settings, loading, error } = useProducts({ status: 'published' });
  const navigate = useNavigate();

  // Wishlist toggle
  function toggleWishlist(id) {
    const next = wishlist.includes(id)
      ? wishlist.filter(x => x !== id)
      : [...wishlist, id];
    setWishlist(next);
    saveWishlist(next);
    toast(wishlist.includes(id) ? 'تمت الإزالة من المفضلة' : '❤️ أضيف للمفضلة');
  }

  // Filtered & sorted products
  const filtered = useMemo(() => {
    let list = products;
    if (activeCategory !== 'all') list = list.filter(p => p.category_id === activeCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      );
    }
    if (sortBy === 'newest')     list = [...list].sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
    if (sortBy === 'popular')    list = [...list].sort((a,b) => (b.views||0) - (a.views||0));
    if (sortBy === 'price_asc')  list = [...list].sort((a,b) => a.price - b.price);
    if (sortBy === 'price_desc') list = [...list].sort((a,b) => b.price - a.price);
    return list;
  }, [products, activeCategory, searchQuery, sortBy]);

  const heroes      = useMemo(() => products.filter(p => p.is_best_seller).slice(0, 3), [products]);
  const flashSale   = useMemo(() => filtered.filter(p => p.is_limited_offer), [filtered]);
  const newProducts = useMemo(() => filtered.filter(p => p.is_new), [filtered]);
  const bestSellers = useMemo(() => filtered.filter(p => p.is_best_seller), [filtered]);

  const flashSaleEnd = settings.flash_sale_end
    ? Number(settings.flash_sale_end)
    : Date.now() + 48 * 3600000;

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#0d2b0d', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, fontFamily: 'Cairo, sans-serif' }}>
        <div style={{ fontSize: 64, animation: 'float 2s ease-in-out infinite' }}>🌿</div>
        <div style={{ color: '#22c55e', fontSize: 22, fontWeight: 800 }}>لحن الحياة</div>
        <div style={{ width: 40, height: 40, border: '3px solid #22c55e', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cairo, sans-serif', textAlign: 'center', padding: 20 }}>
        <div>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ marginBottom: 8 }}>خطأ في تحميل المنتجات</h2>
          <p style={{ color: '#4a6741', marginBottom: 20 }}>{error}</p>
          <button onClick={() => window.location.reload()} style={{ background: '#2d7a3a', color: 'white', border: 'none', borderRadius: 12, padding: '10px 24px', fontFamily: 'Cairo, sans-serif', fontWeight: 700, cursor: 'pointer' }}>
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: dark ? 'linear-gradient(135deg,#0d1117,#0d2b0d)' : 'linear-gradient(135deg,#f0f7f0,#e8f5e9)', direction: 'rtl', fontFamily: 'Cairo, sans-serif' }}>

      <Navbar dark={dark} setDark={setDark} searchQuery={searchQuery} setSearchQuery={setSearchQuery} productsCount={filtered.length} />

      {/* Hero */}
      {heroes.length > 0 && (
        <div style={{ background: dark ? 'linear-gradient(135deg,#0d2b0d,#1a3a1a)' : 'linear-gradient(135deg,#1a5226,#2d7a3a)', padding: '48px 20px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 32, flexWrap: 'wrap' }}>
            <div style={{ color: 'white', flex: 1, minWidth: 240 }}>
              <div style={{ background: 'rgba(255,255,255,0.15)', display: 'inline-block', padding: '3px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, marginBottom: 14 }}>
                🌟 أفضل منتجاتنا
              </div>
              <h1 style={{ fontSize: 36, fontWeight: 900, lineHeight: 1.2, marginBottom: 12 }}>
                {heroes[heroIdx]?.name || 'مرحباً بك'}
              </h1>
              <p style={{ opacity: 0.85, fontSize: 15, marginBottom: 24, maxWidth: 380, lineHeight: 1.7 }}>
                {heroes[heroIdx]?.description?.slice(0, 90)}...
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={() => { incrementClicks(heroes[heroIdx].id); navigate(`/product/${heroes[heroIdx].id}`); }}
                  style={{ background: 'white', color: '#2d7a3a', border: 'none', borderRadius: 12, padding: '11px 24px', fontFamily: 'Cairo, sans-serif', fontWeight: 800, cursor: 'pointer', fontSize: 14 }}
                >
                  تسوق الآن 🛒
                </button>
                <div style={{ background: 'rgba(255,255,255,0.15)', padding: '11px 18px', borderRadius: 12, color: 'white', fontWeight: 700, fontSize: 14 }}>
                  {formatPrice(heroes[heroIdx]?.price)}
                </div>
              </div>
            </div>
            <div style={{ width: 180, height: 180, borderRadius: 22, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', animation: 'float 4s ease-in-out infinite', border: '1px solid rgba(255,255,255,0.2)', overflow: 'hidden', flexShrink: 0 }}>
              {heroes[heroIdx]?.images?.[0]
                ? <img src={heroes[heroIdx].images[0]} alt={heroes[heroIdx].name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onContextMenu={e=>e.preventDefault()} draggable={false} />
                : <div style={{ fontSize: 80 }}>🌿</div>
              }
            </div>
          </div>
          {heroes.length > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
              {heroes.map((_,i) => (
                <button key={i} onClick={() => setHeroIdx(i)} style={{ width: i===heroIdx?20:8, height: 8, borderRadius: 4, background: i===heroIdx?'white':'rgba(255,255,255,0.35)', border: 'none', cursor: 'pointer', transition: 'all 0.3s' }} />
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 16px' }}>

        {/* Category pills */}
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8, marginBottom: 24, scrollbarWidth: 'none' }}>
          {[{ id: 'all', name: 'الكل', icon: '🌿' }, ...categories].map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              style={{
                padding: '7px 18px', borderRadius: 24, border: 'none', cursor: 'pointer',
                fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap',
                background: activeCategory === c.id ? '#2d7a3a' : (dark ? '#161b22' : 'white'),
                color: activeCategory === c.id ? 'white' : '#4a6741',
                transition: 'all 0.2s',
              }}
            >
              {c.icon} {c.name}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1.5px solid rgba(0,0,0,0.1)', background: dark?'#161b22':'white', color: dark?'white':'#1a2e1a', fontSize: 13, fontFamily: 'Cairo, sans-serif', cursor: 'pointer' }}
          >
            <option value="newest">الأحدث</option>
            <option value="popular">الأكثر مشاهدة</option>
            <option value="price_asc">السعر: الأقل</option>
            <option value="price_desc">السعر: الأعلى</option>
          </select>
          <span style={{ fontSize: 13, color: '#4a6741', fontWeight: 600, marginRight: 'auto' }}>
            {filtered.length} نتيجة
          </span>
        </div>

        {/* Flash Sale */}
        {flashSale.length > 0 && (
          <section style={{ marginBottom: 44 }}>
            <div style={{ background: 'linear-gradient(135deg,#7f1d1d,#ef4444)', borderRadius: 18, padding: '18px 22px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ color: 'white' }}>
                <div style={{ fontSize: 20, fontWeight: 900 }}>⚡ عروض محدودة</div>
                <div style={{ opacity: 0.85, fontSize: 13 }}>أسرع قبل انتهاء العرض!</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 12, padding: '8px 18px', color: 'white', fontWeight: 700, fontSize: 18, backdropFilter: 'blur(10px)' }}>
                ⏱ <Countdown endTs={flashSaleEnd} />
              </div>
            </div>
            <ProductGrid products={flashSale} wishlist={wishlist} onWishlist={toggleWishlist} />
          </section>
        )}

        {/* New */}
        {newProducts.length > 0 && (
          <section style={{ marginBottom: 44 }}>
            <SectionTitle>✨ وصل حديثاً</SectionTitle>
            <ProductGrid products={newProducts.slice(0,4)} wishlist={wishlist} onWishlist={toggleWishlist} />
          </section>
        )}

        {/* Best Sellers */}
        {bestSellers.length > 0 && (
          <section style={{ marginBottom: 44 }}>
            <SectionTitle>🏆 الأكثر مبيعاً</SectionTitle>
            <ProductGrid products={bestSellers} wishlist={wishlist} onWishlist={toggleWishlist} />
          </section>
        )}

        {/* All */}
        <section style={{ marginBottom: 44 }}>
          <SectionTitle>🌿 جميع المنتجات ({filtered.length})</SectionTitle>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', color: '#4a6741' }}>
              <div style={{ fontSize: 56, marginBottom: 14 }}>🌱</div>
              <div style={{ fontSize: 17, fontWeight: 700 }}>لا توجد نتائج</div>
            </div>
          ) : (
            <ProductGrid products={filtered} wishlist={wishlist} onWishlist={toggleWishlist} />
          )}
        </section>

        {/* Trust */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: 14, marginBottom: 44 }}>
          {[
            { i: '📍', t: 'الحصاحيصا', s: 'ولاية الجزيرة' },
            { i: '📍', t: 'مروي', s: 'ولاية الشمالية' },
            { i: '📍', t: 'حلفا', s: 'ولاية الشمالية' },
            { i: '🌱', t: 'ضمان الجودة', s: 'نباتات طازجة' },
            { i: '💬', t: 'واتساب', s: 'تواصل مباشر' },
          ].map((b,i) => (
            <GlassCard key={i} style={{ padding: '18px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>{b.i}</div>
              <div style={{ fontWeight: 800, fontSize: 14, color: '#1a2e1a' }}>{b.t}</div>
              <div style={{ fontSize: 11, color: '#4a6741', marginTop: 3 }}>{b.s}</div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer style={{ background: '#1a2e1a', color: 'rgba(255,255,255,0.8)', textAlign: 'center', padding: '28px 20px', fontSize: 13 }}>
        <div style={{ fontSize: 26, marginBottom: 6 }}>🌿</div>
        <div style={{ fontWeight: 800, fontSize: 17, marginBottom: 8 }}>لحن الحياة - مشتل</div>
        <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 10, opacity: 0.75, fontSize: 12 }}>
          <span>📍 الحصاحيصا · ولاية الجزيرة</span>
          <span>📍 مروي · ولاية الشمالية</span>
          <span>📍 حلفا · ولاية الشمالية</span>
        </div>
        <div style={{ opacity: 0.5, fontSize: 11 }}>© 2026 جميع الحقوق محفوظة</div>
      </footer>
    </div>
  );
}

function ProductGrid({ products, wishlist, onWishlist }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 18 }}>
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} index={i} wishlist={wishlist} onWishlist={onWishlist} />
      ))}
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 style={{ fontSize: 22, fontWeight: 800, color: '#1a2e1a', marginBottom: 18, position: 'relative', display: 'inline-block' }}>
      {children}
      <div style={{ position: 'absolute', bottom: -3, right: 0, width: '55%', height: 3, background: 'linear-gradient(90deg,#2d7a3a,transparent)', borderRadius: 2 }} />
    </h2>
  );
}
