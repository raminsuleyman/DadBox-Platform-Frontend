import { useEffect, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, ArrowRight, CalendarDays, CheckCircle2, Clock3, CreditCard,
  Leaf, LogOut, MapPin, PackageOpen, RotateCcw, ShieldCheck, ShoppingBag,
  Star, Ticket, UserRound,
} from 'lucide-react';
import { useApp } from '../store';
import type { ActionResult, Box, OrderStatus, Reservation, Role } from '../types';
import '../styles/customer.css';

const roleLabels: Record<Role, string> = {
  customer: 'Müştəri',
  business: 'Biznes',
  admin: 'Administrator',
};

const statusLabels: Record<OrderStatus, string> = {
  PENDING: 'Gözləyir',
  CONFIRMED: 'Təsdiqlənib',
  PICKED_UP: 'Götürülüb',
  CANCELLED: 'Ləğv edilib',
  EXPIRED: 'Vaxtı bitib',
};

const roleRoute = (role: Role) => role === 'admin' ? '/admin' : role === 'business' ? '/business' : '/orders';
const validEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
const money = (amount: number) => `${new Intl.NumberFormat('az-AZ', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount)} ₼`;

function dateTime(value?: string) {
  if (!value) return 'Məlumat yoxdur';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Məlumat yoxdur';
  const months = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avqust', 'sentyabr', 'oktyabr', 'noyabr', 'dekabr'];
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Baku', day: 'numeric', month: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date).map((part) => [part.type, part.value]));
  return `${parts.day} ${months[Number(parts.month) - 1]} ${parts.year}, ${parts.hour}:${parts.minute}`;
}

function pickupTime(box?: Box) {
  if (!box) return 'Götürmə vaxtı mövcud deyil';
  return `${dateTime(box.pickupStart)} — ${dateTime(box.pickupEnd)}`;
}

function Notice({ result }: { result: ActionResult | null }) {
  if (!result) return null;
  return <div className={`customer-notice ${result.ok ? 'customer-notice--success' : 'customer-notice--error'}`} role={result.ok ? 'status' : 'alert'}>{result.message}</div>;
}

function PageHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="customer-page-heading"><p className="customer-eyebrow">{eyebrow}</p><h1>{title}</h1><p>{description}</p></div>;
}

export function AuthPage() {
  const { user, data, login, register, switchDemo } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState<'login' | 'register' | 'recover'>('login');
  const [role, setRole] = useState<'customer' | 'business'>('customer');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [result, setResult] = useState<ActionResult | null>(null);
  const locationNotice = (location.state as { notice?: string } | null)?.notice;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (mode === 'register' && name.trim().length < 2) {
      setResult({ ok: false, message: 'Adınızı ən azı 2 simvol ilə daxil edin.' });
      return;
    }
    if (!validEmail(email)) {
      setResult({ ok: false, message: 'Düzgün demo e-poçt ünvanı daxil edin.' });
      return;
    }
    if (mode === 'recover') {
      setResult({ ok: true, message: 'Demo bərpa sorğusu göstərildi. Həqiqi e-poçt göndərilmir və şifrə dəyişdirilmir.' });
      return;
    }
    if (password.length < 6) {
      setResult({ ok: false, message: 'Demo şifrə ən azı 6 simvol olmalıdır.' });
      return;
    }
    const cleanEmail = email.trim();
    const response = mode === 'login'
      ? login(cleanEmail, password)
      : register(name.trim(), cleanEmail, password, role, phone.trim());
    setResult(response);
    if (response.ok) {
      const accountRole = mode === 'register' ? role : data.users.find((account) => account.email.toLowerCase() === cleanEmail.toLowerCase())?.role;
      navigate(roleRoute(accountRole ?? 'customer'));
    }
  };

  const quickLogin = (selectedRole: Role) => {
    const demoId: Record<Role, string> = { customer: 'u-customer', business: 'u-business', admin: 'u-admin' };
    const account = data.users.find((item) => item.id === demoId[selectedRole]);
    if (!account || account.suspended) {
      setResult({ ok: false, message: 'Bu demo hesabı mövcud deyil və ya bloklanıb.' });
      return;
    }
    switchDemo(selectedRole);
    navigate(roleRoute(selectedRole));
  };

  return (
    <main className="customer-page customer-auth-page">
      <div className="customer-auth-shell">
        <section className="customer-auth-intro" aria-labelledby="customer-auth-heading">
          <Link to="/" className="customer-back-link"><ArrowLeft size={16} /> Təkliflərə qayıt</Link>
          <div className="customer-auth-copy">
            <span className="customer-intro-icon"><Leaf size={24} /></span>
            <p className="customer-eyebrow">Dadbox-a xoş gəlmisiniz</p>
            <h1 id="customer-auth-heading">Yaxşı yeməyə<br /><em>ikinci şans.</em></h1>
            <p>Yaxınlıqdakı ləzzətləri kəşf et, sürpriz qutunu ayır və yerində götür.</p>
          </div>
          <div className="customer-auth-intro-bottom"><span>DAHA AZ İSRAF</span><span>DAHA ÇOX LƏZZƏT</span></div>
        </section>
        <section className="customer-auth-card" aria-labelledby="customer-form-heading">
          <div className="customer-tabs" aria-label="Hesab əməliyyatları">
            <button type="button" className={mode !== 'register' ? 'customer-tab customer-tab--active' : 'customer-tab'} aria-pressed={mode !== 'register'} onClick={() => { setMode('login'); setResult(null); }}>Daxil ol</button>
            <button type="button" className={mode === 'register' ? 'customer-tab customer-tab--active' : 'customer-tab'} aria-pressed={mode === 'register'} onClick={() => { setMode('register'); setResult(null); }}>Qeydiyyat</button>
          </div>
          <h2 id="customer-form-heading">{mode === 'recover' ? 'Şifrəni bərpa et' : mode === 'login' ? 'Yenidən xoş gəldin' : 'Hesab yarat'}</h2>
          <p className="customer-muted">{mode === 'recover' ? 'Bərpa axınının yalnız demo görüntüsüdür.' : mode === 'login' ? 'Demo hesabınla davam et.' : 'Dadbox təcrübəsinə qoşulmaq üçün demo hesab yarat.'}</p>
          <div className="customer-demo-note"><ShieldCheck size={19} aria-hidden="true" /><span><strong>Bu, yalnız nümayişdir.</strong> Giriş və qeydiyyat imitasiya olunur; şifrə yoxlanılmır və təhlükəsiz autentifikasiya yoxdur. Həqiqi şifrənizi və şəxsi məlumatlarınızı daxil etməyin.</span></div>
          {locationNotice && <Notice result={{ ok: true, message: locationNotice }} />}
          {user && <p className="customer-signed-in">Hazırda {user.name} kimi daxil olmusunuz. <Link to={roleRoute(user.role)}>Hesaba keç</Link></p>}
          <Notice result={result} />
          <form onSubmit={submit} className="customer-form" noValidate>
            {mode === 'register' && <>
              <fieldset className="customer-role-field"><legend>Hesab növü</legend><div className="customer-role-options">
                <label className={role === 'customer' ? 'customer-role-option customer-role-option--selected' : 'customer-role-option'}><input type="radio" name="customer-registration-role" value="customer" checked={role === 'customer'} onChange={() => setRole('customer')} /> Müştəri</label>
                <label className={role === 'business' ? 'customer-role-option customer-role-option--selected' : 'customer-role-option'}><input type="radio" name="customer-registration-role" value="business" checked={role === 'business'} onChange={() => setRole('business')} /> Biznes</label>
              </div></fieldset>
              <label htmlFor="customer-auth-name">Ad və soyad</label><input id="customer-auth-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Demo istifadəçi" autoComplete="off" required minLength={2} />
            </>}
            <label htmlFor="customer-auth-email">Demo e-poçt</label><input id="customer-auth-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="demo@example.com" autoComplete="off" required />
            {mode === 'register' && <><label htmlFor="customer-auth-phone">Demo telefon <span className="customer-optional">(istəyə bağlı)</span></label><input id="customer-auth-phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Demo telefon nömrəsi" autoComplete="off" /></>}
            {mode !== 'recover' && <><label htmlFor="customer-auth-password">Demo şifrə</label><input id="customer-auth-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Uydurma şifrə, ən azı 6 simvol" autoComplete="new-password" required minLength={6} /></>}
            <button className="customer-button customer-button--primary customer-button--wide" type="submit">{mode === 'recover' ? 'Demo sorğu göndər' : mode === 'login' ? 'Daxil ol' : 'Demo hesab yarat'} <ArrowRight size={17} /></button>
            {mode === 'login' && <button type="button" className="customer-button customer-button--subtle" onClick={() => { setMode('recover'); setResult(null); }}>Şifrəni unutmusunuz?</button>}
            {mode === 'recover' && <button type="button" className="customer-button customer-button--subtle" onClick={() => { setMode('login'); setResult(null); }}>Girişə qayıt</button>}
          </form>
          <div className="customer-divider"><span>və ya demo ilə tanış ol</span></div>
          <p className="customer-demo-caption">Şifrə olmadan demo rolu seçin:</p>
          <div className="customer-demo-roles">
            <button type="button" onClick={() => quickLogin('customer')}>Müştəri</button>
            <button type="button" onClick={() => quickLogin('business')}>Biznes</button>
            <button type="button" onClick={() => quickLogin('admin')}>Admin</button>
          </div>
        </section>
      </div>
    </main>
  );
}

function AccessMessage({ title, message, action, to }: { title: string; message: string; action: string; to: string }) {
  return <main className="customer-page"><div className="customer-container"><div className="customer-empty customer-access"><span className="customer-empty-icon"><UserRound size={25} /></span><h1>{title}</h1><p>{message}</p><Link className="customer-button customer-button--primary" to={to}>{action} <ArrowRight size={17} /></Link></div></div></main>;
}

function ReviewForm({ reservation, onResult }: { reservation: Reservation; onResult: (result: ActionResult) => void }) {
  const { addReview } = useApp();
  const [rating, setRating] = useState('5');
  const [comment, setComment] = useState('');
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onResult(addReview(reservation.id, Number(rating), comment.trim()));
  };
  return <form className="customer-review-form" onSubmit={submit}>
    <div><h3>Təcrübəni qiymətləndir</h3><p>Fikrin digər istifadəçilərə kömək edir.</p></div>
    <div className="customer-review-fields">
      <label htmlFor={`customer-rating-${reservation.id}`}>Qiymət<select id={`customer-rating-${reservation.id}`} value={rating} onChange={(event) => setRating(event.target.value)}>{[5, 4, 3, 2, 1].map((value) => <option value={value} key={value}>{value} / 5</option>)}</select></label>
      <label htmlFor={`customer-comment-${reservation.id}`}><span>Rəy <span className="customer-optional">(istəyə bağlı)</span></span><textarea id={`customer-comment-${reservation.id}`} rows={2} value={comment} maxLength={500} onChange={(event) => setComment(event.target.value)} placeholder="Təcrübəniz necə idi?" /></label>
    </div>
    <button className="customer-button customer-button--outline" type="submit"><Star size={16} /> Rəyi göndər</button>
  </form>;
}

export function OrdersPage() {
  const { user, data, cancelReservation } = useApp();
  const location = useLocation();
  const [tab, setTab] = useState<'active' | 'history'>('active');
  const [result, setResult] = useState<ActionResult | null>(() => new URLSearchParams(location.search).has('success')
    ? { ok: true, message: 'Rezervasiya yaradıldı. Ödənişi götürərkən edin.' }
    : null);
  if (!user) return <AccessMessage title="Sifarişlərinizə baxın" message="Rezervasiyalarınızı görmək üçün demo hesabınıza daxil olun." action="Daxil ol" to="/auth" />;
  if (user.role !== 'customer') return <AccessMessage title="Bu səhifə müştərilər üçündür" message="Sifariş siyahısı yalnız müştəri hesabında görünür." action="Öz panelinə keç" to={roleRoute(user.role)} />;

  const orders = data.reservations.filter((reservation) => reservation.customerId === user.id).slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const isActive = (status: OrderStatus) => status === 'PENDING' || status === 'CONFIRMED';
  const active = orders.filter((order) => isActive(order.status));
  const history = orders.filter((order) => !isActive(order.status));
  const shown = tab === 'active' ? active : history;

  return <main className="customer-page customer-orders-page"><div className="customer-container">
    <Link to="/" className="customer-back-link"><ArrowLeft size={16} /> Təkliflərə qayıt</Link>
    <div className="customer-heading-row"><PageHeading eyebrow="Dadbox sifarişləri" title="Sifarişlərim" description="Rezervasiyalarınız və götürmə məlumatlarınız bir yerdə." /><Link className="customer-text-link" to="/profile">Profilim <ArrowRight size={16} /></Link></div>
    <div className="customer-order-tabs" aria-label="Sifariş bölmələri">
      <button type="button" className={tab === 'active' ? 'customer-order-tab customer-order-tab--active' : 'customer-order-tab'} aria-pressed={tab === 'active'} onClick={() => setTab('active')}>Aktiv <span>{active.length}</span></button>
      <button type="button" className={tab === 'history' ? 'customer-order-tab customer-order-tab--active' : 'customer-order-tab'} aria-pressed={tab === 'history'} onClick={() => setTab('history')}>Keçmiş <span>{history.length}</span></button>
    </div>
    <Notice result={result} />
    {shown.length === 0 ? <div className="customer-empty"><span className="customer-empty-icon"><PackageOpen size={27} /></span><h2>{tab === 'active' ? 'Hələ aktiv sifarişiniz yoxdur' : 'Sifariş tarixçəniz boşdur'}</h2><p>{tab === 'active' ? 'Yaxınlıqdakı sürpriz qutuları kəşf edib ilk rezervasiyanızı edin.' : 'Götürdüyünüz, ləğv etdiyiniz və ya vaxtı bitmiş sifarişlər burada görünəcək.'}</p><Link className="customer-button customer-button--primary" to="/">Təklifləri kəşf et <ArrowRight size={17} /></Link></div> : <div className="customer-order-list">{shown.map((order) => {
      const box = data.boxes.find((item) => item.id === order.boxId);
      const business = data.businesses.find((item) => item.id === order.businessId);
      const review = data.reviews.find((item) => item.reservationId === order.id);
      const canCancel = isActive(order.status) && !!box && new Date(box.pickupStart).getTime() > Date.now();
      return <article className="customer-order-card" key={order.id}>
        <div className="customer-order-top"><div><span className="customer-order-kicker">REZERVASİYA · {dateTime(order.createdAt)}</span><h2>{box ? <Link to={`/box/${box.id}`}>{box.title}</Link> : 'Təklif mövcud deyil'}</h2><p>{business?.name ?? 'Biznes məlumatı mövcud deyil'}</p></div><span className={`customer-status customer-status--${order.status.toLowerCase().replace('_', '-')}`}>{statusLabels[order.status]}</span></div>
        <div className="customer-order-body">
          {box?.image && <img className="customer-order-image" src={box.image} alt={box.title} />}
          <div className="customer-order-details">
            <div className="customer-detail"><Clock3 size={18} aria-hidden="true" /><div><span>Götürmə vaxtı (Bakı)</span><strong>{pickupTime(box)}</strong></div></div>
            <div className="customer-detail"><MapPin size={18} aria-hidden="true" /><div><span>Ünvan</span><strong>{business?.address || 'Ünvan mövcud deyil'}</strong></div></div>
            <div className="customer-detail"><ShoppingBag size={18} aria-hidden="true" /><div><span>Miqdar</span><strong>{order.quantity} ədəd</strong></div></div>
            <div className="customer-detail"><CreditCard size={18} aria-hidden="true" /><div><span>Ödəniş</span><strong>{money(order.totalPrice)} · götürərkən yerində</strong></div></div>
          </div>
          <div className="customer-code"><Ticket size={19} aria-hidden="true" /><span>GÖTÜRMƏ KODU</span><strong>{order.code}</strong><small>Kodu biznesə təqdim edin</small></div>
        </div>
        {(isActive(order.status) || order.status === 'PICKED_UP') && <div className="customer-order-actions">
          {canCancel && <button className="customer-button customer-button--subtle" type="button" onClick={() => { if (window.confirm('Bu rezervasiyanı ləğv etmək istədiyinizə əminsiniz?')) setResult(cancelReservation(order.id)); }}>Rezervasiyanı ləğv et</button>}
          {isActive(order.status) && !canCancel && <p className="customer-cancel-note">Ləğv yalnız götürmə vaxtı başlamazdan əvvəl mümkündür.</p>}
          {order.status === 'PICKED_UP' && (review ? <div className="customer-review-done"><CheckCircle2 size={17} /> Rəyiniz göndərilib · {review.rating}/5</div> : <ReviewForm reservation={order} onResult={setResult} />)}
        </div>}
      </article>;
    })}</div>}
    <div className="customer-payment-note"><CreditCard size={19} /><p><strong>Ödəniş yerindədir.</strong> Onlayn ödəniş edilmir; məbləği qutunu götürərkən biznesə ödəyirsiniz.</p></div>
  </div></main>;
}

export function ProfilePage() {
  const { user, updateProfile, logout, resetDemo } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState(user?.name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [result, setResult] = useState<ActionResult | null>(null);
  useEffect(() => {
    setName(user?.name ?? '');
    setPhone(user?.phone ?? '');
    setResult(null);
  }, [user?.id]);
  if (!user) return <AccessMessage title="Profilinizə baxın" message="Profil məlumatlarınızı görmək üçün demo hesabınıza daxil olun." action="Daxil ol" to="/auth" />;

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (name.trim().length < 2) { setResult({ ok: false, message: 'Adınızı ən azı 2 simvol ilə daxil edin.' }); return; }
    setResult(updateProfile({ name: name.trim(), phone: phone.trim() }));
  };
  const doLogout = () => { logout(); navigate('/auth'); };
  const doReset = () => {
    if (!window.confirm('Bütün demo dəyişiklikləri silinib ilkin məlumatlar bərpa ediləcək. Davam edilsin?')) return;
    resetDemo();
    navigate('/auth', { state: { notice: 'Demo məlumatları ilkin vəziyyətə qaytarıldı.' } });
  };

  return <main className="customer-page customer-profile-page"><div className="customer-container">
    <Link to={roleRoute(user.role)} className="customer-back-link"><ArrowLeft size={16} /> Hesabıma qayıt</Link>
    <PageHeading eyebrow="HESAB AYARLARI" title="Profilim" description="Demo hesab məlumatlarınızı buradan idarə edin." />
    <div className="customer-profile-grid">
      <aside className="customer-profile-summary"><span className="customer-avatar"><UserRound size={28} /></span><h2>{user.name}</h2><p>{user.email}</p><span className="customer-role-badge">{roleLabels[user.role]}</span><div className="customer-profile-links"><Link to={roleRoute(user.role)}><CalendarDays size={17} /> {user.role === 'customer' ? 'Sifarişlərim' : 'İdarəetmə paneli'}</Link><Link to="/"><ShoppingBag size={17} /> Təklifləri kəşf et</Link></div></aside>
      <div className="customer-profile-content">
        <section className="customer-profile-card"><div className="customer-section-heading"><div><p className="customer-eyebrow">MƏLUMATLARINIZ</p><h2>Şəxsi məlumatlar</h2><p>Adınızı və telefonunuzu yeniləyin.</p></div><UserRound size={22} /></div>
          <Notice result={result} />
          <form className="customer-form" onSubmit={submit} noValidate>
            <label htmlFor="customer-profile-name">Ad və soyad</label><input id="customer-profile-name" value={name} onChange={(event) => setName(event.target.value)} required minLength={2} />
            <label htmlFor="customer-profile-phone">Telefon</label><input id="customer-profile-phone" type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Demo telefon nömrəsi" />
            <div className="customer-readonly-grid"><div><span>E-poçt</span><strong>{user.email}</strong></div><div><span>Hesab növü</span><strong>{roleLabels[user.role]}</strong></div></div>
            <button type="submit" className="customer-button customer-button--primary">Dəyişiklikləri saxla <ArrowRight size={17} /></button>
          </form>
        </section>
        <section className="customer-profile-card customer-account-actions"><div><p className="customer-eyebrow">DEMO HESAB</p><h2>Hesab əməliyyatları</h2><p>Bu nümayişdə dəyişikliklər yalnız bu brauzerdə saxlanılır. Həqiqi şəxsi məlumatlar daxil etməyin.</p></div><div className="customer-account-buttons"><button className="customer-button customer-button--outline" type="button" onClick={doLogout}><LogOut size={17} /> Çıxış et</button><button className="customer-button customer-button--subtle" type="button" onClick={doReset}><RotateCcw size={17} /> Demo məlumatlarını sıfırla</button></div></section>
      </div>
    </div>
  </div></main>;
}
