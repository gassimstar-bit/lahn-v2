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
 * src/App.jsx
 * React Router — صفحات حقيقية بـ URL مختلف لكل صفحة
 * / → المتجر | /product/:id → المنتج | /admin → الأدمن | /login → الدخول
 */
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext.jsx';
import { GLOBAL_CSS } from './lib/utils.js';

// Lazy loading - كل صفحة تحمل عند الحاجة فقط
const StorePage = lazy(() => import('./pages/StorePage.jsx'));
const ProductPage = lazy(() => import('./pages/ProductPage.jsx'));
const AdminPage = lazy(() => import('./pages/AdminPage.jsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));

// Loading fallback
function PageLoader() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0d1117',
      gap: 16,
      fontFamily: 'Cairo, sans-serif',
    }}>
      <div style={{ fontSize: 56, animation: 'float 2s ease-in-out infinite' }}>🌿</div>
      <div style={{ color: '#22c55e', fontSize: 20, fontWeight: 800 }}>لحن الحياة</div>
      <div style={{
        width: 36, height: 36,
        border: '3px solid #22c55e',
        borderTopColor: 'transparent',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes spin  { from{transform:rotate(0)} to{transform:rotate(360deg)} }
      `}</style>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      {/* Global CSS */}
      <style>{GLOBAL_CSS}</style>

      {/* Toast notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            fontFamily: 'Cairo, sans-serif',
            direction: 'rtl',
            fontWeight: 700,
            fontSize: 14,
          },
          success: { style: { background: '#22c55e', color: 'white' } },
          error:   { style: { background: '#ef4444', color: 'white' } },
        }}
      />

      {/* Auth provider — يغلف كل التطبيق */}
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* الصفحة الرئيسية */}
            <Route path="/"            element={<StorePage />} />

            {/* صفحة المنتج — URL حقيقي قابل للمشاركة */}
            <Route path="/product/:id" element={<ProductPage />} />

            {/* لوحة الأدمن — محمية */}
            <Route path="/admin"       element={<AdminPage />} />

            {/* تسجيل الدخول — مخفي */}
            <Route path="/login"       element={<LoginPage />} />

            {/* أي رابط غير معروف → الرئيسية */}
            <Route path="*"            element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
