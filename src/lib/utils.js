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
 * src/lib/utils.js
 * دوال مساعدة مشتركة
 */

export const DEFAULT_WA = '249907200924'; // ← غيّره لرقمك الحقيقي

export const PLANT_EMOJIS = ['🌿','🌸','🌵','🌳','🌱','🌺','🍀','🌻'];

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function formatPrice(n) {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency', currency: 'SAR', minimumFractionDigits: 0,
  }).format(n || 0);
}

export function formatDate(ts) {
  const d = typeof ts === 'string' ? new Date(ts) : new Date(ts);
  return d.toLocaleString('ar-SA', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

export function getDiscount(price, oldPrice) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}

export function openWhatsApp(product, waNumber, settings = {}) {
  const phone = settings.whatsapp || waNumber || DEFAULT_WA;
  const msg = encodeURIComponent(
    `مرحباً، أريد الاستفسار عن:\n*${product.name}*\nالسعر: ${formatPrice(product.price)}\n${(product.description || '').slice(0, 80)}`
  );
  const a = document.createElement('a');
  a.href = `https://wa.me/${phone}?text=${msg}`;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  a.click();
}

/** Build SEO alt text for product images */
export function buildAltText(product, imageIndex = 0, catName = '') {
  if (!product) return 'نباتات زينة - مشتل لحن الحياة';
  const suffix = 'مشتل لحن الحياة - الحصاحيصا، مروي، حلفا';
  if (imageIndex === 0) {
    return `${product.name}${product.name_en ? ' ' + product.name_en : ''} - ${catName} - ${suffix}`;
  }
  return `صورة ${imageIndex + 1} لـ ${product.name} - ${suffix}`;
}

/** Dark mode theme tokens */
export function getTheme(dark) {
  return {
    bg:         dark ? '#0d1117' : '#f0f7f0',
    surface:    dark ? '#161b22' : '#ffffff',
    text:       dark ? '#e6edf3' : '#1a2e1a',
    sub:        dark ? '#8b949e' : '#4a6741',
    accent:     '#2d7a3a',
    accentGlow: 'rgba(45,122,58,0.3)',
    border:     dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
    glass:      dark ? 'rgba(22,27,34,0.85)' : 'rgba(255,255,255,0.85)',
    shadow:     dark ? '0 8px 32px rgba(0,0,0,0.5)' : '0 8px 32px rgba(45,122,58,0.15)',
    gold:       '#f59e0b',
    red:        '#ef4444',
    green:      '#22c55e',
  };
}

/** CSS animations shared across all pages */
export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Cairo', sans-serif; direction: rtl; }
  @keyframes fadeInUp  { from { opacity:0; transform:translateY(24px) } to { opacity:1; transform:translateY(0) } }
  @keyframes float     { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-10px) } }
  @keyframes spin      { from { transform:rotate(0) } to { transform:rotate(360deg) } }
  @keyframes badgePop  { 0% { transform:scale(0) } 60% { transform:scale(1.2) } 100% { transform:scale(1) } }
  @keyframes shimmer   { 0% { background-position:200% 0 } 100% { background-position:-200% 0 } }
  @keyframes pulse     { 0%,100% { transform:scale(1) } 50% { transform:scale(1.05) } }
  ::-webkit-scrollbar       { width: 5px; }
  ::-webkit-scrollbar-thumb { background: #2d7a3a44; border-radius: 3px; }
  input, textarea, select   { font-family: 'Cairo', sans-serif; direction: rtl; }
`;
