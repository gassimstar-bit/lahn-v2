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
 * src/hooks/useAuth.js
 * Supabase Auth الرسمي — تشفير بنكي حقيقي
 * يستبدل SHA-256 القديم بالكامل
 */
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { addAuditEntry } from '../lib/database';

const MAX_ATTEMPTS  = 5;
const LOCKOUT_KEY   = 'lahn_lockout';
const LOCKOUT_MINS  = 15;

function getLockout() {
  try {
    const v = localStorage.getItem(LOCKOUT_KEY);
    return v ? JSON.parse(v) : null;
  } catch { return null; }
}

function setLockout(data) {
  try { localStorage.setItem(LOCKOUT_KEY, JSON.stringify(data)); } catch {}
}

export function useAuth() {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // استمع لتغييرات الجلسة
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => setUser(session?.user ?? null)
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email, password) => {
    // تحقق من القفل
    const lockout = getLockout();
    if (lockout?.until && lockout.until > Date.now()) {
      const mins = Math.ceil((lockout.until - Date.now()) / 60000);
      throw new Error(`الحساب مقفل. حاول بعد ${mins} دقيقة.`);
    }

    // تأخير ثابت لمنع timing attacks
    await new Promise(r => setTimeout(r, 200));

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      // تسجيل المحاولة الفاشلة
      const prev    = getLockout() || { attempts: 0 };
      const attempts = (prev.attempts || 0) + 1;
      if (attempts >= MAX_ATTEMPTS) {
        setLockout({ attempts, until: Date.now() + LOCKOUT_MINS * 60000 });
        throw new Error(`تم قفل الحساب ${LOCKOUT_MINS} دقيقة بسبب محاولات متعددة.`);
      }
      setLockout({ attempts, until: null });
      throw new Error(`بيانات خاطئة. محاولة ${attempts} من ${MAX_ATTEMPTS}.`);
    }

    // نجح — إعادة تعيين العداد
    setLockout({ attempts: 0, until: null });
    await addAuditEntry(data.user.email, 'تسجيل دخول',
      `User-Agent: ${navigator.userAgent.slice(0, 80)}`);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    if (user) await addAuditEntry(user.email, 'تسجيل خروج');
    await supabase.auth.signOut();
  }, [user]);

  const isAdmin = Boolean(user);

  return { user, loading, isAdmin, login, logout };
}
