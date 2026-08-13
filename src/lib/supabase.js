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
 * src/lib/supabase.js
 * Supabase client — نقطة الاتصال الوحيدة بقاعدة البيانات
 * كل العمليات تمر من هنا
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON;

if (!SUPABASE_URL || !SUPABASE_ANON) {
  console.error(
    '⚠️  Supabase غير مضبوط.\n' +
    'أنشئ ملف .env وأضف:\n' +
    'VITE_SUPABASE_URL=...\n' +
    'VITE_SUPABASE_ANON=...'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    autoRefreshToken:    true,
    persistSession:      true,
    detectSessionInUrl:  true,
  },
});

/** تحقق سريع من الاتصال */
export async function testConnection() {
  try {
    const { error } = await supabase.from('categories').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}
