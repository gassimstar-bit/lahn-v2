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
 * src/hooks/useProducts.js
 * إدارة المنتجات مع caching بسيط
 * تحديث تلقائي كل 60 ثانية
 */
import { useState, useEffect, useCallback } from 'react';
import { getProducts, getCategories, getSettings } from '../lib/database';

export function useProducts(filters = {}) {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings,   setSettings]   = useState({});
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState(null);

  const fetchAll = useCallback(async () => {
    try {
      const [prods, cats, setts] = await Promise.all([
        getProducts(filters),
        getCategories(),
        getSettings(),
      ]);
      setProducts(prods);
      setCategories(cats);
      setSettings(setts);
      setError(null);
    } catch (e) {
      setError(e.message);
      console.error('useProducts fetch error:', e);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    fetchAll();
    // تحديث تلقائي كل 60 ثانية
    const iv = setInterval(fetchAll, 60000);
    return () => clearInterval(iv);
  }, [fetchAll]);

  return { products, categories, settings, loading, error, refetch: fetchAll };
}
