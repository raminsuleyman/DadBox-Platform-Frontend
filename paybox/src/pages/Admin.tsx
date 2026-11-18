import { useState } from 'react';
import {
  Activity, AlertCircle, ArrowDownRight, ArrowRight, BadgeCheck, Ban, Box,
  Building2, Check, CheckCircle2, ChevronRight, CircleHelp, LayoutDashboard,
  Search, ShieldCheck, ShieldOff, ShoppingBag, Users, X,
} from 'lucide-react';
import { useApp } from '../store';
import type { ActionResult, Business, Complaint } from '../types';
import '../styles/admin.css';

type Section = 'overview' | 'businesses' | 'users' | 'offers' | 'complaints';
type BusinessFilter = 'ALL' | Business['status'];

const sectionNames: Record<Section, string> = {
  overview: 'Ümumi baxış',
  businesses: 'Biznes müraciətləri',
  users: 'İstifadəçilər',
  offers: 'Təkliflər',
  complaints: 'Şikayətlər',
};

const businessStatus: Record<Business['status'], string> = {
  PENDING: 'Gözləyir', APPROVED: 'Təsdiqlənib', REJECTED: 'Rədd edilib',
};

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Tarix göstərilməyib';
  return new Intl.DateTimeFormat('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Asia/Baku' }).format(date);
}

function matchesSearch(query: string, ...values: (string | undefined)[]) {
  const term = query.trim().toLocaleLowerCase('az');
  return !term || values.some(value => value?.toLocaleLowerCase('az').includes(term));
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return <div className="admin-empty"><div className="admin-empty-icon"><Search size={21} /></div><strong>{title}</strong><p>{description}</p></div>;
}

export default function AdminPage() {
  const { data, user, adminBusiness, adminUser, adminBox, resolveComplaint } = useApp();
  const [section, setSection] = useState<Section>('overview');
  const [query, setQuery] = useState('');
  const [businessFilter, setBusinessFilter] = useState<BusinessFilter>('ALL');
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [reason, setReason] = useState('');
  const [feedback, setFeedback] = useState<ActionResult | null>(null);

  if (!user || user.role !== 'admin') {
    return <main className="admin-root"><div className="admin-denied"><div className="admin-denied-icon"><ShieldOff size={28} /></div><span className="admin-eyebrow">GİRİŞ MƏHDUDDUR</span><h1>Bu səhifə yalnız idarəçilər üçündür.</h1><p>Davam etmək üçün administrator hesabı ilə daxil olun.</p><a className="admin-button admin-button-primary" href="/">Ana səhifəyə qayıt <ArrowRight size={16} /></a></div></main>;
  }

  const pending = data.businesses.filter(b => b.status === 'PENDING');
  const approved = data.businesses.filter(b => b.status === 'APPROVED');
  const activeOffers = data.boxes.filter(box => box.status === 'ACTIVE');
  const openComplaints = data.complaints.filter(complaint => complaint.status === 'OPEN');
  const getUserName = (id: string) => data.users.find(item => item.id === id)?.name || 'Naməlum istifadəçi';
  const getBusinessName = (id: string) => data.businesses.find(item => item.id === id)?.name || 'Naməlum biznes';
  const targetName = (complaint: Complaint) => {
    if (complaint.targetType === 'business') return getBusinessName(complaint.targetId);
    if (complaint.targetType === 'box') {
      const box = data.boxes.find(item => item.id === complaint.targetId);
      return box ? `${box.title} · ${getBusinessName(box.businessId)}` : 'Naməlum təklif';
    }
    const review = data.reviews.find(item => item.id === complaint.targetId);
    return review ? `${getUserName(review.customerId)} · ${getBusinessName(review.businessId)}` : 'Naməlum rəy';
  };
  const targetTypeName = (type: Complaint['targetType']) => ({ business: 'Biznes', box: 'Təklif', review: 'Rəy' })[type];
  const sortedBusinesses = [...data.businesses].sort((a, b) => {
    if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
    if (b.status === 'PENDING' && a.status !== 'PENDING') return 1;
    return b.createdAt.localeCompare(a.createdAt);
  });
  const filteredBusinesses = sortedBusinesses.filter(b => (businessFilter === 'ALL' || b.status === businessFilter) && matchesSearch(query, b.name, b.category, getUserName(b.ownerId), b.address));
  const filteredUsers = data.users.filter(item => matchesSearch(query, item.name, item.email, item.phone));
  const filteredOffers = data.boxes.filter(item => matchesSearch(query, item.title, item.category, getBusinessName(item.businessId)));
  const sortedComplaints = [...data.complaints].sort((a, b) => {
    if (a.status === 'OPEN' && b.status !== 'OPEN') return -1;
    if (b.status === 'OPEN' && a.status !== 'OPEN') return 1;
    return b.createdAt.localeCompare(a.createdAt);
  });
  const filteredComplaints = sortedComplaints.filter(item => matchesSearch(query, item.description, targetName(item), getUserName(item.userId), targetTypeName(item.targetType)));

  const navigate = (next: Section) => { setSection(next); setQuery(''); setRejectId(null); setReason(''); };
  const perform = (action: () => ActionResult) => {
    try {
      const result = action();
      setFeedback({ ...result, message: result.message || (result.ok ? 'Əməliyyat uğurla tamamlandı.' : 'Əməliyyatı tamamlamaq mümkün olmadı.') });
      return result.ok;
    } catch {
      setFeedback({ ok: false, message: 'Əməliyyat zamanı xəta baş verdi. Yenidən cəhd edin.' });
      return false;
    }
  };
  const rejectBusiness = (id: string) => {
    if (!reason.trim()) {
      setFeedback({ ok: false, message: 'Zəhmət olmasa, rədd edilmə səbəbini daxil edin.' });
      return;
    }
    if (!window.confirm('Bu müraciəti göstərilən səbəblə rədd etmək istədiyinizə əminsiniz?')) return;
    if (perform(() => adminBusiness(id, 'REJECTED', reason.trim()))) { setRejectId(null); setReason(''); }
  };

  const navItems = [
    { id: 'overview' as const, label: 'Ümumi baxış', icon: LayoutDashboard },
    { id: 'businesses' as const, label: 'Biznes müraciətləri', icon: Building2, count: pending.length },
    { id: 'users' as const, label: 'İstifadəçilər', icon: Users },
    { id: 'offers' as const, label: 'Təkliflər', icon: ShoppingBag },
    { id: 'complaints' as const, label: 'Şikayətlər', icon: CircleHelp, count: openComplaints.length },
  ];

  return <main className="admin-root">
    <div className="admin-shell">
      <aside className="admin-sidebar" aria-label="İdarəçi naviqasiyası">
        <div className="admin-sidebar-heading"><div className="admin-sidebar-icon"><ShieldCheck size={19} /></div><div><strong>İdarə paneli</strong><span>Dadbox administrator</span></div></div>
        <div className="admin-nav-label">İDARƏETMƏ</div>
        <nav className="admin-nav" aria-label="Bölmələr">
          {navItems.map(({ id, label, icon: Icon, count }) => <button key={id} type="button" className={`admin-nav-item ${section === id ? 'admin-nav-item-active' : ''}`} onClick={() => navigate(id)} aria-current={section === id ? 'page' : undefined}><Icon size={18} strokeWidth={1.8} /><span>{label}</span>{!!count && <span className="admin-nav-count">{count}</span>}</button>)}
        </nav>
        <div className="admin-sidebar-note"><Activity size={17} /><div><strong>Demo mühit</strong><span>Məlumatlar nümunə xarakterlidir.</span></div></div>
      </aside>

      <div className="admin-content">
        <div className="admin-topline"><span>İDARƏ PANELİ <ChevronRight size={13} /> {sectionNames[section].toLocaleUpperCase('az')}</span><div className="admin-account"><span className="admin-account-dot" />{user.name}</div></div>
        <header className="admin-heading"><div><span className="admin-eyebrow">Dadbox idarəetmə</span><h1>{section === 'overview' ? 'Hər şey bir baxışda.' : sectionNames[section]}</h1><p>{section === 'overview' ? 'Platformanın gündəlik fəaliyyətini buradan izləyin.' : section === 'businesses' ? 'Biznes müraciətlərinə baxın və qərar verin.' : section === 'users' ? 'İstifadəçi hesablarını nəzərdən keçirin və idarə edin.' : section === 'offers' ? 'Platformadakı təklifləri nəzərdən keçirin.' : 'Daxil olan şikayətləri izləyin və həll edin.'}</p></div><div className="admin-heading-badge"><span /> Platformaya ümumi nəzarət</div></header>

        {feedback && <div className={`admin-feedback ${feedback.ok ? 'admin-feedback-success' : 'admin-feedback-error'}`} role="alert">{feedback.ok ? <CheckCircle2 size={19} /> : <AlertCircle size={19} />}<span>{feedback.message}</span><button type="button" onClick={() => setFeedback(null)} aria-label="Bildirişi bağla"><X size={17} /></button></div>}

        {section === 'overview' && <>
          <div className="admin-kpi-grid">
            <div className="admin-kpi"><div className="admin-kpi-top"><span>İstifadəçilər</span><div className="admin-kpi-icon"><Users size={19} /></div></div><strong>{data.users.length}</strong><small>Qeydiyyatdan keçmiş hesab</small></div>
            <div className="admin-kpi"><div className="admin-kpi-top"><span>Bizneslər</span><div className="admin-kpi-icon admin-kpi-icon-sage"><Building2 size={19} /></div></div><strong>{approved.length}</strong><small>Təsdiqlənmiş tərəfdaş</small></div>
            <div className="admin-kpi"><div className="admin-kpi-top"><span>Aktiv təkliflər</span><div className="admin-kpi-icon admin-kpi-icon-peach"><ShoppingBag size={19} /></div></div><strong>{activeOffers.length}</strong><small>Hazırda aktiv statusda</small></div>
            <div className="admin-kpi"><div className="admin-kpi-top"><span>Açıq şikayətlər</span><div className="admin-kpi-icon admin-kpi-icon-yellow"><CircleHelp size={19} /></div></div><strong>{openComplaints.length}</strong><small>Baxılmağı gözləyir</small></div>
          </div>
          <div className="admin-overview-grid">
            <section className="admin-panel admin-pending-panel"><div className="admin-panel-head"><div><span className="admin-panel-kicker">DİQQƏT TƏLƏB EDİR</span><h2>Gözləyən müraciətlər <span className="admin-heading-count">{pending.length}</span></h2><p>Platformaya qoşulmaq istəyən bizneslər.</p></div><button className="admin-text-link" type="button" onClick={() => { setBusinessFilter('PENDING'); navigate('businesses'); }}>Hamısına bax <ArrowRight size={16} /></button></div>
              {pending.length ? <div className="admin-overview-list">{[...pending].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4).map(business => <div className="admin-overview-row" key={business.id}><div className="admin-avatar admin-avatar-business"><Building2 size={17} /></div><div className="admin-row-main"><strong>{business.name}</strong><span>{business.category} · {formatDate(business.createdAt)}</span></div><span className="admin-status admin-status-pending"><span />Gözləyir</span><button className="admin-icon-button" type="button" onClick={() => { setBusinessFilter('PENDING'); navigate('businesses'); }} aria-label={`${business.name} müraciətlərinə bax`}><ChevronRight size={18} /></button></div>)}</div> : <EmptyState title="Gözləyən müraciət yoxdur" description="Yeni müraciətlər burada görünəcək." />}
            </section>
            <section className="admin-panel admin-summary"><div className="admin-panel-head"><div><span className="admin-panel-kicker">PLATFORMA</span><h2>Qısa xülasə</h2><p>Dadbox-da ümumi vəziyyət.</p></div><div className="admin-summary-icon"><Activity size={19} /></div></div><div className="admin-summary-list"><div><span>Bütün bizneslər</span><strong>{data.businesses.length}</strong></div><div><span>Bütün təkliflər</span><strong>{data.boxes.length}</strong></div><div><span>Rezervasiyalar</span><strong>{data.reservations.length}</strong></div><div><span>Həll edilmiş şikayətlər</span><strong>{data.complaints.filter(item => item.status === 'RESOLVED').length}</strong></div></div><div className="admin-summary-foot"><span className="admin-summary-leaf"><ArrowDownRight size={17} /></span><span>Kiçik addımlar, daha az qida israfı.</span></div></section>
          </div>
          <section className="admin-panel admin-recent-panel"><div className="admin-panel-head"><div><span className="admin-panel-kicker">SON FƏALİYYƏT</span><h2>Son şikayətlər</h2><p>İstifadəçilərdən gələn son müraciətlər.</p></div><button className="admin-text-link" type="button" onClick={() => navigate('complaints')}>Bütün şikayətlər <ArrowRight size={16} /></button></div>{data.complaints.length ? <div className="admin-overview-list">{[...data.complaints].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3).map(item => <div className="admin-overview-row" key={item.id}><div className="admin-avatar admin-avatar-complaint"><CircleHelp size={17} /></div><div className="admin-row-main"><strong>{targetName(item)}</strong><span>{getUserName(item.userId)} · {formatDate(item.createdAt)}</span></div><span className={`admin-status ${item.status === 'OPEN' ? 'admin-status-pending' : 'admin-status-approved'}`}><span />{item.status === 'OPEN' ? 'Açıq' : 'Həll edilib'}</span></div>)}</div> : <EmptyState title="Hələ şikayət yoxdur" description="Daxil olan şikayətlər burada görünəcək." />}</section>
        </>}

        {section !== 'overview' && <section className="admin-panel admin-list-panel">
          <div className="admin-list-toolbar"><div><span className="admin-panel-kicker">{section === 'businesses' ? 'MÜRACİƏTLƏR' : section === 'users' ? 'HESABLAR' : section === 'offers' ? 'MODERASİYA' : 'DƏSTƏK'}</span><h2>{sectionNames[section]} <span className="admin-heading-count">{section === 'businesses' ? filteredBusinesses.length : section === 'users' ? filteredUsers.length : section === 'offers' ? filteredOffers.length : filteredComplaints.length}</span></h2></div><label className="admin-search"><Search size={17} /><span className="admin-sr-only">Axtarış</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Axtar..." /></label></div>
          {section === 'businesses' && <>
            <div className="admin-filters" aria-label="Müraciət statusuna görə filtrlə">{([['ALL', 'Hamısı'], ['PENDING', 'Gözləyənlər'], ['APPROVED', 'Təsdiqlənənlər'], ['REJECTED', 'Rədd edilənlər']] as const).map(([value, label]) => <button type="button" key={value} className={businessFilter === value ? 'admin-filter-active' : ''} aria-pressed={businessFilter === value} onClick={() => setBusinessFilter(value)}>{label}{value === 'PENDING' && <span>{pending.length}</span>}</button>)}</div>
            {filteredBusinesses.length ? <div className="admin-records">{filteredBusinesses.map(business => <article className="admin-record" key={business.id}><div className="admin-record-top"><div className="admin-avatar admin-avatar-business"><Building2 size={19} /></div><div className="admin-record-main"><div className="admin-record-title"><h3>{business.name}</h3><span className={`admin-status admin-status-${business.status.toLowerCase()}`}><span />{businessStatus[business.status]}</span></div><p>{business.category} · {business.address}</p>{business.description && <p className="admin-business-description">{business.description}</p>}{business.verificationInfo && <p className="admin-business-description"><strong>Təsdiq məlumatı:</strong> {business.verificationInfo}</p>}<div className="admin-meta"><span>Sahib: <strong>{getUserName(business.ownerId)}</strong></span><span>Müraciət: {formatDate(business.createdAt)}</span><span>{business.phone}</span></div>{business.rejectionReason && business.status === 'REJECTED' && <p className="admin-rejection-note"><strong>Rədd səbəbi:</strong> {business.rejectionReason}</p>}</div>{business.status === 'PENDING' && <div className="admin-actions"><button type="button" className="admin-button admin-button-outline" onClick={() => { setRejectId(rejectId === business.id ? null : business.id); setReason(''); }}>Rədd et</button><button type="button" className="admin-button admin-button-primary" onClick={() => perform(() => adminBusiness(business.id, 'APPROVED'))}><Check size={15} /> Təsdiqlə</button></div>}</div>{rejectId === business.id && business.status === 'PENDING' && <form className="admin-reject-form" onSubmit={event => { event.preventDefault(); rejectBusiness(business.id); }}><label htmlFor={`admin-reason-${business.id}`}>Rədd edilmə səbəbi <span>*</span></label><textarea id={`admin-reason-${business.id}`} value={reason} onChange={event => setReason(event.target.value)} placeholder="Səbəbi qısa şəkildə qeyd edin..." required /><div><button className="admin-button admin-button-plain" type="button" onClick={() => { setRejectId(null); setReason(''); }}>Vaz keç</button><button className="admin-button admin-button-danger" type="submit">Müraciəti rədd et</button></div></form>}</article>)}</div> : <EmptyState title="Müraciət tapılmadı" description="Axtarışı və ya status filtrini dəyişməyə çalışın." />}
          </>}
          {section === 'users' && (filteredUsers.length ? <div className="admin-records">{filteredUsers.map(item => <article className="admin-record" key={item.id}><div className="admin-record-top"><div className="admin-avatar admin-avatar-user">{item.name.trim().charAt(0).toLocaleUpperCase('az') || 'İ'}</div><div className="admin-record-main"><div className="admin-record-title"><h3>{item.name}</h3><span className={`admin-status ${item.suspended ? 'admin-status-rejected' : 'admin-status-approved'}`}><span />{item.suspended ? 'Bloklanıb' : 'Aktiv'}</span></div><p>{item.email}{item.phone ? ` · ${item.phone}` : ''}</p><div className="admin-meta"><span>{item.role === 'admin' ? 'Administrator' : item.role === 'business' ? 'Biznes' : 'Müştəri'}</span>{item.id === user.id && <span>Öz hesabınız</span>}</div></div><div className="admin-actions">{item.id === user.id ? null : item.suspended ? <button type="button" className="admin-button admin-button-outline" onClick={() => perform(() => adminUser(item.id, false))}><CheckCircle2 size={15} /> Aktivləşdir</button> : <button type="button" className="admin-button admin-button-outline admin-button-warning" onClick={() => { if (window.confirm(`${item.name} adlı istifadəçini bloklamaq istədiyinizə əminsiniz?`)) perform(() => adminUser(item.id, true)); }}><Ban size={15} /> Blokla</button>}</div></div></article>)}</div> : <EmptyState title="İstifadəçi tapılmadı" description="Başqa ad, e-poçt və ya telefon nömrəsi ilə axtarın." />)}
          {section === 'offers' && (filteredOffers.length ? <div className="admin-records">{filteredOffers.map(item => <article className="admin-record" key={item.id}><div className="admin-record-top"><div className="admin-avatar admin-avatar-offer"><Box size={19} /></div><div className="admin-record-main"><div className="admin-record-title"><h3>{item.title}</h3><span className={`admin-status ${item.status === 'ACTIVE' ? 'admin-status-approved' : 'admin-status-muted'}`}><span />{item.status === 'ACTIVE' ? 'Aktiv' : 'Deaktiv'}</span></div><p>{getBusinessName(item.businessId)} · {item.category}</p><div className="admin-meta"><span>Qiymət: <strong>{new Intl.NumberFormat('az-AZ', { maximumFractionDigits: 2 }).format(item.price)} ₼</strong></span><span>Qalıq: {item.quantity}</span><span>Əlavə edilib: {formatDate(item.createdAt)}</span></div></div>{item.status === 'ACTIVE' && <div className="admin-actions"><button type="button" className="admin-button admin-button-outline admin-button-warning" onClick={() => { if (window.confirm(`“${item.title}” təklifini deaktiv etmək istədiyinizə əminsiniz?`)) perform(() => adminBox(item.id)); }}><Ban size={15} /> Deaktiv et</button></div>}</div></article>)}</div> : <EmptyState title="Təklif tapılmadı" description="Başqa təklif və ya biznes adı ilə axtarın." />)}
          {section === 'complaints' && (filteredComplaints.length ? <div className="admin-records">{filteredComplaints.map(item => <article className="admin-record" key={item.id}><div className="admin-record-top"><div className="admin-avatar admin-avatar-complaint"><CircleHelp size={19} /></div><div className="admin-record-main"><div className="admin-record-title"><h3>{targetTypeName(item.targetType)}: {targetName(item)}</h3><span className={`admin-status ${item.status === 'OPEN' ? 'admin-status-pending' : 'admin-status-approved'}`}><span />{item.status === 'OPEN' ? 'Açıq' : 'Həll edilib'}</span></div><p className="admin-complaint-description">{item.description}</p><div className="admin-meta"><span>Göndərən: <strong>{getUserName(item.userId)}</strong></span><span>{formatDate(item.createdAt)}</span></div></div>{item.status === 'OPEN' && <div className="admin-actions"><button type="button" className="admin-button admin-button-outline" onClick={() => perform(() => resolveComplaint(item.id))}><CheckCircle2 size={15} /> Həll edildi</button></div>}</div></article>)}</div> : <EmptyState title="Şikayət tapılmadı" description="Başqa açar sözlə axtarmağa çalışın." />)}
        </section>}
        <div className="admin-footer"><span><BadgeCheck size={15} /> Dadbox idarəetmə paneli</span><span>Demo məlumatları · Real təhlükəsizlik üçün server yoxlaması tələb olunur</span></div>
      </div>
    </div>
  </main>;
}
