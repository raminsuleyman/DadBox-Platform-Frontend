import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, BadgeCheck, BarChart3, Boxes, Building2, CalendarDays,
  Check, ChevronRight, Clock3, Leaf, MapPin, PackageCheck, Pencil, Plus,
  ShoppingBag, Store as StoreIcon, X,
} from 'lucide-react';
import { categories } from '../types';
import type { ActionResult, Box, Business, Category, Reservation } from '../types';
import { useApp } from '../store';
import '../styles/business.css';

type Tab = 'overview' | 'offers' | 'orders' | 'settings';
type BusinessInput = Omit<Business, 'id' | 'ownerId' | 'status' | 'rating' | 'reviewCount' | 'createdAt'>;
type BoxInput = Omit<Box, 'id' | 'businessId' | 'createdAt' | 'distance'> & { id?: string };

const tabItems: { id: Tab; label: string; icon: typeof BarChart3 }[] = [
  { id: 'overview', label: 'Ümumi baxış', icon: BarChart3 },
  { id: 'offers', label: 'Təkliflərim', icon: Boxes },
  { id: 'orders', label: 'Sifarişlər', icon: ShoppingBag },
  { id: 'settings', label: 'Biznes məlumatları', icon: Building2 },
];

const orderLabels: Record<Reservation['status'], string> = {
  PENDING: 'Gözləyir', CONFIRMED: 'Təsdiqlənib', PICKED_UP: 'Təhvil verilib',
  CANCELLED: 'Ləğv edilib', EXPIRED: 'Vaxtı bitib',
};

const money = (value: number) => `${value.toFixed(2).replace('.', ',')} ₼`;
const dateTime = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('az-AZ', { timeZone: 'Asia/Baku', day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};
// Azerbaijan's demo times use the fixed Baku UTC+04:00 offset.
const bakuInputDate = (date: Date) => {
  if (Number.isNaN(date.getTime())) return '';
  const baku = new Date(date.getTime() + 4 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${baku.getUTCFullYear()}-${pad(baku.getUTCMonth() + 1)}-${pad(baku.getUTCDate())}T${pad(baku.getUTCHours())}:${pad(baku.getUTCMinutes())}`;
};
const fromBakuInput = (value: string) => new Date(`${value}+04:00`);

function Status({ status }: { status: Reservation['status'] | Business['status'] | Box['status'] }) {
  const labels: Record<string, string> = {
    ...orderLabels, APPROVED: 'Təsdiqlənib', REJECTED: 'Rədd edilib', ACTIVE: 'Aktiv', INACTIVE: 'Deaktiv',
  };
  return <span className={`biz-status biz-status--${status.toLowerCase()}`}><span />{labels[status]}</span>;
}

function EmptyState({ icon: Icon, title, children }: { icon: typeof Boxes; title: string; children: React.ReactNode }) {
  return <div className="biz-empty"><div className="biz-empty__icon"><Icon size={22} /></div><h3>{title}</h3><p>{children}</p></div>;
}

function ImagePicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const [error, setError] = useState('');
  return <div className="biz-image-picker">
    <label>Şəkil yolu və ya URL<input required value={value} onChange={e => onChange(e.target.value)} placeholder="/images/bakery.jpg" /></label>
    <label>Və ya şəkil faylı seçin<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => {
      const file = e.target.files?.[0];
      e.target.value = '';
      if (!file) return;
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 512 * 1024) {
        setError('Yalnız 512 KB-dan kiçik JPEG, PNG və ya WebP şəkli seçin.'); return;
      }
      setError('');
      const reader = new FileReader();
      reader.onload = () => { if (typeof reader.result === 'string') onChange(reader.result); else setError('Şəkli oxumaq mümkün olmadı.'); };
      reader.onerror = () => setError('Şəkli oxumaq mümkün olmadı.');
      reader.readAsDataURL(file);
    }} /></label>
    <p className="biz-form__hint">Fayl yalnız bu brauzerin localStorage yaddaşında demo üçün saxlanılır; yaddaş limiti tətbiq olunur.</p>
    {error && <p className="biz-form__error" role="alert">{error}</p>}
  </div>;
}

function BusinessDetailsForm({ business, phone, onSubmit, submitLabel }: {
  business?: Business;
  phone: string;
  onSubmit: (input: BusinessInput) => ActionResult;
  submitLabel: string;
}) {
  const [values, setValues] = useState({
    name: business?.name ?? '', category: business?.category ?? '', description: business?.description ?? '',
    address: business?.address ?? '', phone: business?.phone ?? phone,
    lat: String(business?.lat ?? 40.4093), lng: String(business?.lng ?? 49.8671),
    image: business?.image ?? '/images/bakery.jpg', verificationInfo: business?.verificationInfo ?? '',
  });
  const [error, setError] = useState('');
  const field = (key: keyof typeof values, value: string) => setValues(current => ({ ...current, [key]: value }));
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const lat = Number(values.lat), lng = Number(values.lng);
    if (!values.name.trim() || !values.category.trim() || !values.description.trim() || !values.address.trim() || !values.phone.trim() || !values.image.trim()) {
      setError('Zəhmət olmasa, bütün biznes məlumatlarını doldurun.'); return;
    }
    if (!values.lat.trim() || !values.lng.trim() || !Number.isFinite(lat) || !Number.isFinite(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setError('Düzgün enlik və uzunluq daxil edin.'); return;
    }
    setError('');
    const result = onSubmit({ name: values.name.trim(), category: values.category.trim(), description: values.description.trim(), address: values.address.trim(), phone: values.phone.trim(), lat, lng, image: values.image.trim(), verificationInfo: values.verificationInfo.trim() });
    if (!result.ok) setError(result.message);
  };
  return <form className="biz-form" onSubmit={handleSubmit}>
    <div className="biz-form__grid">
      <label>Biznesin adı<input required value={values.name} onChange={e => field('name', e.target.value)} placeholder="Məsələn, Şəhər çörəkxanası" /></label>
      <label>Biznes kateqoriyası<input required value={values.category} onChange={e => field('category', e.target.value)} placeholder="Məsələn, Çörəkxana" /></label>
      <label className="biz-form__full">Təsvir<textarea required value={values.description} onChange={e => field('description', e.target.value)} placeholder="Biznesiniz haqqında qısa məlumat" rows={3} /></label>
      <label className="biz-form__full">Ünvan<input required value={values.address} onChange={e => field('address', e.target.value)} placeholder="Küçə, bina, şəhər" /></label>
      <label>Əlaqə nömrəsi<input required type="tel" value={values.phone} onChange={e => field('phone', e.target.value)} placeholder="+994" /></label>
      <ImagePicker value={values.image} onChange={value => field('image', value)} />
      <label>Enlik<input required type="number" step="any" min="-90" max="90" value={values.lat} onChange={e => field('lat', e.target.value)} /></label>
      <label>Uzunluq<input required type="number" step="any" min="-180" max="180" value={values.lng} onChange={e => field('lng', e.target.value)} /></label>
      <label className="biz-form__full">Biznesin təsdiqi üçün məlumat <span className="biz-label-note">(istəyə bağlı)</span><textarea value={values.verificationInfo} onChange={e => field('verificationInfo', e.target.value)} rows={3} placeholder="Təsdiq üçün əlavə məlumat" /></label>
    </div>
    <p className="biz-form__hint">Koordinatlar xəritədə yerinizi göstərmək üçündür. Başlanğıc dəyərlər Bakı mərkəzini göstərir.</p>
    {error && <p className="biz-form__error" role="alert">{error}</p>}
    <button className="biz-button" type="submit">{submitLabel}<ArrowRight size={16} /></button>
  </form>;
}

function BoxEditor({ box, onSave, onCancel }: { box?: Box; onSave: (input: BoxInput) => ActionResult; onCancel: () => void }) {
  const start = new Date(Math.floor(Date.now() / (60 * 60 * 1000)) * (60 * 60 * 1000) + 60 * 60 * 1000);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
  const [values, setValues] = useState({
    title: box?.title ?? '', description: box?.description ?? '', category: box?.category ?? categories[0],
    originalPrice: box ? String(box.originalPrice) : '', price: box ? String(box.price) : '',
    quantity: box ? String(box.quantity) : '', pickupStart: box ? bakuInputDate(new Date(box.pickupStart)) : bakuInputDate(start),
    pickupEnd: box ? bakuInputDate(new Date(box.pickupEnd)) : bakuInputDate(end), image: box?.image ?? '/images/bakery.jpg',
    allergens: box?.allergens.join(', ') ?? '',
  });
  const [error, setError] = useState('');
  const field = (key: keyof typeof values, value: string) => setValues(current => ({ ...current, [key]: value }));
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const originalPrice = Number(values.originalPrice), price = Number(values.price), quantity = Number(values.quantity);
    const startDate = fromBakuInput(values.pickupStart), endDate = fromBakuInput(values.pickupEnd);
    if (!values.title.trim() || !values.description.trim() || !values.image.trim()) { setError('Ad, təsvir və şəkil yolunu doldurun.'); return; }
    if (!Number.isFinite(originalPrice) || !Number.isFinite(price) || price <= 0 || originalPrice <= price) { setError('Endirimli qiymət sıfırdan böyük və ilkin qiymətdən aşağı olmalıdır.'); return; }
    if (!values.quantity.trim() || !Number.isInteger(quantity) || quantity < 0) { setError('Miqdar sıfır və ya daha böyük tam ədəd olmalıdır.'); return; }
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime()) || endDate.getTime() <= startDate.getTime()) { setError('Təhvilin bitmə vaxtı başlama vaxtından sonra olmalıdır.'); return; }
    setError('');
    const result = onSave({ ...(box ? { id: box.id } : {}), title: values.title.trim(), description: values.description.trim(), category: values.category as Category,
      originalPrice, price, quantity, pickupStart: startDate.toISOString(), pickupEnd: endDate.toISOString(), image: values.image.trim(),
      allergens: values.allergens.split(',').map(item => item.trim()).filter(Boolean), status: box?.status ?? 'ACTIVE' });
    if (!result.ok) setError(result.message);
  };
  return <section className="biz-panel biz-editor" aria-labelledby="biz-editor-title">
    <div className="biz-panel__header"><div><span className="biz-eyebrow">TƏKLİF MƏLUMATLARI</span><h2 id="biz-editor-title">{box ? 'Təklifi redaktə et' : 'Yeni sürpriz qutu'}</h2><p>Qutunuz haqqında məlumatları əlavə edin.</p></div><button type="button" className="biz-icon-button" onClick={onCancel} aria-label="Formanı bağla"><X size={19} /></button></div>
    <form className="biz-form" onSubmit={handleSubmit}>
      <div className="biz-form__grid">
        <label>Qutunun adı<input required value={values.title} onChange={e => field('title', e.target.value)} placeholder="Məsələn, Günün çörək qutusu" /></label>
        <label>Kateqoriya<select value={values.category} onChange={e => field('category', e.target.value)}>{categories.map(category => <option key={category} value={category}>{category}</option>)}</select></label>
        <label className="biz-form__full">Təsvir<textarea required rows={3} value={values.description} onChange={e => field('description', e.target.value)} placeholder="Qutuda nələrin ola biləcəyini təsvir edin" /></label>
        <label>İlkin qiymət (₼)<input required type="number" min="0.01" step="0.01" value={values.originalPrice} onChange={e => field('originalPrice', e.target.value)} placeholder="0.00" /></label>
        <label>Endirimli qiymət (₼)<input required type="number" min="0.01" step="0.01" value={values.price} onChange={e => field('price', e.target.value)} placeholder="0.00" /></label>
        <label>Mövcud miqdar<input required type="number" min="0" step="1" value={values.quantity} onChange={e => field('quantity', e.target.value)} placeholder="0" /></label>
        <ImagePicker value={values.image} onChange={value => field('image', value)} />
        <label>Təhvil başlanğıcı (Bakı vaxtı)<input required type="datetime-local" value={values.pickupStart} onChange={e => field('pickupStart', e.target.value)} /></label>
        <label>Təhvil sonu (Bakı vaxtı)<input required type="datetime-local" value={values.pickupEnd} onChange={e => field('pickupEnd', e.target.value)} /></label>
        <label className="biz-form__full">Allergenlər <span className="biz-label-note">(vergüllə ayırın)</span><input value={values.allergens} onChange={e => field('allergens', e.target.value)} placeholder="Məsələn, süd, qlüten, qoz" /></label>
      </div>
      {error && <p className="biz-form__error" role="alert">{error}</p>}
      <div className="biz-form__actions"><button className="biz-button" type="submit"><Check size={16} /> {box ? 'Dəyişiklikləri saxla' : 'Təklifi yarat'}</button><button className="biz-button biz-button--light" type="button" onClick={onCancel}>İmtina et</button></div>
    </form>
  </section>;
}

function OfferCard({ box, onEdit, onDeactivate }: { box: Box; onEdit: () => void; onDeactivate: () => void }) {
  return <article className="biz-offer">
    <img className="biz-offer__image" src={box.image || '/images/bakery.jpg'} alt="" />
    <div className="biz-offer__body"><div className="biz-offer__top"><div><span className="biz-offer__category">{box.category}</span><h3>{box.title}</h3></div><Status status={box.status} /></div>
      <p className="biz-offer__description">{box.description}</p>
      <div className="biz-offer__meta"><span><Clock3 size={14} /> {dateTime(box.pickupStart)} – {dateTime(box.pickupEnd)}</span><span><Boxes size={14} /> {box.quantity} ədəd qalıb</span></div>
      <div className="biz-offer__bottom"><div className="biz-offer__prices"><strong>{money(box.price)}</strong><del>{money(box.originalPrice)}</del></div><div className="biz-offer__actions"><button className="biz-text-button" type="button" onClick={onEdit}><Pencil size={14} /> Redaktə et</button>{box.status === 'ACTIVE' && <button className="biz-text-button biz-text-button--muted" type="button" onClick={onDeactivate}>Deaktiv et</button>}</div></div>
    </div>
  </article>;
}

function OrderCard({ reservation, box, customerName, onAction }: { reservation: Reservation; box?: Box; customerName: string; onAction: (action: 'confirm' | 'pickup', code?: string) => ActionResult }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const pickup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!code.trim()) { setError('Rezervasiya kodunu daxil edin.'); return; }
    setError('');
    const result = onAction('pickup', code.trim());
    if (result.ok) setCode('');
    else setError(result.message);
  };
  return <article className="biz-order"><div className="biz-order__main"><div className="biz-order__icon"><ShoppingBag size={19} /></div><div><h3>{box?.title ?? 'Təklif'}</h3><p>{customerName} <span>·</span> {reservation.quantity} ədəd <span>·</span> {dateTime(reservation.createdAt)}</p><span className="biz-order__id">Sifariş #{reservation.id.slice(-6).toUpperCase()}</span></div></div><div className="biz-order__side"><strong>{money(reservation.totalPrice)}</strong><Status status={reservation.status} /></div>
    {reservation.status === 'PENDING' && <div className="biz-order__action"><button className="biz-button biz-button--small" type="button" onClick={() => onAction('confirm')}><Check size={15} /> Sifarişi təsdiqlə</button></div>}
    {reservation.status === 'CONFIRMED' && <form className="biz-order__action biz-pickup" onSubmit={pickup}><label htmlFor={`biz-code-${reservation.id}`}>Müştərinin rezervasiya kodu</label><div><input id={`biz-code-${reservation.id}`} value={code} onChange={e => setCode(e.target.value)} placeholder="Kodu daxil edin" autoComplete="off" /><button className="biz-button biz-button--small" type="submit"><PackageCheck size={15} /> Təhvil ver</button></div>{error && <p className="biz-form__error" role="alert">{error}</p>}</form>}
  </article>;
}

export default function BusinessPage() {
  const { data, user, createBusiness, updateBusiness, applyBusiness, saveBox, deactivateBox, updateReservation } = useApp();
  const [tab, setTab] = useState<Tab>('overview');
  const [selectedBusinessId, setSelectedBusinessId] = useState('');
  const [editing, setEditing] = useState<Box | 'new' | null>(null);
  const [notice, setNotice] = useState<ActionResult | null>(null);
  const ownedBusinesses = user ? data.businesses.filter(item => item.ownerId === user.id) : [];
  const business = ownedBusinesses.find(item => item.id === selectedBusinessId) ?? ownedBusinesses[0];
  const boxes = business ? data.boxes.filter(item => item.businessId === business.id) : [];
  const reservations = business ? data.reservations.filter(item => item.businessId === business.id).slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)) : [];
  const activeBoxes = boxes.filter(item => item.status === 'ACTIVE');
  const pendingOrders = reservations.filter(item => item.status === 'PENDING');
  const pickedUp = reservations.filter(item => item.status === 'PICKED_UP');
  const completedQuantity = pickedUp.reduce((sum, item) => sum + item.quantity, 0);
  const completedRevenue = pickedUp.reduce((sum, item) => sum + item.totalPrice, 0);

  useEffect(() => { setEditing(null); }, [business?.id]);
  const feedback = (result: ActionResult) => { setNotice(result); return result; };
  const changeTab = (next: Tab) => { setTab(next); setEditing(null); setNotice(null); };
  const handleSaveBox = (input: BoxInput) => {
    if (!business || business.status !== 'APPROVED') return feedback({ ok: false, message: 'Təklif yaratmaq üçün biznes təsdiqlənməlidir.' });
    const result = feedback(saveBox(input, business.id));
    if (result.ok) setEditing(null);
    return result;
  };
  const renderOrder = (reservation: Reservation) => <OrderCard key={reservation.id} reservation={reservation} box={boxes.find(item => item.id === reservation.boxId)} customerName={data.users.find(item => item.id === reservation.customerId)?.name ?? 'Müştəri'} onAction={(action, code) => feedback(updateReservation(reservation.id, action, code))} />;

  if (!user || user.role !== 'business') return <main className="biz-page"><div className="biz-gate"><div className="biz-empty__icon"><StoreIcon size={24} /></div><span className="biz-eyebrow">Dadbox biznes</span><h1>Biznes paneli</h1><p>Bu səhifə biznes hesabları üçün nəzərdə tutulub. Davam etmək üçün biznes hesabına daxil olun.</p><Link to="/auth" className="biz-button"><ArrowLeft size={16} /> Daxil ol</Link></div></main>;

  return <main className="biz-page"><div className="biz-shell">
    <aside className="biz-sidebar"><div className="biz-sidebar__heading"><span className="biz-sidebar__icon"><StoreIcon size={18} /></span><div><strong>Biznes paneli</strong><small>Dadbox partnyor</small></div></div>
      <nav className="biz-nav" aria-label="Biznes paneli bölmələri">{tabItems.map(({ id, label, icon: Icon }) => <button key={id} type="button" onClick={() => changeTab(id)} className={tab === id ? 'biz-nav__item biz-nav__item--active' : 'biz-nav__item'} aria-current={tab === id ? 'page' : undefined}><Icon size={18} />{label}{id === 'orders' && pendingOrders.length > 0 && <span className="biz-nav__count">{pendingOrders.length}</span>}</button>)}</nav>
      <div className="biz-sidebar__foot"><Leaf size={18} /><p>Yaxşı yeməyə<br /><strong>ikinci şans verək.</strong></p></div>
    </aside>
    <div className="biz-content"><div className="biz-content__top"><div><span className="biz-eyebrow">Dadbox partnyor</span><h1>{tab === 'overview' ? 'Biznesinizə ümumi baxış' : tabItems.find(item => item.id === tab)?.label}</h1><p>{business ? `${business.name} üçün idarəetmə paneli` : 'Birlikdə israfı azaldaq, daha çox insana çataq.'}</p></div>{business && <div className="biz-business-chip"><span className="biz-business-chip__icon"><StoreIcon size={17} /></span><div><strong>{business.name}</strong><small>{business.status === 'APPROVED' ? 'Biznes hesabı' : 'Biznes müraciəti'}</small></div><Status status={business.status} /></div>}</div>
      {ownedBusinesses.length > 1 && <label className="biz-business-select">Biznes seçin<select value={business?.id ?? ''} onChange={e => { setSelectedBusinessId(e.target.value); setNotice(null); }}>{ownedBusinesses.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>}
      {notice && <div className={`biz-notice ${notice.ok ? 'biz-notice--success' : 'biz-notice--error'}`} role="status"><span>{notice.message}</span><button type="button" onClick={() => setNotice(null)} aria-label="Bildirişi bağla"><X size={16} /></button></div>}
      {!business ? <section className="biz-panel biz-onboarding"><div className="biz-onboarding__intro"><span className="biz-round-icon"><StoreIcon size={23} /></span><span className="biz-eyebrow">BİZƏ QOŞULUN</span><h2>Biznesinizi Dadbox-a əlavə edin</h2><p>Məlumatlarınızı daxil edin və tərəfdaşlıq üçün müraciət edin. Təsdiqdən sonra təkliflərinizi paylaşa biləcəksiniz.</p></div><BusinessDetailsForm phone={user.phone} submitLabel="Müraciət göndər" onSubmit={input => feedback(createBusiness(input))} /></section>
      : <>
        {business.status !== 'APPROVED' && <section className={`biz-review biz-review--${business.status.toLowerCase()}`}><div className="biz-review__icon">{business.status === 'PENDING' ? <Clock3 size={21} /> : <Building2 size={21} />}</div><div><span className="biz-eyebrow">MÜRACİƏTİNİZİN STATUSU</span><h2>{business.status === 'PENDING' ? 'Müraciətiniz yoxlanılır' : 'Müraciətiniz rədd edilib'}</h2><p>{business.status === 'PENDING' ? 'Biznes məlumatlarınız nəzərdən keçirilir. Təsdiqdən sonra qutular yarada bilərsiniz.' : 'Məlumatlarınızı yoxlayıb yenidən müraciət edə bilərsiniz.'}</p>{business.status === 'REJECTED' && business.rejectionReason && <p><strong>Səbəb:</strong> {business.rejectionReason}</p>}</div>{business.status === 'REJECTED' && <button type="button" className="biz-button biz-button--small" onClick={() => feedback(applyBusiness(business.id))}>Yenidən müraciət et <ArrowRight size={15} /></button>}</section>}
        {tab === 'overview' && <>
          <div className="biz-welcome"><div><span className="biz-eyebrow">BİRLİKDƏ DAHA AZ İSRAF</span><h2>Salam, {user.name}!</h2><p>Kiçik addımlar böyük fərq yaradır. Biznesinizin son vəziyyəti burada.</p><button type="button" className="biz-button biz-button--cream" onClick={() => changeTab('offers')}>Təkliflərə bax <ArrowRight size={16} /></button></div><div className="biz-welcome__art"><Leaf size={105} strokeWidth={0.8} /></div></div>
          <div className="biz-stats"><div className="biz-stat"><span className="biz-stat__icon"><Boxes size={19} /></span><p>Aktiv təkliflər</p><strong>{activeBoxes.length}</strong><small>Hazırda aktiv qutular</small></div><div className="biz-stat"><span className="biz-stat__icon biz-stat__icon--peach"><Clock3 size={19} /></span><p>Gözləyən sifarişlər</p><strong>{pendingOrders.length}</strong><small>Təsdiq gözləyir</small></div><div className="biz-stat"><span className="biz-stat__icon biz-stat__icon--yellow"><PackageCheck size={19} /></span><p>Təhvil verilən qutular</p><strong>{completedQuantity}</strong><small>Ümumi qutu sayı</small></div><div className="biz-stat"><span className="biz-stat__icon biz-stat__icon--sage"><BarChart3 size={19} /></span><p>Təhvil verilən məbləğ</p><strong>{money(completedRevenue)}</strong><small>Tamamlanmış sifarişlər</small></div></div>
          <section className="biz-panel"><div className="biz-panel__header"><div><span className="biz-eyebrow">SON FƏALİYYƏT</span><h2>Son sifarişlər</h2><p>Biznesinizə gələn son rezervasiyalar.</p></div><button className="biz-link-button" type="button" onClick={() => changeTab('orders')}>Hamısına bax <ChevronRight size={16} /></button></div>{reservations.length ? <div className="biz-order-list">{reservations.slice(0, 3).map(renderOrder)}</div> : <EmptyState icon={ShoppingBag} title="Hələ ki, sifariş yoxdur">İlk sifarişiniz gəldikdə burada görünəcək.</EmptyState>}</section>
          <section className="biz-panel biz-overview-offers"><div className="biz-panel__header"><div><span className="biz-eyebrow">QUTULARINIZ</span><h2>Təklifləriniz</h2><p>Aktiv qutularınızı və qalan miqdarı izləyin.</p></div><button className="biz-link-button" type="button" onClick={() => changeTab('offers')}>Təklifləri idarə et <ChevronRight size={16} /></button></div>{activeBoxes.length ? <div className="biz-mini-list">{activeBoxes.slice(0, 3).map(box => <div className="biz-mini-offer" key={box.id}><img src={box.image || '/images/bakery.jpg'} alt="" /><div><strong>{box.title}</strong><small>{box.quantity} ədəd qalıb · {money(box.price)}</small></div><Status status={box.status} /></div>)}</div> : <EmptyState icon={Boxes} title="Aktiv təklif yoxdur">Təsdiqlənmiş biznesiniz üçün yeni qutu yaradın.</EmptyState>}</section>
        </>}
        {tab === 'offers' && <><div className="biz-section-heading"><div><h2>Qutularınızı idarə edin</h2><p>Təkliflər, qiymətlər və mövcud miqdar bir yerdə.</p></div>{business.status === 'APPROVED' && !editing && <button className="biz-button" type="button" onClick={() => setEditing('new')}><Plus size={17} /> Yeni təklif</button>}</div>{editing && business.status === 'APPROVED' && <BoxEditor key={editing === 'new' ? 'new' : editing.id} box={editing === 'new' ? undefined : editing} onSave={handleSaveBox} onCancel={() => setEditing(null)} />}{boxes.length ? <div className="biz-offer-list">{boxes.map(box => <OfferCard key={box.id} box={box} onEdit={() => { if (business.status === 'APPROVED') setEditing(box); else feedback({ ok: false, message: 'Təklifləri idarə etmək üçün biznes təsdiqlənməlidir.' }); }} onDeactivate={() => { if (business.status === 'APPROVED') feedback(deactivateBox(box.id)); else feedback({ ok: false, message: 'Təklifləri idarə etmək üçün biznes təsdiqlənməlidir.' }); }} />)}</div> : <div className="biz-panel"><EmptyState icon={Boxes} title="Hələ təklifiniz yoxdur">{business.status === 'APPROVED' ? 'İlk sürpriz qutunuzu yaradaraq başlayın.' : 'Müraciətiniz təsdiqləndikdən sonra ilk qutunuzu yarada bilərsiniz.'}</EmptyState></div>}</>}
        {tab === 'orders' && <><div className="biz-section-heading"><div><h2>Sifarişlər</h2><p>Rezervasiyaları təsdiqləyin və kodla təhvil verin.</p></div><span className="biz-count-label">{reservations.length} sifariş</span></div><section className="biz-panel biz-orders-panel">{reservations.length ? <div className="biz-order-list">{reservations.map(renderOrder)}</div> : <EmptyState icon={ShoppingBag} title="Hələ ki, sifariş yoxdur">Müştərilər qutularınızı rezervasiya etdikdə sifarişlər burada görünəcək.</EmptyState>}</section></>}
        {tab === 'settings' && <section className="biz-panel biz-settings"><div className="biz-panel__header"><div><span className="biz-eyebrow">BİZNES PROFİLİ</span><h2>Biznes məlumatları</h2><p>Müştərilərin gördüyü məlumatları burada yeniləyin.</p></div><BadgeCheck size={22} className="biz-settings__icon" /></div><div className="biz-settings__address"><MapPin size={16} /> {business.address} <span>·</span> <CalendarDays size={16} /> Qoşulma: {dateTime(business.createdAt)}</div><BusinessDetailsForm key={`${business.id}-${business.name}-${business.address}-${business.phone}-${business.category}-${business.description}-${business.lat}-${business.lng}-${business.image}-${business.verificationInfo ?? ''}`} business={business} phone={user.phone} submitLabel="Məlumatları saxla" onSubmit={input => feedback(updateBusiness(business.id, input))} /></section>}
      </>}
    </div>
  </div></main>;
}
