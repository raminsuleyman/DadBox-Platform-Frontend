import type { AppData, Box, Business, User } from './types';

const now = new Date();
const fromNow = (hours: number) => new Date(now.getTime() + hours * 3600000).toISOString();
const ago = (days: number) => new Date(now.getTime() - days * 86400000).toISOString();

export const demoUsers: User[] = [
  { id: 'u-customer', name: 'Aysel Məmmədova', email: 'musteri@paybox.az', phone: '+994 50 123 45 67', role: 'customer' },
  { id: 'u-business', name: 'Leyla Əliyeva', email: 'biznes@paybox.az', phone: '+994 50 222 33 44', role: 'business' },
  { id: 'u-business-2', name: 'Rəşad Həsənov', email: 'merkez@paybox.az', phone: '+994 55 333 44 55', role: 'business' },
  { id: 'u-admin', name: 'Dadbox Admin', email: 'admin@paybox.az', phone: '', role: 'admin' },
];
const businesses: Business[] = [
  { id:'b1', ownerId:'u-business', name:'Baku Bakehouse', category:'Çörək evi', description:'Hər gün sevgi ilə hazırlanan təzə çörəklər, kruassanlar və şirniyyatlar.', address:'Nizami küçəsi 96, Səbail, Bakı', phone:'+994 50 222 33 44', lat:40.3733, lng:49.8428, status:'APPROVED', image:'/images/bakery.jpg', rating:4.9, reviewCount:128, createdAt:ago(40) },
  { id:'b2', ownerId:'u-business-2', name:'Yaşıl Mətbəx', category:'Restoran', description:'Mövsümi məhsullarla hazırlanan rəngarəng və doyumlu yeməklər.', address:'Əhməd Cavad küçəsi 14, Bakı', phone:'+994 55 333 44 55', lat:40.3694, lng:49.8362, status:'APPROVED', image:'/images/bowl.jpg', rating:4.8, reviewCount:94, createdAt:ago(28) },
  { id:'b3', ownerId:'u-business-2', name:'Günəş Market', category:'Market', description:'Qonşuluğunuzdakı təzə meyvə və tərəvəzlər.', address:'Füzuli küçəsi 51, Nəsimi, Bakı', phone:'+994 55 333 44 55', lat:40.3822, lng:49.8422, status:'APPROVED', image:'/images/grocery.jpg', rating:4.7, reviewCount:73, createdAt:ago(23) },
  { id:'b4', ownerId:'u-business', name:'Şirin Künc', category:'Kafe', description:'Gündəlik hazırlanan şirniyyatlar və gözəl anlar.', address:'Xaqani küçəsi 23, Səbail, Bakı', phone:'+994 50 222 33 44', lat:40.3720, lng:49.8471, status:'APPROVED', image:'/images/dessert.jpg', rating:4.9, reviewCount:56, createdAt:ago(15) },
  { id:'b5', ownerId:'u-business-2', name:'Səhər Bistro', category:'Kafe', description:'Yeni məhəllə bistrosu.', address:'Zərifə Əliyeva küçəsi 18, Bakı', phone:'+994 55 333 44 55', lat:40.372, lng:49.84, status:'PENDING', image:'/images/hero.jpg', rating:0, reviewCount:0, createdAt:ago(1) },
];
const boxes: Box[] = [
  {id:'box1',businessId:'b1',title:'Günün çörək səbəti',description:'Gündəlik hazırlanan çörək, kruassan və seçilmiş bişirmələrdən ibarət sürpriz qutu. Hər qutunun tərkibi günə görə dəyişir.',category:'Çörək və şirniyyat',originalPrice:18,price:6.9,quantity:5,pickupStart:fromNow(-0.5),pickupEnd:fromNow(3),image:'/images/bakery.jpg',allergens:['Qluten','Süd','Yumurta'],status:'ACTIVE',createdAt:ago(1),distance:0.8},
  {id:'box2',businessId:'b2',title:'Rəngli nahar qutusu',description:'Mövsümi tərəvəzlər və günün isti yeməkləri ilə dolu sürpriz nahar.',category:'Hazır yeməklər',originalPrice:21,price:8.5,quantity:3,pickupStart:fromNow(1),pickupEnd:fromNow(5),image:'/images/bowl.jpg',allergens:['Süd','Küncüt'],status:'ACTIVE',createdAt:ago(0.5),distance:1.2},
  {id:'box3',businessId:'b3',title:'Mövsümün təzə seçimi',description:'Mövsümə uyğun seçilmiş müxtəlif meyvə və tərəvəzlərdən ibarət qutu.',category:'Meyvə və tərəvəz',originalPrice:16,price:5.5,quantity:7,pickupStart:fromNow(2),pickupEnd:fromNow(7),image:'/images/grocery.jpg',allergens:[],status:'ACTIVE',createdAt:ago(0.2),distance:2.4},
  {id:'box4',businessId:'b4',title:'Şirin sürpriz qutusu',description:'Günün seçilmiş şirniyyat və bişirmələrindən ləzzətli bir qarışıq.',category:'Çörək və şirniyyat',originalPrice:22,price:7.9,quantity:2,pickupStart:fromNow(2),pickupEnd:fromNow(6),image:'/images/dessert.jpg',allergens:['Qluten','Süd','Yumurta','Qoz-fındıq'],status:'ACTIVE',createdAt:ago(0.3),distance:1.6},
  {id:'box5',businessId:'b2',title:'Günün ləzzətləri',description:'Günün menyusundan seçilmiş, dadlı və doyumlu yeməklər.',category:'Hazır yeməklər',originalPrice:17,price:6.5,quantity:4,pickupStart:fromNow(1),pickupEnd:fromNow(8),image:'/images/bowl.jpg',allergens:['Süd'],status:'ACTIVE',createdAt:ago(0.1),distance:1.2},
  {id:'box6',businessId:'b1',title:'Kruassan və qəhvə yanı',description:'Gün ərzində bişirilmiş şirin və duzlu xəmirlərdən sürpriz seçim.',category:'Çörək və şirniyyat',originalPrice:14,price:4.9,quantity:6,pickupStart:fromNow(1),pickupEnd:fromNow(9),image:'/images/hero.jpg',allergens:['Qluten','Süd'],status:'ACTIVE',createdAt:ago(0.05),distance:0.8},
];

export const createSeedData = (): AppData => {
  const offset = Date.now() - now.getTime();
  const fresh = (value: string) => new Date(Date.parse(value) + offset).toISOString();
  return {
  users: structuredClone(demoUsers),
  businesses: structuredClone(businesses).map(b => ({ ...b, createdAt: fresh(b.createdAt) })),
  boxes: structuredClone(boxes).map(b => ({ ...b, createdAt: fresh(b.createdAt), pickupStart: fresh(b.pickupStart), pickupEnd: fresh(b.pickupEnd) })),
  reservations: [
    {id:'r1',boxId:'box1',businessId:'b1',customerId:'u-customer',quantity:1,totalPrice:6.9,status:'CONFIRMED',code:'PB-4826',createdAt:fresh(ago(0.05))},
    {id:'r2',boxId:'box4',businessId:'b4',customerId:'u-customer',quantity:1,totalPrice:7.9,status:'PICKED_UP',code:'PB-1938',createdAt:fresh(ago(2))},
    {id:'r3',boxId:'box1',businessId:'b1',customerId:'u-customer',quantity:1,totalPrice:6.9,status:'PENDING',code:'PB-7192',createdAt:fresh(ago(0.01))},
  ],
  reviews: [],
  complaints: [{id:'c1',userId:'u-customer',targetType:'business',targetId:'b1',description:'Götürmə saatları ilə bağlı məlumatı dəqiqləşdirmək istəyirəm.',status:'OPEN',createdAt:fresh(ago(1))}],
  };
};
