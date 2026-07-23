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
 * src/main.jsx
 * نقطة البداية — يُشغَّل أول شيء
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Global error handler — يمنع الصفحة البيضاء الصامتة
window.onerror = (msg, src, line, col, error) => {
  console.error('Global error:', { msg, src, line, col, error: error?.message });
  return false;
};

window.onunhandledrejection = (e) => {
  console.error('Unhandled Promise rejection:', e.reason);
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
