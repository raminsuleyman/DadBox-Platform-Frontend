import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowRight, Check, ChevronDown, Clock3, Leaf, MapPin, Search, ShoppingBag, SlidersHorizontal, Sparkles, Store, Wheat, Utensils, Apple, LayoutGrid } from 'lucide-react';
import { useApp } from '../store';
import BoxCard from '../components/BoxCard';
import { categories } from '../types';

const choices = [
  { label:'Hamısı', icon:LayoutGrid },
  { label:'Çörək və şirniyyat', icon:Wheat },
  { label:'Hazır yeməklər', icon:Utensils },
  { label:'Meyvə və tərəvəz', icon:Apple },
  { label:'Digər', icon:ShoppingBag },
];
export default function Home() {
  const {data} = useApp();
  const [clock,setClock] = useState(Date.now());
  useEffect(() => { const timer = setInterval(() => setClock(Date.now()), 30000); return () => clearInterval(timer); }, []);
  const [query,setQuery] = useState('');
  const [category,setCategory] = useState('Hamısı');
  const [sort,setSort] = useState('newest');
  const [price,setPrice] = useState('all');
  const [distance,setDistance] = useState('all');
  const [pickup,setPickup] = useState('all');
  const [quantity,setQuantity] = useState('all');
  const [showFilters,setShowFilters] = useState(false);
  const active = useMemo(() => data.boxes.filter(b => b.status==='ACTIVE' && b.quantity>0 && Date.parse(b.pickupEnd)>clock && data.businesses.some(x=>x.id===b.businessId && x.status==='APPROVED' && data.users.some(u=>u.id===x.ownerId && !u.suspended))), [data,clock]);
  const offers = useMemo(() => {
    const q=query.trim().toLocaleLowerCase('az');
    const result=active.filter(b=> {
      const business=data.businesses.find(x=>x.id===b.businessId);
      const hour=Number(new Intl.DateTimeFormat('en-GB',{hour:'2-digit',hour12:false,timeZone:'Asia/Baku'}).format(new Date(b.pickupStart)));
      return (!q || `${b.title} ${business?.name}`.toLocaleLowerCase('az').includes(q)) && (category==='Hamısı'||b.category===category) && (price==='all'||b.price<=Number(price)) && (distance==='all'||b.distance<=Number(distance)) && (quantity==='all'||b.quantity>=Number(quantity)) && (pickup==='all'||(pickup==='morning'&&hour<12)||(pickup==='day'&&hour>=12&&hour<18)||(pickup==='evening'&&hour>=18));
    });
    return result.sort((a,b)=>sort==='price-asc'?a.price-b.price:sort==='price-desc'?b.price-a.price:sort==='distance'?a.distance-b.distance:Date.parse(b.createdAt)-Date.parse(a.createdAt));
  },[active,data.businesses,query,category,sort,price,distance,pickup,quantity]);
  const clear = () => {setQuery('');setCategory('Hamısı');setSort('newest');setPrice('all');setDistance('all');setPickup('all');setQuantity('all');};
  return <>
    <section className="hero shell"><div className="hero-copy"><div className="eyebrow"><span className="eyebrow-dot"/> BAKIDA YENİ BİR DADLI VƏRDİŞ</div><h1>Yaxşı yeməyin<br/><em>ikinci şansı.</em></h1><p>Sevdiyin məkanlardan sürpriz qutuları kəşf et, daha az ödə və yaxşı yeməklərə dəyər ver.</p><div className="hero-actions"><a href="#teklifler" className="button primary">Qutuları kəşf et <ArrowRight size={17}/></a><Link to="/nece-isleyir" className="hero-text-link">Necə işləyir? <span>↗</span></Link></div><div className="hero-foot"><div className="hero-face"><Leaf size={17}/></div><div><strong>Kiçik seçim, böyük təsir.</strong><br/><span>Hər qutu daha az israf deməkdir.</span></div></div></div><div className="hero-visual"><img src="/images/hero.jpg" alt="Təzə bişmiş çörək və kruassanlar"/><div className="hero-photo-badge"><Sparkles size={18}/><span>Hər qutu<br/><strong>şirin bir sürpriz</strong></span></div><div className="hero-circle">YAXŞI YEMƏK · YAXŞI SEÇİM ·</div></div></section>
    <div className="impact-strip"><div className="shell impact-inner"><span><Leaf size={17}/> Daha az israf</span><span><ShoppingBag size={17}/> Daha sərfəli qiymətlər</span><span><Store size={17}/> Yerli bizneslərə dəstək</span><span className="impact-note">Birlikdə daha yaxşısı mümkündür <ArrowRight size={15}/></span></div></div>
    <section className="shell offers-section" id="teklifler"><div className="section-heading"><div><div className="eyebrow muted-eyebrow">YAXINLIĞINDA NƏ VAR?</div><h2>Bu günün fürsətləri<span className="period">.</span></h2><p>Yaxşı yeməklər səni gözləyir. Öz sürprizini seç.</p></div><span className="location-pill"><MapPin size={15}/> Bakı, Azərbaycan <ChevronDown size={14}/></span></div>
      <div className="category-row" aria-label="Kateqoriyalar">{choices.map(({label,icon:Icon})=><button key={label} className={`category-chip ${category===label?'selected':''}`} onClick={()=>setCategory(label)}><Icon size={16}/>{label}</button>)}</div>
      <div className="search-row"><label className="search-box"><Search size={19}/><span className="sr-only">Təklif və ya məkan axtar</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Məkan və ya qutu axtar..."/></label><button className={`filter-button ${showFilters?'filter-open':''}`} onClick={()=>setShowFilters(!showFilters)}><SlidersHorizontal size={17}/> Filtrlər <ChevronDown size={15}/></button><label className="sort-select"><span>Sırala:</span><select value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sıralama"><option value="newest">Ən yenilər</option><option value="price-asc">Qiymət: artan</option><option value="price-desc">Qiymət: azalan</option><option value="distance">Ən yaxın</option></select></label></div>
      {showFilters && <div className="filter-panel"><label>Kateqoriya<select value={category} onChange={e=>setCategory(e.target.value)}><option>Hamısı</option>{categories.map(c=><option key={c}>{c}</option>)}</select></label><label>Maksimum qiymət<select value={price} onChange={e=>setPrice(e.target.value)}><option value="all">Bütün qiymətlər</option><option value="5">5 ₼-dək</option><option value="8">8 ₼-dək</option><option value="10">10 ₼-dək</option><option value="15">15 ₼-dək</option></select></label><label>Maksimum məsafə<select value={distance} onChange={e=>setDistance(e.target.value)}><option value="all">Bütün məsafələr</option><option value="1">1 km</option><option value="2">2 km</option><option value="5">5 km</option></select></label><label>Götürmə vaxtı<select value={pickup} onChange={e=>setPickup(e.target.value)}><option value="all">Fərq etmir</option><option value="morning">Səhər · 00:00–12:00</option><option value="day">Günorta · 12:00–18:00</option><option value="evening">Axşam · 18:00–24:00</option></select></label><label>Mövcud qutu<select value={quantity} onChange={e=>setQuantity(e.target.value)}><option value="all">Ən azı 1</option><option value="2">Ən azı 2</option><option value="3">Ən azı 3</option><option value="5">Ən azı 5</option></select></label><button onClick={clear} className="clear-button">Filtrləri təmizlə</button><small>Məsafələr demo üçün Bakı mərkəzindən təxmini göstərilir.</small></div>}
      <div className="results-heading"><span><strong>{offers.length}</strong> dadlı fürsət tapıldı</span><span><span className="live-dot"/> Yalnız mövcud təkliflər</span></div>
      {offers.length ? <div className="box-grid">{offers.map(box=>{const business=data.businesses.find(b=>b.id===box.businessId)!;return <BoxCard key={box.id} box={box} business={business}/>})}</div> : <div className="empty-state"><Search size={27}/><h3>Uyğun qutu tapılmadı</h3><p>Axtarışı və ya filtrləri dəyişərək yenidən cəhd et.</p><button onClick={clear} className="button secondary">Filtrləri təmizlə</button></div>}
      <div className="under-grid"><span><Check size={15}/> Göstərilən bütün qutular rezervasiya üçün mövcuddur.</span><a href="#how">Bu necə işləyir? <ArrowDown size={15}/></a></div>
    </section>
    <section id="how" className="how-section"><div className="shell"><div className="how-heading"><div><div className="eyebrow muted-eyebrow">SADƏCƏ 3 ADDIM</div><h2>Yaxşılıq elə asandır.</h2></div><Link to="/nece-isleyir">Daha ətraflı <ArrowRight size={16}/></Link></div><div className="how-grid"><article><span className="step-number">01</span><div className="step-icon"><Search size={23}/></div><h3>Kəşf et</h3><p>Yaxınlığındakı məkanların sürpriz qutularına göz gəzdir.</p></article><article><span className="step-number">02</span><div className="step-icon"><ShoppingBag size={23}/></div><h3>Rezervasiya et</h3><p>Sevdiyin qutunu seç və bir neçə kliklə özün üçün ayır.</p></article><article><span className="step-number">03</span><div className="step-icon"><Clock3 size={23}/></div><h3>Get və götür</h3><p>Göstərilən vaxtda kodunu təqdim et və ödənişini yerində et.</p></article></div></div></section>
    <section className="shell partner-section"><div className="partner-image"><img src="/images/market.jpg" alt="Yerli ərzaq mağazasında alış-veriş"/></div><div className="partner-copy"><div className="eyebrow light-eyebrow">YERLİ BİZNESLƏR ÜÇÜN</div><h2>Yaxşı yeməklər<br/><em>boşa getməsin.</em></h2><p>Günün sonunda qalan keyfiyyətli məhsullarınızı yeni müştərilərlə tanış edin. Həm biznesiniz, həm də şəhərimiz qazansın.</p><Link to="/business" className="button light-button">Biznesini əlavə et <ArrowRight size={17}/></Link></div></section>
  </>;
}
