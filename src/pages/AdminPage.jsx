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
 * src/pages/AdminPage.jsx
 * لوحة التحكم الكاملة — محمية بـ Supabase Auth
 * URL: /admin (يُعيد توجيه غير المسجّلين للـ /login)
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthContext } from '../context/AuthContext';
import { GlassCard, Btn, Spinner, Field, inputCss } from '../components/UI';
import {
  getProducts, createProduct, updateProduct, archiveProduct, restoreProduct,
  getCategories, createCategory, deleteCategory,
  getSettings, saveSettings,
  getAuditLog, addAuditEntry,
  getPriceHistory,
  createBackup, getBackups, restoreBackup,
  uploadImage,
} from '../lib/database';
import { formatPrice, formatDate } from '../lib/utils';

// ── Protected Route ────────────────────────────────────────────────────────
function RequireAdmin({ children }) {
  const { isAdmin, loading } = useAuthContext();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) navigate('/login', { replace: true });
  }, [isAdmin, loading, navigate]);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Spinner size={40} />
    </div>
  );
  return isAdmin ? children : null;
}

// ── Main Admin Page ────────────────────────────────────────────────────────
export default function AdminPage() {
  return <RequireAdmin><AdminDashboard /></RequireAdmin>;
}

function AdminDashboard() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');

  // Data state
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [settings,   setSettings]   = useState({});
  const [auditLog,   setAuditLog]   = useState([]);
  const [loading,    setLoading]    = useState(true);

  // Modals
  const [editProduct, setEditProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Load data
  useEffect(() => {
    loadAll();
  }, []);

  useEffect(() => {
    if (tab === 'audit') loadAudit();
  }, [tab]);

  async function loadAll() {
    setLoading(true);
    try {
      const [prods, cats, setts] = await Promise.all([
        getProducts(),
        getCategories(),
        getSettings(),
      ]);
      setProducts(prods);
      setCategories(cats);
      setSettings(setts);
    } catch (e) {
      toast.error('خطأ في تحميل البيانات: ' + e.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadAudit() {
    try { setAuditLog(await getAuditLog()); } catch {}
  }

  async function handleLogout() {
    await logout();
    navigate('/', { replace: true });
    toast('👋 تم تسجيل الخروج');
  }

  async function handleSaveProduct(data, isNew) {
    try {
      if (isNew) {
        await createProduct(data);
        await addAuditEntry(user.email, 'إضافة منتج', data.name);
        toast.success('✅ تم إضافة المنتج');
      } else {
        await updateProduct(data.id, { ...data, old_price_before: data.currentPrice }, user.email);
        await addAuditEntry(user.email, 'تعديل منتج', data.name);
        toast.success('✅ تم الحفظ');
      }
      await loadAll();
      setEditProduct(null);
    } catch (e) {
      toast.error('خطأ: ' + e.message);
    }
  }

  async function handleArchive(id) {
    try {
      const p = products.find(x => x.id === id);
      await archiveProduct(id);
      await addAuditEntry(user.email, 'أرشفة منتج', p?.name || id);
      toast.success('🗃 تم الأرشفة');
      await loadAll();
    } catch (e) {
      toast.error(e.message);
    }
    setDeleteConfirm(null);
  }

  async function handleRestore(id) {
    try {
      const p = products.find(x => x.id === id);
      await restoreProduct(id);
      await addAuditEntry(user.email, 'استعادة منتج', p?.name || id);
      toast.success('✅ تمت الاستعادة');
      await loadAll();
    } catch (e) {
      toast.error(e.message);
    }
  }

  // Stats
  const published  = products.filter(p => p.status === 'published');
  const archived   = products.filter(p => p.status === 'archived');
  const outOfStock = published.filter(p => p.stock === 0);
  const lowStock   = published.filter(p => p.stock > 0 && p.stock <= (settings.low_stock_threshold || 5));
  const totalViews = products.reduce((a, p) => a + (p.views || 0), 0);
  const topViewed  = [...products].sort((a,b) => (b.views||0) - (a.views||0)).slice(0,5);

  const TABS = [
    { id: 'dashboard',   label: 'الإحصاء',       icon: '📊' },
    { id: 'products',    label: 'المنتجات',       icon: '🌿' },
    { id: 'archive',     label: 'المؤرشف',        icon: '🗃' },
    { id: 'categories',  label: 'التصنيفات',      icon: '📂' },
    { id: 'price_hist',  label: 'الأسعار',        icon: '📈' },
    { id: 'backup',      label: 'النسخ',          icon: '💾' },
    { id: 'audit',       label: 'السجل',          icon: '📋' },
    { id: 'settings',    label: 'الإعدادات',      icon: '⚙️' },
  ];

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Cairo, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <Spinner size={40} />
        <p style={{ marginTop: 16, color: '#4a6741' }}>جارٍ التحميل...</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#f0f7f0', fontFamily: 'Cairo, sans-serif', direction: 'rtl' }}>

      {/* Admin Navbar */}
      <nav style={{ background: 'linear-gradient(135deg,#0d2b0d,#1a3a1a)', padding: '0 20px', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 22 }}>🔐</span>
            <div>
              <div style={{ color: 'white', fontWeight: 900, fontSize: 15, lineHeight: 1 }}>لوحة التحكم</div>
              <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>{user?.email}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => navigate('/')} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)', borderRadius: 10, padding: '7px 14px', cursor: 'pointer', fontSize: 12, fontFamily: 'Cairo, sans-serif', fontWeight: 700 }}>
              🏪 المتجر
            </button>
            <button onClick={handleLogout} style={{ background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5', borderRadius: 10, padding: '7px 14px', cursor: 'pointer', fontSize: 12, fontFamily: 'Cairo, sans-serif' }}>
              🚪 خروج
            </button>
          </div>
        </div>
      </nav>

      {/* Tabs */}
      <div style={{ background: 'white', borderBottom: '1px solid rgba(0,0,0,0.08)', overflowX: 'auto' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', padding: '0 16px', minWidth: 'max-content' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '13px 14px', border: 'none', background: 'none', cursor: 'pointer', fontFamily: 'Cairo, sans-serif', fontWeight: 700, fontSize: 12, color: tab === t.id ? '#2d7a3a' : '#4a6741', borderBottom: `3px solid ${tab === t.id ? '#2d7a3a' : 'transparent'}`, whiteSpace: 'nowrap', transition: 'all 0.2s' }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts */}
      {(outOfStock.length > 0 || lowStock.length > 0) && (
        <div style={{ maxWidth: 1200, margin: '14px auto 0', padding: '0 16px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {outOfStock.length > 0 && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '10px 16px', fontSize: 13, color: '#ef4444', fontWeight: 700 }}>❌ {outOfStock.length} منتج نفذ مخزونه</div>}
          {lowStock.length > 0  && <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 12, padding: '10px 16px', fontSize: 13, color: '#f59e0b', fontWeight: 700 }}>⚠️ {lowStock.length} منتج مخزونه منخفض</div>}
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>

        {/* ── Dashboard ── */}
        {tab === 'dashboard' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(170px,1fr))', gap: 16, marginBottom: 28 }}>
              {[
                { label: 'المنشورة',    value: published.length,              icon: '🌿', color: '#22c55e' },
                { label: 'المشاهدات',   value: totalViews.toLocaleString('ar-SA'), icon: '👁', color: '#3b82f6' },
                { label: 'نفذ المخزون', value: outOfStock.length,             icon: '❌', color: '#ef4444' },
                { label: 'مخزون منخفض', value: lowStock.length,              icon: '⚠️', color: '#f59e0b' },
                { label: 'التصنيفات',   value: categories.length,             icon: '📂', color: '#8b5cf6' },
                { label: 'المؤرشف',     value: archived.length,               icon: '🗃', color: '#6b7280' },
              ].map((s,i) => (
                <GlassCard key={i} style={{ padding: 20, animation: `fadeInUp 0.4s ease ${i*0.06}s both` }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 26 }}>{s.icon}</span>
                    <span style={{ fontSize: 28, fontWeight: 900, color: s.color }}>{s.value}</span>
                  </div>
                  <div style={{ fontSize: 13, color: '#4a6741', marginTop: 10, fontWeight: 600 }}>{s.label}</div>
                </GlassCard>
              ))}
            </div>

            <GlassCard style={{ padding: 24 }}>
              <h3 style={{ fontWeight: 800, fontSize: 16, color: '#1a2e1a', marginBottom: 20 }}>🏆 الأكثر مشاهدة</h3>
              {topViewed.map((p,i) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 0', borderBottom: i<topViewed.length-1?'1px solid rgba(0,0,0,0.06)':'' }}>
                  <div style={{ width:26,height:26,borderRadius:'50%',background:i<3?['#f59e0b','#9ca3af','#a16207'][i]:'rgba(0,0,0,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:900,color:'white',fontSize:11,flexShrink:0 }}>{i+1}</div>
                  <div style={{ flex:1,fontSize:13,fontWeight:600,color:'#1a2e1a' }}>{p.name}</div>
                  <div style={{ fontSize:13,color:'#3b82f6',fontWeight:700 }}>👁 {p.views||0}</div>
                  <div style={{ fontWeight:900,color:'#2d7a3a' }}>{formatPrice(p.price)}</div>
                </div>
              ))}
            </GlassCard>
          </div>
        )}

        {/* ── Products ── */}
        {tab === 'products' && (
          <div>
            <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:22,flexWrap:'wrap',gap:12 }}>
              <h2 style={{ fontWeight:800,fontSize:22,color:'#1a2e1a' }}>🌿 المنتجات ({published.length})</h2>
              <Btn onClick={() => setEditProduct({ _new: true })}>+ إضافة منتج</Btn>
            </div>
            <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
              {products.filter(p=>p.status!=='archived').map(p => (
                <GlassCard key={p.id} style={{ padding:'16px 20px',display:'flex',alignItems:'center',gap:16,flexWrap:'wrap',opacity:p.status==='draft'?0.7:1 }}>
                  <div style={{ width:60,height:60,borderRadius:12,overflow:'hidden',flexShrink:0,background:'#e8f5e9',display:'flex',alignItems:'center',justifyContent:'center' }}>
                    {p.images?.[0]?<img src={p.images[0]} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span style={{fontSize:28}}>🌿</span>}
                  </div>
                  <div style={{ flex:1,minWidth:180 }}>
                    <div style={{ fontWeight:800,color:'#1a2e1a',fontSize:15 }}>{p.name}</div>
                    <div style={{ fontSize:12,color:'#4a6741',marginTop:2 }}>
                      📦{p.stock} · 👁{p.views||0} · {categories.find(c=>c.id===p.category_id)?.name||p.category_id}
                    </div>
                    <div style={{ display:'flex',gap:5,marginTop:5,flexWrap:'wrap' }}>
                      {p.is_new          && <span style={{background:'#3b82f6',color:'white',borderRadius:6,padding:'1px 7px',fontSize:10,fontWeight:700}}>جديد</span>}
                      {p.is_best_seller  && <span style={{background:'#ef4444',color:'white',borderRadius:6,padding:'1px 7px',fontSize:10,fontWeight:700}}>الأكثر</span>}
                      {p.is_limited_offer&& <span style={{background:'#f59e0b',color:'white',borderRadius:6,padding:'1px 7px',fontSize:10,fontWeight:700}}>عرض</span>}
                      {p.stock===0       && <span style={{background:'#6b7280',color:'white',borderRadius:6,padding:'1px 7px',fontSize:10,fontWeight:700}}>نفذ</span>}
                      {p.status==='draft'&& <span style={{background:'#7c3aed',color:'white',borderRadius:6,padding:'1px 7px',fontSize:10,fontWeight:700}}>مسودة</span>}
                    </div>
                  </div>
                  <div style={{ textAlign:'left' }}>
                    <div style={{ fontWeight:900,color:'#2d7a3a',fontSize:17 }}>{formatPrice(p.price)}</div>
                    {p.old_price&&<div style={{ textDecoration:'line-through',color:'#4a6741',fontSize:12 }}>{formatPrice(p.old_price)}</div>}
                  </div>
                  <div style={{ display:'flex',gap:8 }}>
                    <Btn onClick={() => setEditProduct({ ...p, currentPrice: p.price })} style={{fontSize:12,padding:'6px 12px'}}>✏️</Btn>
                    <Btn onClick={() => setDeleteConfirm(p.id)} variant="danger" style={{fontSize:12,padding:'6px 12px'}}>🗑</Btn>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        )}

        {/* ── Archive ── */}
        {tab === 'archive' && (
          <div>
            <h2 style={{ fontWeight:800,fontSize:22,color:'#1a2e1a',marginBottom:22 }}>🗃 المؤرشف ({archived.length})</h2>
            {archived.length===0?<GlassCard style={{padding:40,textAlign:'center',color:'#4a6741'}}>لا توجد منتجات مؤرشفة</GlassCard>:(
              <div style={{ display:'flex',flexDirection:'column',gap:10 }}>
                {archived.map(p=>(
                  <GlassCard key={p.id} style={{ padding:'16px 20px',display:'flex',alignItems:'center',gap:16,flexWrap:'wrap',opacity:0.65 }}>
                    <div style={{ width:50,height:50,borderRadius:10,background:'#e8f5e9',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24 }}>🌿</div>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700,color:'#1a2e1a',fontSize:14 }}>{p.name}</div>
                      <div style={{ fontSize:12,color:'#4a6741' }}>أُرشف {formatDate(p.updated_at)}</div>
                    </div>
                    <div style={{ fontWeight:900,color:'#2d7a3a' }}>{formatPrice(p.price)}</div>
                    <Btn onClick={() => handleRestore(p.id)} style={{fontSize:12,padding:'6px 14px'}}>🔄 استعادة</Btn>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Categories ── */}
        {tab === 'categories' && (
          <CategoriesPanel categories={categories} setCategories={setCategories} username={user?.email} />
        )}

        {/* ── Price History ── */}
        {tab === 'price_hist' && <PriceHistoryPanel />}

        {/* ── Backup ── */}
        {tab === 'backup' && <BackupPanel username={user?.email} />}

        {/* ── Audit Log ── */}
        {tab === 'audit' && (
          <div>
            <h2 style={{ fontWeight:800,fontSize:22,color:'#1a2e1a',marginBottom:22 }}>📋 سجل الأحداث</h2>
            <GlassCard style={{ overflow:'hidden' }}>
              {auditLog.length===0?<div style={{padding:40,textAlign:'center',color:'#4a6741'}}>لا توجد أحداث</div>:
                auditLog.map((e,i)=>(
                  <div key={e.id} style={{ padding:'12px 20px',borderBottom:i<auditLog.length-1?'1px solid rgba(0,0,0,0.06)':'',display:'flex',alignItems:'center',gap:12,flexWrap:'wrap' }}>
                    <span style={{fontSize:18}}>{e.action.includes('إضافة')?'➕':e.action.includes('تعديل')?'✏️':e.action.includes('أرشفة')?'🗑':e.action.includes('استعادة')?'🔄':e.action.includes('نسخة')?'💾':e.action.includes('دخول')?'🔓':'📝'}</span>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:700,color:'#1a2e1a',fontSize:13}}>{e.action}</div>
                      {e.details&&<div style={{fontSize:12,color:'#4a6741'}}>{e.details}</div>}
                    </div>
                    <div style={{fontSize:11,color:'#4a6741'}}>{formatDate(e.created_at)}</div>
                    <div style={{background:'rgba(45,122,58,0.1)',borderRadius:8,padding:'2px 10px',fontSize:11,color:'#2d7a3a',fontWeight:700}}>{e.username}</div>
                  </div>
                ))
              }
            </GlassCard>
          </div>
        )}

        {/* ── Settings ── */}
        {tab === 'settings' && (
          <SettingsPanel settings={settings} setSettings={setSettings} username={user?.email} />
        )}
      </div>

      {/* Delete Confirm Modal */}
      {deleteConfirm && (
        <Modal onClose={() => setDeleteConfirm(null)}>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:48,marginBottom:16}}>⚠️</div>
            <h3 style={{fontWeight:900,fontSize:20,color:'#1a2e1a',marginBottom:12}}>تأكيد الأرشفة</h3>
            <p style={{color:'#4a6741',lineHeight:1.7,marginBottom:24}}>سيتم أرشفة المنتج. يمكن استعادته لاحقاً من تبويب المؤرشف.</p>
            <div style={{display:'flex',gap:12}}>
              <Btn onClick={() => setDeleteConfirm(null)} variant="ghost" style={{flex:1}}>إلغاء</Btn>
              <Btn onClick={() => handleArchive(deleteConfirm)} variant="danger" style={{flex:1,background:'#ef4444',color:'white'}}>🗃 أرشفة</Btn>
            </div>
          </div>
        </Modal>
      )}

      {/* Product Editor Modal */}
      {editProduct && (
        <ProductEditor
          product={editProduct._new ? null : editProduct}
          categories={categories}
          onSave={handleSaveProduct}
          onClose={() => setEditProduct(null)}
        />
      )}
    </div>
  );
}

// ── Sub-components ───────────────────────────────────────────────────────────

function Modal({ children, onClose }) {
  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:500,padding:20 }} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <GlassCard style={{ padding:32,maxWidth:440,width:'100%' }}>{children}</GlassCard>
    </div>
  );
}

function ProductEditor({ product, categories, onSave, onClose }) {
  const isNew = !product;
  const fileRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    name:             product?.name || '',
    name_en:          product?.name_en || '',
    price:            product?.price || '',
    old_price:        product?.old_price || '',
    description:      product?.description || '',
    category_id:      product?.category_id || categories[0]?.id || '',
    stock:            product?.stock ?? 10,
    is_new:           product?.is_new || false,
    is_best_seller:   product?.is_best_seller || false,
    is_limited_offer: product?.is_limited_offer || false,
    status:           product?.status || 'published',
    tags:             product?.tags?.join('، ') || '',
    images:           product?.images || [],
    ...(product ? { id: product.id, currentPrice: product.price } : {}),
  });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  async function handleImages(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = [];
      for (const file of files) {
        const url = await uploadImage(file);
        urls.push(url);
      }
      set('images', [...form.images, ...urls]);
      toast.success(`✅ تم رفع ${urls.length} صورة`);
    } catch (err) {
      toast.error('خطأ في رفع الصورة: ' + err.message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function handleSubmit() {
    if (!form.name?.trim()) { toast.error('اسم المنتج مطلوب'); return; }
    if (!form.price || parseFloat(form.price) <= 0) { toast.error('السعر يجب أن يكون أكبر من صفر'); return; }
    if (form.old_price && parseFloat(form.old_price) <= parseFloat(form.price)) {
      toast.error('السعر القديم يجب أن يكون أكبر من السعر الحالي'); return;
    }
    onSave({
      ...form,
      price:     parseFloat(form.price),
      old_price: form.old_price ? parseFloat(form.old_price) : null,
      stock:     parseInt(form.stock) || 0,
      tags:      form.tags ? form.tags.split(/[،,]/).map(t=>t.trim()).filter(Boolean) : [],
    }, isNew);
  }

  const inp = inputCss(false);

  return (
    <div style={{ position:'fixed',inset:0,background:'rgba(0,0,0,0.75)',zIndex:500,display:'flex',alignItems:'flex-start',justifyContent:'center',padding:20,overflowY:'auto' }} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <GlassCard style={{ padding:32,width:'100%',maxWidth:660,marginTop:20,marginBottom:20 }}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:26}}>
          <h2 style={{fontWeight:900,fontSize:20,color:'#1a2e1a'}}>{isNew?'➕ إضافة منتج':'✏️ تعديل المنتج'}</h2>
          <button onClick={onClose} style={{background:'none',border:'none',fontSize:22,cursor:'pointer',color:'#4a6741'}}>✕</button>
        </div>

        <div style={{display:'flex',flexDirection:'column',gap:18}}>
          {/* Images */}
          <div>
            <label style={{display:'block',fontWeight:700,fontSize:13,marginBottom:10,color:'#1a2e1a'}}>📷 الصور</label>
            <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:8}}>
              {form.images.map((img,i)=>(
                <div key={i} style={{position:'relative'}}>
                  <img src={img} alt="" style={{width:72,height:72,objectFit:'cover',borderRadius:10,border:`2px solid ${i===0?'#2d7a3a':'rgba(0,0,0,0.1)'}`}}/>
                  <button onClick={()=>set('images',form.images.filter((_,idx)=>idx!==i))} style={{position:'absolute',top:-6,left:-6,width:22,height:22,borderRadius:'50%',background:'#ef4444',color:'white',border:'none',cursor:'pointer',fontSize:11,fontWeight:900}}>✕</button>
                </div>
              ))}
              <button onClick={()=>fileRef.current?.click()} disabled={uploading} style={{width:72,height:72,borderRadius:10,border:'2px dashed #2d7a3a',background:'rgba(45,122,58,0.08)',cursor:'pointer',color:'#2d7a3a',fontSize:12,fontWeight:700,fontFamily:'Cairo,sans-serif',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:2}}>
                {uploading?<Spinner size={20}/>:<>+ <br/>رفع</>}
              </button>
              <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleImages} style={{display:'none'}}/>
            </div>
            <p style={{fontSize:11,color:'#4a6741'}}>JPG, PNG, WebP — حد أقصى 10MB لكل صورة — تحويل تلقائي لـ WebP</p>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <Field label="اسم المنتج" required><input value={form.name} onChange={e=>set('name',e.target.value)} style={inp} placeholder="المونستيرا"/></Field>
            <Field label="الاسم بالإنجليزية"><input value={form.name_en} onChange={e=>set('name_en',e.target.value)} style={{...inp,direction:'ltr'}} placeholder="Monstera"/></Field>
          </div>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:14}}>
            <Field label="السعر (ر.س)" required><input type="number" value={form.price} onChange={e=>set('price',e.target.value)} style={{...inp,direction:'ltr'}} placeholder="120"/></Field>
            <Field label="السعر القديم"><input type="number" value={form.old_price} onChange={e=>set('old_price',e.target.value)} style={{...inp,direction:'ltr'}} placeholder="180"/></Field>
            <Field label="الكمية"><input type="number" value={form.stock} onChange={e=>set('stock',e.target.value)} style={{...inp,direction:'ltr'}} placeholder="10"/></Field>
          </div>

          <Field label="الوصف"><textarea value={form.description} onChange={e=>set('description',e.target.value)} rows={3} style={{...inp,resize:'vertical'}} placeholder="وصف المنتج..."/></Field>

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
            <Field label="التصنيف">
              <select value={form.category_id} onChange={e=>set('category_id',e.target.value)} style={inp}>
                {categories.map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
              </select>
            </Field>
            <Field label="الوسوم (مفصولة بفاصلة)"><input value={form.tags} onChange={e=>set('tags',e.target.value)} style={inp} placeholder="داخلي، هوائي"/></Field>
          </div>

          <Field label="الحالة">
            <select value={form.status} onChange={e=>set('status',e.target.value)} style={inp}>
              <option value="published">منشور ✅</option>
              <option value="draft">مسودة 📝</option>
            </select>
          </Field>

          {/* Badges */}
          <div>
            <label style={{display:'block',fontWeight:700,fontSize:13,marginBottom:10,color:'#1a2e1a'}}>🏷 الشارات</label>
            <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
              {[{k:'is_new',l:'✨ جديد',c:'#3b82f6'},{k:'is_best_seller',l:'🔥 الأكثر',c:'#ef4444'},{k:'is_limited_offer',l:'⚡ عرض',c:'#f59e0b'}].map(b=>(
                <button key={b.k} onClick={()=>set(b.k,!form[b.k])} style={{padding:'7px 16px',borderRadius:20,border:`2px solid ${form[b.k]?b.c:'rgba(0,0,0,0.1)'}`,background:form[b.k]?b.c+'20':'transparent',color:form[b.k]?b.c:'#4a6741',cursor:'pointer',fontFamily:'Cairo,sans-serif',fontWeight:700,fontSize:13,transition:'all 0.2s'}}>
                  {b.l}
                </button>
              ))}
            </div>
          </div>

          <div style={{display:'flex',gap:12,paddingTop:8}}>
            <Btn onClick={onClose} variant="ghost" style={{flex:1}}>إلغاء</Btn>
            <Btn onClick={handleSubmit} disabled={!form.name||!form.price} style={{flex:2,padding:14,fontSize:15}}>
              {isNew?'➕ إضافة المنتج':'💾 حفظ التغييرات'}
            </Btn>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

function CategoriesPanel({ categories, setCategories, username }) {
  const [form, setForm] = useState({ name: '', icon: '🌿' });

  async function add() {
    if (!form.name) return;
    try {
      const cat = await createCategory(form);
      setCategories(prev => [...prev, cat]);
      await addAuditEntry(username, 'إضافة تصنيف', form.name);
      toast.success('✅ تم الإضافة');
      setForm({ name: '', icon: '🌿' });
    } catch (e) { toast.error(e.message); }
  }

  async function remove(id) {
    try {
      await deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      await addAuditEntry(username, 'حذف تصنيف', id);
      toast.success('✅ تم الحذف');
    } catch (e) { toast.error(e.message); }
  }

  const inp = inputCss(false);
  return (
    <div>
      <h2 style={{fontWeight:800,fontSize:22,color:'#1a2e1a',marginBottom:22}}>📂 التصنيفات</h2>
      <GlassCard style={{padding:24,marginBottom:20}}>
        <div style={{display:'flex',gap:12,alignItems:'flex-end',flexWrap:'wrap'}}>
          <div><label style={{display:'block',fontSize:12,color:'#4a6741',marginBottom:4,fontWeight:600}}>الأيقونة</label><input value={form.icon} onChange={e=>setForm(p=>({...p,icon:e.target.value}))} style={{...inp,width:72,textAlign:'center',fontSize:22}}/></div>
          <div style={{flex:1,minWidth:180}}><label style={{display:'block',fontSize:12,color:'#4a6741',marginBottom:4,fontWeight:600}}>الاسم</label><input value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} placeholder="مثال: نباتات استوائية" style={inp}/></div>
          <Btn onClick={add} disabled={!form.name}>+ إضافة</Btn>
        </div>
      </GlassCard>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {categories.map(c=>(
          <GlassCard key={c.id} style={{padding:'14px 20px',display:'flex',alignItems:'center',gap:14}}>
            <span style={{fontSize:26}}>{c.icon}</span>
            <span style={{flex:1,fontWeight:700,color:'#1a2e1a',fontSize:15}}>{c.name}</span>
            <span style={{fontSize:11,color:'#4a6741',background:'rgba(45,122,58,0.1)',padding:'2px 10px',borderRadius:8}}>{c.id}</span>
            <Btn onClick={()=>remove(c.id)} variant="danger" style={{fontSize:12,padding:'5px 12px'}}>حذف</Btn>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

function PriceHistoryPanel() {
  const [history, setHistory] = useState([]);
  const [filter,  setFilter]  = useState('');

  useEffect(() => {
    getPriceHistory().then(setHistory).catch(console.error);
  }, []);

  const filtered = filter ? history.filter(h => h.product_name?.includes(filter)) : history;

  return (
    <div>
      <h2 style={{fontWeight:800,fontSize:22,color:'#1a2e1a',marginBottom:22}}>📈 تاريخ الأسعار</h2>
      <input value={filter} onChange={e=>setFilter(e.target.value)} placeholder="🔍 ابحث..." style={{...inputCss(false),maxWidth:300,marginBottom:16}}/>
      <GlassCard style={{overflow:'hidden'}}>
        {filtered.length===0?<div style={{padding:40,textAlign:'center',color:'#4a6741'}}>لا توجد تغييرات بعد</div>:
          filtered.map((e,i)=>(
            <div key={e.id} style={{display:'flex',alignItems:'center',gap:14,padding:'13px 20px',borderBottom:i<filtered.length-1?'1px solid rgba(0,0,0,0.06)':'',flexWrap:'wrap'}}>
              <div style={{width:38,height:38,borderRadius:10,background:e.diff_pct>0?'rgba(239,68,68,0.1)':'rgba(34,197,94,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18}}>
                {e.diff_pct>0?'📈':'📉'}
              </div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,color:'#1a2e1a',fontSize:13}}>{e.product_name}</div>
                <div style={{fontSize:12,color:'#4a6741'}}>{formatDate(e.created_at)} · {e.changed_by}</div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{textDecoration:'line-through',color:'#4a6741',fontSize:12}}>{formatPrice(e.old_price)}</span>
                <span style={{color:'#4a6741'}}>←</span>
                <span style={{fontWeight:900,color:'#2d7a3a',fontSize:15}}>{formatPrice(e.new_price)}</span>
              </div>
              <span style={{padding:'2px 10px',borderRadius:20,fontSize:11,fontWeight:800,background:e.diff_pct>0?'rgba(239,68,68,0.1)':'rgba(34,197,94,0.1)',color:e.diff_pct>0?'#ef4444':'#22c55e'}}>
                {e.diff_pct>0?'+':''}{e.diff_pct}%
              </span>
            </div>
          ))
        }
      </GlassCard>
    </div>
  );
}

function BackupPanel({ username }) {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => { getBackups().then(setBackups).catch(console.error); }, []);

  async function handleCreate() {
    setLoading(true);
    try {
      const b = await createBackup(username);
      setBackups(p => [b, ...p]);
      await addAuditEntry(username, 'إنشاء نسخة احتياطية', `${b.products_count} منتج`);
      toast.success('✅ تم إنشاء النسخة');
    } catch (e) { toast.error(e.message); }
    setLoading(false);
  }

  async function handleRestore(backup) {
    setLoading(true);
    try {
      const { productsCount } = await restoreBackup(backup.id);
      await addAuditEntry(username, 'استعادة نسخة', backup.label);
      toast.success(`✅ تمت الاستعادة — ${productsCount} منتج`);
    } catch (e) { toast.error(e.message); }
    setLoading(false);
    setConfirm(null);
  }

  return (
    <div>
      <h2 style={{fontWeight:800,fontSize:22,color:'#1a2e1a',marginBottom:22}}>💾 النسخ الاحتياطية</h2>
      <GlassCard style={{padding:22,marginBottom:20}}>
        <Btn onClick={handleCreate} disabled={loading}>{loading?<><Spinner size={16} color="white"/> جارٍ...</>:'➕ إنشاء نسخة الآن'}</Btn>
      </GlassCard>
      <div style={{display:'flex',flexDirection:'column',gap:10}}>
        {backups.map((b,i)=>(
          <GlassCard key={b.id} style={{padding:'15px 20px',display:'flex',alignItems:'center',gap:14,flexWrap:'wrap',borderRight:i===0?'3px solid #2d7a3a':undefined}}>
            <span style={{fontSize:26}}>{i===0?'⭐':'💾'}</span>
            <div style={{flex:1}}>
              <div style={{fontWeight:700,color:'#1a2e1a',fontSize:14}}>{b.label}</div>
              <div style={{fontSize:12,color:'#4a6741',marginTop:2}}>{formatDate(b.created_at)} · {b.products_count} منتج · {b.created_by||'النظام'}</div>
            </div>
            {i===0&&<span style={{background:'rgba(45,122,58,0.1)',color:'#2d7a3a',borderRadius:8,padding:'2px 10px',fontSize:11,fontWeight:700}}>الأحدث</span>}
            <Btn onClick={()=>setConfirm(b)} style={{fontSize:12,padding:'5px 12px',background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.3)',color:'#f59e0b'}}>🔄 استعادة</Btn>
          </GlassCard>
        ))}
      </div>
      {confirm&&(
        <Modal onClose={()=>setConfirm(null)}>
          <div style={{textAlign:'center'}}>
            <div style={{fontSize:48,marginBottom:16}}>⚠️</div>
            <h3 style={{fontWeight:900,color:'#1a2e1a',marginBottom:12}}>تأكيد الاستعادة</h3>
            <p style={{color:'#4a6741',marginBottom:24,lineHeight:1.7}}><strong>{confirm.label}</strong><br/>سيتم استبدال الإعدادات الحالية.</p>
            <div style={{display:'flex',gap:12}}>
              <Btn onClick={()=>setConfirm(null)} variant="ghost" style={{flex:1}}>إلغاء</Btn>
              <Btn onClick={()=>handleRestore(confirm)} disabled={loading} style={{flex:1,background:'#f59e0b',color:'white'}}>{loading?'⏳':'🔄 استعادة'}</Btn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function SettingsPanel({ settings, setSettings, username }) {
  const [form, setForm] = useState({
    store_name:           settings.store_name           || 'لحن الحياة - مشتل',
    whatsapp:             settings.whatsapp             || '249912345678',
    branch1:              settings.branch1              || 'الحصاحيصا - ولاية الجزيرة',
    branch2:              settings.branch2              || 'مروي - ولاية الشمالية',
    branch3:              settings.branch3              || 'حلفا - ولاية الشمالية',
    low_stock_threshold:  settings.low_stock_threshold  || 5,
    maintenance_mode:     settings.maintenance_mode     || false,
    watermark_enabled:    settings.watermark_enabled    || false,
  });

  async function save() {
    try {
      await saveSettings(form);
      setSettings(form);
      await addAuditEntry(username, 'تعديل الإعدادات');
      toast.success('✅ تم الحفظ');
    } catch (e) { toast.error(e.message); }
  }

  const inp = inputCss(false);

  return (
    <div>
      <h2 style={{fontWeight:800,fontSize:22,color:'#1a2e1a',marginBottom:22}}>⚙️ الإعدادات</h2>
      <div style={{display:'grid',gap:20}}>
        <GlassCard style={{padding:24}}>
          <h3 style={{fontWeight:700,color:'#1a2e1a',marginBottom:18,fontSize:15}}>🏪 معلومات المتجر</h3>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            <Field label="اسم المتجر"><input value={form.store_name} onChange={e=>setForm(p=>({...p,store_name:e.target.value}))} style={inp}/></Field>
            <Field label="رقم واتساب (بدون +)"><input value={form.whatsapp} onChange={e=>setForm(p=>({...p,whatsapp:e.target.value}))} style={{...inp,direction:'ltr'}} placeholder="249912345678"/></Field>
            <div style={{background:'rgba(45,122,58,0.06)',borderRadius:12,padding:14,border:'1px solid rgba(45,122,58,0.15)'}}>
              <div style={{fontWeight:700,color:'#1a2e1a',fontSize:13,marginBottom:12}}>📍 الفروع</div>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                <Field label="الفرع الأول (الحصاحيصا)"><input value={form.branch1} onChange={e=>setForm(p=>({...p,branch1:e.target.value}))} style={inp}/></Field>
                <Field label="الفرع الثاني (مروي)"><input value={form.branch2} onChange={e=>setForm(p=>({...p,branch2:e.target.value}))} style={inp}/></Field>
                <Field label="الفرع الثالث (حلفا)"><input value={form.branch3} onChange={e=>setForm(p=>({...p,branch3:e.target.value}))} style={inp}/></Field>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard style={{padding:24}}>
          <h3 style={{fontWeight:700,color:'#1a2e1a',marginBottom:18,fontSize:15}}>🔒 الأمان</h3>
          <Field label="حد المخزون المنخفض (تنبيه)">
            <input type="number" value={form.low_stock_threshold} onChange={e=>setForm(p=>({...p,low_stock_threshold:+e.target.value}))} style={{...inp,direction:'ltr',width:120}}/>
          </Field>
        </GlassCard>

        <GlassCard style={{padding:24}}>
          <h3 style={{fontWeight:700,color:'#1a2e1a',marginBottom:18,fontSize:15}}>🎛 خيارات عامة</h3>
          <div style={{display:'flex',flexDirection:'column',gap:14}}>
            {[{k:'maintenance_mode',l:'🚧 وضع الصيانة'},{k:'watermark_enabled',l:'💧 علامة مائية على الصور'}].map(opt=>(
              <label key={opt.k} style={{display:'flex',alignItems:'center',gap:12,cursor:'pointer'}}>
                <div onClick={()=>setForm(p=>({...p,[opt.k]:!p[opt.k]}))} style={{width:44,height:24,borderRadius:12,background:form[opt.k]?'#2d7a3a':'rgba(0,0,0,0.15)',position:'relative',transition:'background 0.2s',cursor:'pointer',flexShrink:0}}>
                  <div style={{position:'absolute',width:18,height:18,borderRadius:'50%',background:'white',top:3,right:form[opt.k]?3:23,transition:'right 0.2s'}}/>
                </div>
                <span style={{fontSize:14,color:'#1a2e1a',fontWeight:600}}>{opt.l}</span>
              </label>
            ))}
          </div>
        </GlassCard>

        <Btn onClick={save} style={{padding:14,fontSize:15}}>💾 حفظ جميع الإعدادات</Btn>
      </div>
    </div>
  );
}
