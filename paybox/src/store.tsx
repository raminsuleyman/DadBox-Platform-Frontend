import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { ActionResult, AppData, Box, Business, Role, Store, User } from './types';
import { createSeedData } from './mockData';

const DATA_KEY = 'paybox-demo-v1';
const USER_KEY = 'paybox-demo-user';
const ok = (message: string, id?: string): ActionResult => ({ ok: true, message, id });
const fail = (message: string): ActionResult => ({ ok: false, message });
const uid = () => globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2) + Date.now().toString(36);
const now = () => new Date().toISOString();
const money = (n: number) => Math.round(n * 100) / 100;
const defaultBoxOffsets: Record<string, { start: number; end: number; quantity: number }> = {
  box1: { start: -0.5, end: 3, quantity: 5 },
  box2: { start: 1, end: 5, quantity: 3 },
  box3: { start: 2, end: 7, quantity: 7 },
  box4: { start: 2, end: 6, quantity: 2 },
  box5: { start: 1, end: 8, quantity: 4 },
  box6: { start: 1, end: 9, quantity: 6 },
};
function loadData(): AppData {
  try {
    const saved = localStorage.getItem(DATA_KEY);
    if (!saved) return createSeedData();
    const parsed = JSON.parse(saved) as AppData;
    if (!parsed || !Array.isArray(parsed.boxes) || parsed.boxes.length === 0) return createSeedData();
    return parsed;
  } catch {
    return createSeedData();
  }
}
function expire(data: AppData): AppData {
  const timestamp = Date.now();
  const expired = new Set(data.boxes.filter(b => new Date(b.pickupEnd).getTime() <= timestamp).map(b => b.id));
  const hasExpiredReservations = data.reservations.some(r => expired.has(r.boxId) && ['PENDING','CONFIRMED'].includes(r.status));
  const hasExpiredActiveBoxes = data.boxes.some(b => b.status === 'ACTIVE' && new Date(b.pickupEnd).getTime() <= timestamp);

  if (!hasExpiredReservations && !hasExpiredActiveBoxes) return data;

  const nextReservations = hasExpiredReservations
    ? data.reservations.map(r => expired.has(r.boxId) && ['PENDING','CONFIRMED'].includes(r.status) ? { ...r, status: 'EXPIRED' as const } : r)
    : data.reservations;

  const nextBoxes = hasExpiredActiveBoxes
    ? data.boxes.map(b => {
        if (b.status === 'ACTIVE' && new Date(b.pickupEnd).getTime() <= timestamp) {
          const config = defaultBoxOffsets[b.id];
          if (config) {
            return {
              ...b,
              quantity: b.quantity <= 0 ? config.quantity : b.quantity,
              pickupStart: new Date(timestamp + config.start * 3600000).toISOString(),
              pickupEnd: new Date(timestamp + config.end * 3600000).toISOString(),
            };
          }
          const dur = Math.max(3600000, new Date(b.pickupEnd).getTime() - new Date(b.pickupStart).getTime());
          return {
            ...b,
            quantity: b.quantity <= 0 ? 1 : b.quantity,
            pickupStart: new Date(timestamp).toISOString(),
            pickupEnd: new Date(timestamp + dur).toISOString(),
          };
        }
        return b;
      })
    : data.boxes;

  return { ...data, boxes: nextBoxes, reservations: nextReservations };
}
const Context = createContext<Store | null>(null);
export function useApp(): Store { const value = useContext(Context); if (!value) throw new Error('Store provider missing'); return value; }

export function AppProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(() => expire(loadData()));
  const dataRef = useRef(data); dataRef.current = data;
  const [userId, setUserId] = useState<string | null>(() => localStorage.getItem(USER_KEY));
  const user = data.users.find(u => u.id === userId && !u.suspended) ?? null;
  const userRef = useRef(user); userRef.current = user;
  useEffect(() => { localStorage.setItem(DATA_KEY, JSON.stringify(data)); }, [data]);
  useEffect(() => { if (userId) localStorage.setItem(USER_KEY, userId); else localStorage.removeItem(USER_KEY); }, [userId]);
  useEffect(() => { if (typeof window === 'undefined') return; const sync = (event: StorageEvent) => { if (event.key === DATA_KEY && event.newValue) { try { const incoming = expire(JSON.parse(event.newValue) as AppData); dataRef.current = incoming; setData(incoming); } catch { /* Başqa tabdakı yanlış məlumatı nəzərə alma. */ } } }; window.addEventListener('storage', sync); return () => window.removeEventListener('storage', sync); }, []);
  useEffect(() => { const timer = setInterval(() => { const updated = expire(dataRef.current); if (updated !== dataRef.current) { dataRef.current = updated; setData(updated); } }, 30000); return () => clearInterval(timer); }, []);
  function commit(next: AppData) { dataRef.current = next; setData(next); }
  function activeUser(role?: Role): User | null { const current = userRef.current; return current && (!role || current.role === role) && !current.suspended ? current : null; }
  function ownedBusiness(id: string): Business | undefined { const u = activeUser('business'); return dataRef.current.businesses.find(b => b.id === id && b.ownerId === u?.id); }
  const store: Store = {
    data, user,
    login(email, password) { const u = dataRef.current.users.find(x => x.email.toLowerCase() === email.trim().toLowerCase()); if (!u || password.length < 6) return fail('Demo hesabı tapılmadı və ya şifrə ən azı 6 simvol deyil.'); if (u.suspended) return fail('Bu demo hesabı bloklanıb.'); setUserId(u.id); return ok('Demo hesaba daxil oldunuz.'); },
    register(name,email,password,role,phone='') { const cleanEmail = email.trim().toLowerCase(); if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) || password.length < 6) return fail('Ad, düzgün e-poçt və ən azı 6 simvollu demo şifrə daxil edin.'); if (dataRef.current.users.some(u => u.email.toLowerCase() === cleanEmail)) return fail('Bu e-poçt artıq mövcuddur.'); if (!['customer','business'].includes(role)) return fail('Rol yanlışdır.'); const u: User = {id:uid(),name:name.trim(),email:cleanEmail,phone:phone.trim(),role}; commit({...dataRef.current,users:[...dataRef.current.users,u]}); setUserId(u.id); return ok('Demo hesab yaradıldı.',u.id); },
    logout() { setUserId(null); },
    switchDemo(role) { const u = dataRef.current.users.find(x => x.id === ({customer:'u-customer',business:'u-business',admin:'u-admin'} as const)[role]); if (u && !u.suspended) setUserId(u.id); },
    updateProfile(patch) { const u = activeUser(); if (!u) return fail('Əvvəlcə daxil olun.'); if (!patch.name.trim()) return fail('Ad boş ola bilməz.'); commit({...dataRef.current,users:dataRef.current.users.map(x => x.id === u.id ? {...x,name:patch.name.trim(),phone:patch.phone.trim()} : x)}); return ok('Profil yeniləndi.'); },
    createBusiness(input) { const u = activeUser('business'); if (!u) return fail('Yalnız biznes hesabı müraciət edə bilər.'); if (!input.name.trim() || !input.address.trim() || !input.phone.trim()) return fail('Biznesin adı, ünvanı və telefonu vacibdir.'); const b: Business = {...input,id:uid(),ownerId:u.id,status:'PENDING',rating:0,reviewCount:0,createdAt:now()}; commit({...dataRef.current,businesses:[...dataRef.current.businesses,b]}); return ok('Müraciət baxılmaq üçün göndərildi.',b.id); },
    updateBusiness(id,patch) { const b = ownedBusiness(id); if (!b) return fail('Bu biznesi dəyişmək icazəniz yoxdur.'); const {name,description,address,phone,category,lat,lng,image,verificationInfo} = patch; const next = { ...b, name:name ?? b.name, description:description ?? b.description, address:address ?? b.address, phone:phone ?? b.phone, category:category ?? b.category, lat:lat ?? b.lat, lng:lng ?? b.lng, image:image ?? b.image, verificationInfo:verificationInfo ?? b.verificationInfo }; if (!next.name.trim() || !next.address.trim()) return fail('Ad və ünvan vacibdir.'); commit({...dataRef.current,businesses:dataRef.current.businesses.map(x=>x.id===id?next:x)}); return ok('Biznes məlumatları yeniləndi.'); },
    applyBusiness(id) { const b = ownedBusiness(id); if (!b) return fail('Biznes tapılmadı.'); if (b.status === 'APPROVED') return fail('Biznes artıq təsdiqlənib.'); commit({...dataRef.current,businesses:dataRef.current.businesses.map(x=>x.id===id?{...x,status:'PENDING',rejectionReason:undefined}:x)}); return ok('Müraciət yenidən göndərildi.'); },
    saveBox(input,businessId) { const b = ownedBusiness(businessId); if (!b || b.status !== 'APPROVED') return fail('Yalnız təsdiqlənmiş biznes qutu yarada və ya dəyişə bilər.'); const existing = input.id ? dataRef.current.boxes.find(x=>x.id===input.id && x.businessId===b.id) : undefined; if (input.id && !existing) return fail('Təklif tapılmadı.'); if (existing && dataRef.current.reservations.some(r => r.boxId === existing.id)) { const changed = input.title !== existing.title || input.description !== existing.description || input.category !== existing.category || input.price !== existing.price || input.originalPrice !== existing.originalPrice || Math.floor(Date.parse(input.pickupStart)/60000) !== Math.floor(Date.parse(existing.pickupStart)/60000) || Math.floor(Date.parse(input.pickupEnd)/60000) !== Math.floor(Date.parse(existing.pickupEnd)/60000) || input.status !== existing.status || JSON.stringify(input.allergens) !== JSON.stringify(existing.allergens); if (changed) return fail('Rezervasiya tarixçəsi olan təklifdə yalnız mövcud say və şəkil dəyişdirilə bilər.'); } if (!input.title.trim() || !input.description.trim() || !input.image.trim()) return fail('Başlıq, təsvir və şəkil vacibdir.'); if (!Number.isFinite(input.originalPrice) || !Number.isFinite(input.price) || input.price <= 0 || input.price >= input.originalPrice) return fail('Endirimli qiymət sıfırdan böyük və ilkin qiymətdən aşağı olmalıdır.'); if (!Number.isInteger(input.quantity) || input.quantity < 0) return fail('Say mənfi olmayan tam ədəd olmalıdır.'); if (!Number.isFinite(Date.parse(input.pickupStart)) || !Number.isFinite(Date.parse(input.pickupEnd)) || Date.parse(input.pickupStart) >= Date.parse(input.pickupEnd) || Date.parse(input.pickupEnd) <= Date.now()) return fail('Götürmə saatlarını düzgün daxil edin.'); const {id:unused,...fields}=input; void unused; const box: Box = {...fields,id:existing?.id??uid(),businessId:b.id,createdAt:existing?.createdAt??now(),distance:existing?.distance??1.5,price:money(input.price),originalPrice:money(input.originalPrice)}; commit({...dataRef.current,boxes:existing?dataRef.current.boxes.map(x=>x.id===box.id?box:x):[box,...dataRef.current.boxes]}); return ok(existing?'Təklif yeniləndi.':'Təklif yaradıldı.',box.id); },
    deactivateBox(id) { const b = dataRef.current.boxes.find(x=>x.id===id); if (!b || !ownedBusiness(b.businessId)) return fail('Təklif tapılmadı və ya icazəniz yoxdur.'); commit({...dataRef.current,boxes:dataRef.current.boxes.map(x=>x.id===id?{...x,status:'INACTIVE'}:x)}); return ok('Təklif deaktiv edildi.'); },
    reserve(boxId,quantity) { const u = activeUser('customer'); if (!u) return fail('Rezervasiya üçün müştəri hesabına daxil olun.'); const box = dataRef.current.boxes.find(b=>b.id===boxId); const business = dataRef.current.businesses.find(b=>b.id===box?.businessId); const owner = dataRef.current.users.find(u=>u.id===business?.ownerId); if (!box || box.status!=='ACTIVE' || business?.status!=='APPROVED' || !owner || owner.suspended || Date.parse(box.pickupEnd)<=Date.now()) return fail('Bu təklif artıq mövcud deyil.'); if (!Number.isInteger(quantity) || quantity<1 || quantity>box.quantity) return fail('Seçilən miqdar mövcud deyil.'); const id = uid(); const code = 'PB-' + Math.random().toString(36).slice(2,8).toUpperCase(); commit({...dataRef.current,boxes:dataRef.current.boxes.map(x=>x.id===boxId?{...x,quantity:x.quantity-quantity}:x),reservations:[{id,boxId,businessId:box.businessId,customerId:u.id,quantity,totalPrice:money(box.price*quantity),status:'PENDING',code,createdAt:now()},...dataRef.current.reservations]}); return ok('Rezervasiya yaradıldı. Ödənişi götürərkən edin.',id); },
    cancelReservation(id) { const u=activeUser('customer'); const r=dataRef.current.reservations.find(x=>x.id===id && x.customerId===u?.id); const box=dataRef.current.boxes.find(x=>x.id===r?.boxId); if (!r || !box) return fail('Sifariş tapılmadı.'); if (!['PENDING','CONFIRMED'].includes(r.status) || Date.parse(box.pickupStart)<=Date.now()) return fail('Yalnız götürmə vaxtı başlamamış aktiv sifarişlər ləğv edilə bilər.'); commit({...dataRef.current,boxes:dataRef.current.boxes.map(x=>x.id===box.id && Date.parse(x.pickupEnd)>Date.now()?{...x,quantity:x.quantity+r.quantity}:x),reservations:dataRef.current.reservations.map(x=>x.id===id?{...x,status:'CANCELLED'}:x)}); return ok('Rezervasiya ləğv edildi.'); },
    updateReservation(id,action,code) { const r=dataRef.current.reservations.find(x=>x.id===id); if (!r || !ownedBusiness(r.businessId)) return fail('Sifariş tapılmadı və ya icazəniz yoxdur.'); const box=dataRef.current.boxes.find(x=>x.id===r.boxId); if (!box || Date.parse(box.pickupEnd)<=Date.now()) return fail('Götürmə müddəti bitib.'); if (action==='confirm' && r.status!=='PENDING') return fail('Yalnız gözləyən sifariş təsdiqlənə bilər.'); if (action==='pickup' && Date.parse(box.pickupStart)>Date.now()) return fail('Götürmə vaxtı hələ başlamayıb.'); if (action==='pickup' && (r.status!=='CONFIRMED' || code?.trim().toUpperCase()!==r.code.toUpperCase())) return fail('Sifariş təsdiqlənməyib və ya kod yanlışdır.'); commit({...dataRef.current,reservations:dataRef.current.reservations.map(x=>x.id===id?{...x,status:action==='confirm'?'CONFIRMED':'PICKED_UP'}:x)}); return ok(action==='confirm'?'Sifariş təsdiqləndi.':'Götürülmə təsdiqləndi.'); },
    addReview(reservationId,rating,comment) { const u=activeUser('customer'); const r=dataRef.current.reservations.find(x=>x.id===reservationId&&x.customerId===u?.id); if (!r || r.status!=='PICKED_UP') return fail('Yalnız götürülmüş sifarişə rəy yazmaq olar.'); if (dataRef.current.reviews.some(x=>x.reservationId===reservationId)) return fail('Bu sifariş artıq qiymətləndirilib.'); if (!Number.isInteger(rating)||rating<1||rating>5) return fail('Qiymət 1–5 arası olmalıdır.'); commit({...dataRef.current,businesses:dataRef.current.businesses.map(b => b.id===r.businessId ? {...b, rating:Math.round(((b.rating*b.reviewCount+rating)/(b.reviewCount+1))*10)/10, reviewCount:b.reviewCount+1} : b), reviews:[...dataRef.current.reviews,{id:uid(),reservationId,businessId:r.businessId,customerId:u!.id,rating,comment:comment.trim(),createdAt:now()}]}); return ok('Rəyiniz əlavə edildi.'); },
    addComplaint(targetType,targetId,description) { const u=activeUser(); if (!u) return fail('Əvvəlcə daxil olun.'); if (description.trim().length<10) return fail('Şikayət ən azı 10 simvol olmalıdır.'); commit({...dataRef.current,complaints:[...dataRef.current.complaints,{id:uid(),userId:u.id,targetType,targetId,description:description.trim(),status:'OPEN',createdAt:now()}]}); return ok('Şikayət göndərildi.'); },
    adminBusiness(id,status,reason) { if (!activeUser('admin')) return fail('İcazəniz yoxdur.'); const b=dataRef.current.businesses.find(x=>x.id===id); if (!b || b.status!=='PENDING') return fail('Yalnız gözləyən müraciətə baxmaq olar.'); if (status==='REJECTED'&&!reason?.trim()) return fail('Rədd səbəbini daxil edin.'); commit({...dataRef.current,businesses:dataRef.current.businesses.map(x=>x.id===id?{...x,status,rejectionReason:status==='REJECTED'?reason:undefined}:x)}); return ok(status==='APPROVED'?'Biznes təsdiqləndi.':'Müraciət rədd edildi.'); },
    adminUser(id,suspended) { const admin=activeUser('admin'); if (!admin) return fail('İcazəniz yoxdur.'); if (id===admin.id) return fail('Öz hesabınızı bloklaya bilməzsiniz.'); if (!dataRef.current.users.some(x=>x.id===id)) return fail('İstifadəçi tapılmadı.'); commit({...dataRef.current,users:dataRef.current.users.map(x=>x.id===id?{...x,suspended}:x)}); return ok(suspended?'İstifadəçi bloklandı.':'İstifadəçi aktivləşdirildi.'); },
    adminBox(id) { if (!activeUser('admin')) return fail('İcazəniz yoxdur.'); if (!dataRef.current.boxes.some(x=>x.id===id)) return fail('Təklif tapılmadı.'); commit({...dataRef.current,boxes:dataRef.current.boxes.map(x=>x.id===id?{...x,status:'INACTIVE'}:x)}); return ok('Təklif deaktiv edildi.'); },
    resolveComplaint(id) { if (!activeUser('admin')) return fail('İcazəniz yoxdur.'); if (!dataRef.current.complaints.some(x=>x.id===id)) return fail('Şikayət tapılmadı.'); commit({...dataRef.current,complaints:dataRef.current.complaints.map(x=>x.id===id?{...x,status:'RESOLVED'}:x)}); return ok('Şikayət həll edilmiş kimi işarələndi.'); },
    resetDemo() { commit(createSeedData()); setUserId(null); },
  };
  return <Context.Provider value={store}>{children}</Context.Provider>;
}
