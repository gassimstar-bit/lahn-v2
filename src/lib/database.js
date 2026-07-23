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
 * src/lib/database.js
 * كل عمليات قاعدة البيانات في مكان واحد
 * منفصلة تماماً عن الواجهة
 */
import { supabase } from './supabase';

// ── Sanitize — منع XSS ─────────────────────────────────────────────────────
function sanitize(str) {
  if (typeof str !== 'string') return str;
  return str
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;').trim().slice(0, 2000);
}

function sanitizeProduct(data) {
  return {
    ...data,
    name:        sanitize(data.name || ''),
    name_en:     sanitize(data.name_en || ''),
    description: sanitize(data.description || ''),
    tags:        Array.isArray(data.tags) ? data.tags.map(sanitize) : [],
    price:       Math.max(0, parseFloat(data.price) || 0),
    old_price:   data.old_price ? Math.max(0, parseFloat(data.old_price)) : null,
    stock:       Math.max(0, parseInt(data.stock) || 0),
  };
}

// ══════════════════════════════════════════════════════════════════
// PRODUCTS
// ══════════════════════════════════════════════════════════════════

/** جلب كل المنتجات المنشورة */
export async function getProducts(filters = {}) {
  let query = supabase
    .from('products')
    .select('*, categories(name, icon)')
    .order('created_at', { ascending: false });

  if (filters.status)      query = query.eq('status', filters.status);
  if (filters.category_id) query = query.eq('category_id', filters.category_id);
  if (filters.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

/** جلب منتج واحد بالـ ID */
export async function getProduct(id) {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name, icon)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

/** إضافة منتج جديد */
export async function createProduct(data) {
  const clean = sanitizeProduct(data);
  const { data: product, error } = await supabase
    .from('products')
    .insert([{
      name:             clean.name,
      name_en:          clean.name_en,
      description:      clean.description,
      price:            clean.price,
      old_price:        clean.old_price,
      category_id:      data.category_id,
      stock:            clean.stock,
      images:           data.images || [],
      is_new:           Boolean(data.is_new),
      is_best_seller:   Boolean(data.is_best_seller),
      is_limited_offer: Boolean(data.is_limited_offer),
      status:           data.status || 'published',
      tags:             clean.tags,
    }])
    .select()
    .single();
  if (error) throw error;
  return product;
}

/** تعديل منتج */
export async function updateProduct(id, data, changedBy = '') {
  const clean = sanitizeProduct(data);

  // تسجيل تغيير السعر إذا تغير
  if (data.old_price_before !== undefined && data.old_price_before !== clean.price) {
    await recordPriceChange(id, clean.name, data.old_price_before, clean.price, changedBy);
  }

  const { data: product, error } = await supabase
    .from('products')
    .update({
      name:             clean.name,
      name_en:          clean.name_en,
      description:      clean.description,
      price:            clean.price,
      old_price:        clean.old_price,
      category_id:      data.category_id,
      stock:            clean.stock,
      images:           data.images || [],
      is_new:           Boolean(data.is_new),
      is_best_seller:   Boolean(data.is_best_seller),
      is_limited_offer: Boolean(data.is_limited_offer),
      status:           data.status || 'published',
      tags:             clean.tags,
    })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return product;
}

/** أرشفة منتج (لا حذف نهائي) */
export async function archiveProduct(id) {
  const { error } = await supabase
    .from('products').update({ status: 'archived' }).eq('id', id);
  if (error) throw error;
}

/** استعادة منتج مؤرشف */
export async function restoreProduct(id) {
  const { error } = await supabase
    .from('products').update({ status: 'published' }).eq('id', id);
  if (error) throw error;
}

/** زيادة عداد المشاهدات */
export async function incrementViews(id) {
  const { error } = await supabase.rpc('increment_views', { product_id: id });
  // إذا الـ RPC غير موجود نستخدم update عادي
  if (error) {
    const { data } = await supabase.from('products').select('views').eq('id', id).single();
    await supabase.from('products').update({ views: (data?.views || 0) + 1 }).eq('id', id);
  }
}

/** زيادة عداد النقرات */
export async function incrementClicks(id) {
  const { data } = await supabase.from('products').select('clicks').eq('id', id).single();
  await supabase.from('products').update({ clicks: (data?.clicks || 0) + 1 }).eq('id', id);
}

// ══════════════════════════════════════════════════════════════════
// CATEGORIES
// ══════════════════════════════════════════════════════════════════

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories').select('*').order('sort_order');
  if (error) throw error;
  return data || [];
}

export async function createCategory(data) {
  const { data: cat, error } = await supabase
    .from('categories').insert([{
      id:   data.id || data.name.toLowerCase().replace(/\s+/g, '_'),
      name: sanitize(data.name),
      icon: data.icon || '🌿',
    }]).select().single();
  if (error) throw error;
  return cat;
}

export async function deleteCategory(id) {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}

// ══════════════════════════════════════════════════════════════════
// SETTINGS
// ══════════════════════════════════════════════════════════════════

export async function getSettings() {
  const { data, error } = await supabase.from('settings').select('*');
  if (error) throw error;
  const obj = {};
  (data || []).forEach(row => { obj[row.key] = row.value; });
  return obj;
}

export async function setSetting(key, value) {
  const { error } = await supabase.from('settings').upsert({ key, value });
  if (error) throw error;
}

export async function saveSettings(settingsObj) {
  const rows = Object.entries(settingsObj).map(([key, value]) => ({ key, value }));
  const { error } = await supabase.from('settings').upsert(rows);
  if (error) throw error;
}

// ══════════════════════════════════════════════════════════════════
// AUDIT LOG
// ══════════════════════════════════════════════════════════════════

export async function addAuditEntry(username, action, details = '') {
  const { error } = await supabase.from('audit_log').insert([{
    username: sanitize(username || 'unknown'),
    action:   sanitize(action),
    details:  sanitize(details),
  }]);
  if (error) console.warn('Audit log failed:', error.message);
}

export async function getAuditLog(limit = 200) {
  const { data, error } = await supabase
    .from('audit_log').select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

// ══════════════════════════════════════════════════════════════════
// PRICE HISTORY
// ══════════════════════════════════════════════════════════════════

export async function recordPriceChange(productId, productName, oldPrice, newPrice, changedBy) {
  const diff = oldPrice ? Math.round(((newPrice - oldPrice) / oldPrice) * 100) : 0;
  const { error } = await supabase.from('price_history').insert([{
    product_id:   productId,
    product_name: sanitize(productName),
    old_price:    oldPrice,
    new_price:    newPrice,
    changed_by:   sanitize(changedBy || ''),
    diff_pct:     diff,
  }]);
  if (error) console.warn('Price history failed:', error.message);
}

export async function getPriceHistory(productId = null) {
  let query = supabase.from('price_history').select('*')
    .order('created_at', { ascending: false }).limit(500);
  if (productId) query = query.eq('product_id', productId);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

// ══════════════════════════════════════════════════════════════════
// BACKUPS
// ══════════════════════════════════════════════════════════════════

export async function createBackup(username) {
  const [products, categories, settings] = await Promise.all([
    getProducts(),
    getCategories(),
    getSettings(),
  ]);

  const label = `نسخة ${new Date().toLocaleDateString('ar-SA')} - ${new Date().toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}`;

  const { data, error } = await supabase.from('backups').insert([{
    label,
    products_count: products.length,
    data: { products, categories, settings },
    created_by: username,
  }]).select().single();
  if (error) throw error;
  return data;
}

export async function getBackups() {
  const { data, error } = await supabase
    .from('backups').select('id, label, products_count, created_by, created_at')
    .order('created_at', { ascending: false }).limit(30);
  if (error) throw error;
  return data || [];
}

export async function restoreBackup(backupId) {
  const { data: backup, error } = await supabase
    .from('backups').select('data').eq('id', backupId).single();
  if (error) throw error;

  const { products, categories, settings } = backup.data;

  // استعادة الإعدادات
  if (settings) await saveSettings(settings);

  // استعادة التصنيفات
  if (categories?.length) {
    await supabase.from('categories').upsert(categories);
  }

  return { productsCount: products?.length || 0 };
}

// ══════════════════════════════════════════════════════════════════
// IMAGE UPLOAD — Supabase Storage
// ══════════════════════════════════════════════════════════════════

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const MAX_SIZE      = 10 * 1024 * 1024; // 10MB

export function validateImageFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error(`نوع الملف غير مسموح: ${file.name}`);
  }
  if (file.size > MAX_SIZE) {
    throw new Error(`الملف كبير جداً: ${file.name} (الحد 10MB)`);
  }
}

async function compressToWebP(file, maxW = 1200, quality = 0.82) {
  const base64 = await new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload  = () => res(reader.result);
    reader.onerror = () => rej(new Error('فشل قراءة الملف'));
    reader.readAsDataURL(file);
  });

  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let w = img.width, h = img.height;
      if (w > maxW) { h = Math.round((h * maxW) / w); w = maxW; }
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      const webp = canvas.toDataURL('image/webp', quality);
      resolve(webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => reject(new Error('فشل تحميل الصورة'));
    img.src = base64;
  });
}

export async function uploadImage(file) {
  validateImageFile(file);
  const webpData = await compressToWebP(file);

  // رفع لـ Supabase Storage
  try {
    const base64 = webpData.split(',')[1];
    const byteArr = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
    const blob = new Blob([byteArr], { type: 'image/webp' });
    const fileName = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.webp`;

    const { data, error } = await supabase.storage
      .from('lahn-images')
      .upload(fileName, blob, { contentType: 'image/webp', upsert: false });

    if (!error && data) {
      const { data: urlData } = supabase.storage
        .from('lahn-images')
        .getPublicUrl(fileName);
      return urlData.publicUrl;
    }
  } catch (e) {
    console.warn('Storage upload failed, using base64:', e.message);
  }

  // Fallback: base64
  return webpData;
}
