# Backend tətbiq təlimatı: Surprise Box marketplace

**Status:** təklif edilən dizayn və implementasiya planı; işlək backendin, verilənlər bazasının və ya yerləşdirmənin mövcud olduğu iddia edilmir.  
**Mənbə:** `ORIGINAL_PRD_TRD.md`, PRD 1.0 və TRD 2.0.  
**Əhatə:** Azərbaycan dilində React/Vite/TypeScript frontend; hazırkı localStorage əsaslı mock vəziyyətindən Node.js/Express/TypeScript və Supabase PostgreSQL/Auth/Storage sisteminə keçid.

> **MVP-də onlayn ödəniş yoxdur.** Rezervasiya ödəniş əməliyyatı deyil; ödəniş tərəflərin razılığı ilə məhsul götürüləndə şəxsən edilir. Bu sənəddə payment intent, kart məlumatı, tranzaksiya və ya avtomatik refund yoxdur. Göstərilən məbləğlər faktiki ödənişin sübutu deyil.

## 1. Məhsul qərarları və açıq fərziyyələr

Aşağıdakı seçimlər PRD-də dəqiq müəyyən edilməmiş davranışları implementasiya edilə bilən hala gətirir; pilotdan əvvəl məhsul sahibi təsdiqləməlidir:

1. Bir hesab bir neçə biznesin sahibi ola bilər. Yeni profil `CUSTOMER` olur; ilk biznes yaratma əməliyyatı onu `BUSINESS_OWNER` edir. `BUSINESS_OWNER` həm də müştəri əməliyyatlarını edə bilər; yalnız ayrıca təyin olunmuş `ADMIN` idarəetmə funksiyalarına sahibdir. Admin öz-özünə təyin edilə bilməz.
2. Biznes əvvəl `DRAFT`, sonra `PENDING`, təsdiqlənəndə `APPROVED`, rədd ediləndə `REJECTED` olur. `SUSPENDED` yalnız əvvəllər təsdiqlənmiş biznesə tətbiq edilir. Rədd olunmuş müraciət düzəldilib yenidən təqdim edilə bilər. Eyni biznesin ən çox bir açıq müraciəti vardır.
3. Yeni rezervasiya dərhal `CONFIRMED` olur və ehtiyat dərhal tutulur. `PENDING` statusu və təsdiq endpointi əvvəlki etibarlı rezervasiyalar/future workflow üçün saxlanılır; hazırkı yaratma API-si `PENDING` yaratmır. `PENDING` də ehtiyatı tutulmuş deməkdir, təsdiq zamanı ikinci dəfə azaltmaq olmaz.
4. Müştəri yalnız götürmə başlanana qədər (`now < pickupStart`), biznes sahibi isə təhlükəsizlik və ya operativ səbəbə görə götürmə bitənədək (`now < pickupEnd`) ləğv edə bilər. Dəqiq başlanğıc anında müştəri ləğvi bağlıdır. Biznes tərəfindən ləğvdə səbəb məcburidir. Vaxtlar üçün aşağıdakı tranzaksiya qaydaları etibarlıdır.
5. Götürməni yalnız rezervasiyanın aid olduğu biznesin aktiv sahibi, müştərinin verdiyi birdəfəlik kodla, `pickupStart <= now < pickupEnd` aralığında təsdiqləyir. Müştərinin özünün qeyd etməsi kifayət deyil. QR gələcək funksiyadır; MVP-də mətn kodu var.
6. Təklif ayrıca təkrarlanan şablon deyil: bir götürmə intervalına aid konkret elandır. Mövcud rezervasiyaları olan təklifin kommersiya və götürmə məlumatları dəyişdirilmir; lazım olsa yeni təklif yaradılır. Deaktivasiya köhnə rezervasiyaları avtomatik ləğv etmir.
7. Qiymətlər qəpiklə tam ədəddir, valyuta sabit `AZN`-dir. Statistika rezervasiya üzrə qiymət snapshot-ına əsaslanır; heç bir yerdə «ödənildi» kimi təqdim edilmir.
8. Qida çəkisi daxil edilmirsə, «xilas edilmiş qida» dəqiq kiloqram kimi göstərilmir. MVP göstəricisi götürülmüş qutu sayıdır.
9. Rəylər və şikayətlər PRD-də `Should Have` olsa da, aşağıdakı müqavilədə nəzərdə tutulur; buraxılış prioriteti ayrılıqda seçilə bilər. Bildirişlər təklif olunan transactional outbox üzərindən əlavə edilir, rezervasiyanın uğuru e-poçtun çatmasından asılı deyil.

## 2. Arxitektura və etibar sərhədləri

```text
React / Vite TS
 ├── Supabase Auth JS ───────────> Supabase Auth (yalnız identity/session)
 └── HTTPS Bearer ───────────────> Express /api/v1
                                     ├── Zod → auth → rol/sahiblik → service
                                     ├── PostgreSQL RPC/tranzaksiyalar → Supabase Postgres
                                     ├── Server-side Storage client → Supabase Storage
                                     └── outbox → ayrıca worker → e-poçt provayderi
```

- Frontend məlumat giriş nöqtəsi Express-dir. Frontend yalnız Supabase Auth-a birbaşa müraciət edir; rezervasiya, stok, admin, profil və media üzərində birbaşa PostgREST/Storage yazması etmir.
- Express modulları: `config`, `auth`, `profiles`, `businesses`, `applications`, `boxes`, `reservations`, `reviews`, `complaints`, `admin`, `uploads`, `dashboard`, `jobs`, `common` (`errors`, `pagination`, `validation`, `logging`). Controller HTTP ilə məhdudlaşır; service səlahiyyət və biznes qaydalarını yoxlayır; repository/RPC məlumatları idarə edir.
- Hər qorunan sorğuda `Authorization: Bearer <supabase-access-token>`. Supabase-in etibarlı `getUser(token)` yoxlaması və ya provayderin JWKS açarları ilə imza, `iss`, `aud`, `exp` yoxlaması istifadə edilir; sadəcə JWT payload-ını decode etmək yetərli deyil. `sub` yeganə actor ID-dir, body-də gələn `userId`, `role`, `ownerId` etibar edilmir. Doğrulanmış e-poçt tələbi üçün `getUser`-dan cari `email_confirmed_at` alınır.
- Rol və `ACTIVE/SUSPENDED` vəziyyəti hər qorunan sorğuda serverin etibarlı `profiles` məlumatından yoxlanır; istifadəçinin dəyişə bildiyi metadata və ya köhnə JWT rol claim-i istifadə edilmir. Suspend tətbiqindən sonra köhnə tokenlə növbəti qorunan sorğu `403` qaytarır. Həssas yazılarda DB tranzaksiyası profili yenidən kilidləyib yoxlayır; bu, yoxlama ilə yazı arasındakı yarışı bağlayır.
- Təklif edilən sadə server bağlantısı: Supabase server client-in `service_role`/secret açarı yalnız Express-in server tərəfində saxlanılır. **Bu açar RLS-i bypass edir:** bütün repository sorğularında actor/sahiblik/status yoxlaması və xüsusi açıq DTO seçimi məcburidir. Bypass edən açar heç vaxt browser-ə, loga və ya URL-ə daxil edilmir. İmkan olduqda yalnız konkret funksiyalara icra hüququ olan ayrıca, login-i məhdud backend DB rolu daha məqsədəuyğundur.
- Müdafiənin ikinci qatı kimi bütün domen cədvəllərində RLS aktivdir və bu MVP-də `anon`/`authenticated` üçün domen cədvəllərinin birbaşa SELECT/INSERT/UPDATE/DELETE hüquqları və yazma RPC hüquqları ləğv edilir; heç bir müsbət policy yoxdursa RLS default-deny tətbiq edir. Public oxunuş Express vasitəsilə və yalnız açıq DTO ilə verilir. Auth-un öz endpointləri və öz cədvəlləri Supabase tərəfindən idarə edilir. Sonradan client-scoped oxu lazım olsa, yalnız açıq sütunlardan ibarət məhdud view, müvafiq grant/RLS və testlə ayrıca açılmalıdır; RLS tətbiq məntiqinin əvəzi deyil.
- `SECURITY DEFINER` funksiyaları məhdud no-login sahibə məxsus olmalı, sabit təhlükəsiz `search_path` istifadə etməli, obyektləri schema ilə göstərməli, `EXECUTE` hüququ `PUBLIC`, `anon`, `authenticated`-dan alınmalı, yalnız backend roluna verilməlidir. Actor parametri yalnız tokeni doğrulamış Express tərəfindən ötürülür. Service role ilə bütün əməliyyatları açıq generic RPC-ə çevirməyin.
- Konkret tətbiq seçimi: `private` schema PostgREST vasitəsilə expose edilmir. Express-in ayrıca məhdud DB login-i və connection pool-u yalnız seçilmiş `private` tranzaksiya entrypoint-lərini parametrli SQL ilə çağırır: məsələn `SELECT private.create_reservation($1,$2,$3,$4,$5)`. Login-ə `USAGE ON SCHEMA private` və yalnız bu entrypoint-lərə `EXECUTE` verilir, domen cədvəllərinə və daxili helper-lərə birbaşa hüquq verilmir. Definer sahibi no-login roldur; işlədiyi domen cədvəllərinin sahibi olaraq `FORCE ROW LEVEL SECURITY` aktiv edilmədikdə owner bypass ilə işləyir və lazımi Vault secret-lərini oxumaq hüququna malikdir. Bu bypass yalnız nəzərdən keçirilmiş funksiyalarda mümkündür; `anon` və `authenticated` üçün RLS yenə qüvvədədir. Sahibliyin/migration rolunun qurulması və davranış inteqrasiya testində yoxlanır. Server-side Supabase client digər zəruri oxu/idarəetmə və Storage işləri üçündür. `private` funksiyasını sadəcə `.rpc()` ilə çağırmaq üçün schema-nı internetə açmayın.
- SQL migration-lar versiyalanır; service key və ya DB parolu repository-yə və `VITE_` dəyişənlərinə qoyulmur. DB funksiyaları ilə Express eyni təhlükəsizlik yoxlamalarını mümkün qədər ikiqat tətbiq edir.

## 3. Auth provayder əməliyyatları və rol həyatı

İctimai `VITE_SUPABASE_URL` və publishable/anon key ilə `@supabase/supabase-js` client yalnız Auth üçün qurulur. Əməliyyatlar Express endpointi deyil:

| İstifadəçi hərəkəti | Frontend provayder çağırışı və müqavilə |
|---|---|
| Qeydiyyat | `supabase.auth.signUp({ email, password, options: { emailRedirectTo } })`. Təsdiq tələb olunarsa `user` ola bilər, `session` isə `null` ola bilər; UI təsdiq məktubu mesajını göstərir. `role` metadata-sı göndərilsə belə ona etibar edilmir. |
| Giriş | `signInWithPassword({ email, password })` → Supabase `data.user`, `data.session`; access token ilə Express çağırılır. |
| E-poçtun təsdiqi | Təsdiq linkinin allowlist edilmiş frontend callback ünvanında PKCE flow üçün `exchangeCodeForSession(code)`; digər Supabase təsdiq link növləri istifadə edilirsə provayderin `verifyOtp` parametrləri həmin flow-a uyğun ayrıca tətbiq olunur. Callback token və kodları loglamır. |
| Sessiya yenilənməsi | Supabase client refresh token rotasiyasını idarə edir; `onAuthStateChange` ilə UI yenilənir; hər API sorğusunda ən son access token istifadə edilir. |
| Çıxış | `signOut()` və client cache-in təmizlənməsi; Express-də ayrıca logout endpointi yoxdur. Provider xətası olduqda istifadəçiyə bildirin; local cache-in silinməsi server tərəfdə revoke edildiyi mənasına gəlmir. |
| Parolun bərpası | `resetPasswordForEmail(email, { redirectTo })`, allowlist edilmiş recovery callback, PKCE-də `exchangeCodeForSession(code)`, sonra `updateUser({ password })`. Cavablar mümkün qədər hesabın mövcudluğunu açıqlamayan ümumi mətnlə göstərilir; provayderin anti-enumeration/rate-limit sazlamaları yoxlanır. |

Frontend-də parol tətbiq cədvəlində və ya ayrıca localStorage mock profilində saxlanmır. Supabase client-in browserdə persist edilən session seçimi XSS riskidir: default saxlama seçilərsə ciddi CSP, input sanitizasiyası və üçüncü tərəf skriptlərinin məhdudlaşdırılması tətbiq edin; daha sərt deployment üçün server-tərəfli `HttpOnly; Secure; SameSite` BFF sessiyası ayrıca dizayn tələb edir. Heç bir secret və service key frontendə verilməz.

`auth.users` üçün təhlükəsiz DB triggeri yalnız `id`, `full_name` kimi məhdud inputdan `profiles` yaradır; ad göndərilməyibsə və ya etibarlı deyilsə ilkin ad `İstifadəçi` olur və sonra profil vasitəsilə dəyişdirilə bilər. Rol həmişə `CUSTOMER`, status `ACTIVE` başlanır, trigger müvəffəqiyyətsizliyi signup-ı rollback edir. Qeydiyyat UI-si email üçün `1..254` simvolluq provayderə uyğun format və yeni parol üçün `8..72` UTF-8 bayt tətbiq edir; Auth provayderində ən az 8 simvol və mövcud təhlükəsiz parol siyasəti konfiqurasiya edilir, parol kəsilmir. Giriş mövcud istifadəçilər üçün provayderin yoxlamasına tabedir. Admin ilk dəfə deployment/operator tərəfindən təhlükəsiz server-side migration və ya idarəetmə əməliyyatı ilə provision edilir; istifadəçi qeydiyyatı və `PATCH /users/me` rolları dəyişə bilməz. Biznes yaratma və rolun `BUSINESS_OWNER` edilməsi eyni tranzaksiyadadır. Öz profil adı dəyişmək istisna olmaqla, bütün yazma əməliyyatları təsdiqlənmiş e-poçt tələb edir.

## 4. Ümumi REST müqaviləsi

**Base:** `/api/v1`; nümunə `https://api.example.az/api/v1/boxes`. JSON request/response `Content-Type: application/json; charset=utf-8`; upload istisna olaraq multipart-dır. Tarixlər ISO 8601 offset-li qəbul edilir (`2026-12-01T18:00:00+04:00`); cavab UTC-də `Z`-lə verilir. Saat qurşağı göstərilməyən tarix rədd edilir. Müqayisələr PostgreSQL `timestamptz` instants ilə aparılır; UI `Asia/Baku` ilə göstərir. UI-də yerli tarix/saat seçiləndə Asia/Baku zonasını istifadə edib offset-li instanta çevirin; serverin lokal saatına etibar etməyin.

- Bütün ID-lər UUID-dir; bütün obyektlər camelCase JSON istifadə edir; bazada snake_case. `PATCH`-də yalnız verilən icazəli sahələr dəyişir; nullable deyilən sahədə explicit `null` silmək, sahəni ötürməmək dəyişdirməməkdir. Boş body, naməlum və server-idarəli sahələr `422`-dir. `POST` body-sində də naməlum sahələr rədd edilir.
- Pul `originalPriceMinor`, `discountedPriceMinor`, `unitPriceMinor`, `totalPriceMinor` kimi integer qəpikdir; `100` = `1.00 AZN`. `currency` həmişə `AZN`, server tərəfindən təyin edilir. `bigint` DB və JS təhlükəsiz integer hədləri yoxlanır; MVP limitləri aşağıdadır. Float pul qəbul edilmir.
- `GET` və uğurlu yeniləmə üçün `200`, yeni resurs üçün `201`. `DELETE /boxes/:id` fiziki silmə deyil, `200` və deaktiv edilmiş obyekt qaytarır. Bir resurs: `{"success":true,"data":{...}}`; siyahı: `{"success":true,"data":[...],"pagination":{"page":1,"pageSize":20,"total":42,"totalPages":3}}`. `totalPages=0`, `total=0` olduqda `data=[]`. `total` filtrdən sonra, səhifələmədən əvvəldir.
- Səhifələnən siyahılarda `page` default `1`, minimum `1`; `pageSize` default `20`, `1..100`. Naməlum query və təkrarlanan təkqiymətli query parametri `422`-dir. Sıralama həmişə sənəddə göstərilən əsas sahə + `id ASC` tie-breaker ilə deterministikdir. Offset pagination eyni anda dəyişən məlumatların ardıcıl səhifələrində sürüşmə yarada bilər; yüksək həcmdə sonradan cursor/snapshot tətbiq edin.
- Rol işarələri: **P** hamı, **A** aktiv, autentifikasiya edilmiş istifadəçi, **C** aktiv `CUSTOMER`/`BUSINESS_OWNER`, **O** həmin biznesin aktiv sahibi, **D** aktiv `ADMIN`. Oxu üçün A/C/O/D-də e-poçt təsdiqi tələb edilmir; yazma qaydası §3-dədir. Müvafiq yazma sahiblik və cari statusu tranzaksiyada təkrar yoxlayır. Admin avtomatik olaraq biznes sahibi və ya müştəri rolunu almır.
- Mühafizəli resurs üçün obyekt mövcud olsa da sahib deyilsə çox vaxt `404 NOT_FOUND` qaytarın ki, başqa hesabın məlumatı sızmasın; ümumi rol qadağası `403`-dür. Public olmayan biznes/box public API-də `404`-dür.

### 4.1. Sorğu sahələri və limitlər

| Tip/sahə | Dəqiq qayda |
|---|---|
| Ad, title | `trim`, Unicode uzunluğu `2..120` simvol. |
| `description` | `trim`, biznes üçün `0..2000` (null mümkündür), qutu üçün `10..2000`. |
| `category` | `BAKERY`, `CAFE`, `RESTAURANT`, `SUPERMARKET`, `OTHER`; həm biznes, həm qutu üçün MVP enum. |
| `address` | `trim`, `5..300`; `latitude` −90..90, `longitude` −180..180, hər ikisi tələb olunur. |
| `phone` | `+` və 8–15 rəqəmdən ibarət E.164, məsələn `+994501234567`; profil telefonu null ola bilər. |
| Qutu qiymətləri | Tam qəpik, `1 <= discountedPriceMinor < originalPriceMinor <= 100000000`; server `currency=AZN`. |
| Qutu `availableQuantity` | Tam ədəd `0..10000`; yaradanda `1..10000`. Rezervasiya `quantity` tam ədəd `1..20`. |
| `allergens` | `0..20` unikal, `1..80` simvolluq mətn massividir; `[]` yalnız biznes məlumatı yoxlayıb bilinən allergen olmadığını təsdiqlədikdə verilir. `foodInfo` `1..1000` simvol, təhlükəsizlik və məzmun qeydləri üçündür. |
| Götürmə vaxtı | `pickupStart < pickupEnd`, yaradılarkən `pickupEnd > now`, maksimal interval 24 saat və maksimum 30 gün gələcək; vaxtı keçmiş təklif yaradıla bilməz. `pickupStart` keçmiş ola bilər, əgər interval hələ açıqdır. `expiresAt = pickupEnd`. |
| Axtarış `q` | Trim edilmiş `1..100` simvol, hərf ölçüsündən asılı olmayan mətn; SQL parametrizasiya edilir. |
| Şərh və səbəb | Review `comment` nullable, `0..1000`; complaint `description` `10..2000`; moderation/cancellation `reason` `5..500`. |

## 5. Standart DTO-lar

Bütün cədvəl sütunları avtomatik serializə edilmir. Aşağıdakı siyahılar məhz cavab sahələridir; `?` burada **null ola bilər** deməkdir, sahə cavabdan buraxılmır. `createdAt`, `updatedAt` UTC timestamp-dir. Siyahı sətirlərində göstərilən DTO eyni müqaviləyə malikdir.

- **Profile**: `id:uuid`, `email:string`, `emailVerified:boolean`, `fullName:string`, `phone:string?`, `role:CUSTOMER|BUSINESS_OWNER|ADMIN`, `status:ACTIVE|SUSPENDED`, `createdAt`, `updatedAt`. Email Auth-un server-side etibarlı məlumatından alınır, profil update ilə dəyişmir. Admin siyahısı üçün Auth email-ləri yalnız admin backend vasitəsilə təhlükəsiz əldə edilir.
- **Business** (public): `id`, `name`, `description:string?`, `category`, `address`, `latitude:number`, `longitude:number`, `contactPhone`, `imageFileId:uuid?`, `createdAt`, `updatedAt`. Owner/admin cavabında əlavə **ManagedBusiness**: public sahələr + `ownerId:uuid`, `verificationStatus:DRAFT|PENDING|APPROVED|REJECTED|SUSPENDED`, `latestApplicationId:uuid?`. Public DTO-da statusun özü, owner ID və müraciət sənədləri yoxdur.
- **Application**: `id`, `businessId`, `status:PENDING|APPROVED|REJECTED`, `verificationInfo:string`, `documentFileIds:uuid[]`, `submittedAt`, `reviewedAt:timestamp?`, `reviewedBy:uuid?`, `decisionReason:string?`, `businessSnapshot:{name,category,address,latitude,longitude,contactPhone}`. Yalnız sahib və admin görə bilər.
- **Box**: `id`, `businessId`, `businessName`, `title`, `description`, `category`, `originalPriceMinor:integer`, `discountedPriceMinor:integer`, `currency:"AZN"`, `availableQuantity:integer`, `pickupStart`, `pickupEnd`, `expiresAt` (həmişə `pickupEnd`), `allergens:string[]`, `foodInfo`, `imageFileId:uuid`, `status:ACTIVE|DEACTIVATED|EXPIRED`, `createdAt`, `updatedAt`, `distanceMeters:integer?`. Public yalnız görünən təklifdir. Owner/admin DTO-da əlavə `moderationReason:string?`. `distanceMeters` koordinatlar verilməyibsə `null` olur.
- **Reservation**: `id`, `boxId`, `businessId`, `customerId`, `quantity`, `unitPriceMinor`, `totalPriceMinor`, `currency:"AZN"`, `status:PENDING|CONFIRMED|PICKED_UP|CANCELLED|EXPIRED`, `boxTitle`, `businessName`, `pickupAddress`, `pickupStart`, `pickupEnd`, `createdAt`, `updatedAt`, `pickedUpAt:timestamp?`, `cancelledAt:timestamp?`, `cancelReason:string?`, `pickupCode:string?`. Ad, ünvan, qiymət və vaxt rezervasiya yaradılarkən snapshot edilir. `pickupCode` yalnız həmin müştəriyə `CONFIRMED` və `now < pickupEnd` olduqda göstərilir; biznes/admin cavabında və digər statuslarda `null`-dur. Biznesin siyahısında `customerId` kifayətdir; e-poçt/telefon avtomatik verilməz.
- **Review**: `id`, `businessId`, `reservationId`, `customerDisplayName`, `rating:1..5`, `comment:string?`, `status:VISIBLE|HIDDEN`, `createdAt`, `updatedAt`. Public yalnız `VISIBLE`; display name şəxsi e-poçt deyil. Moderator hidden rəyləri görə bilər.
- **Complaint**: `id`, `userId`, `targetType:BUSINESS|BOX|REVIEW|RESERVATION`, `targetId`, `description`, `status:OPEN|IN_REVIEW|RESOLVED|DISMISSED`, `resolution:string?`, `createdAt`, `updatedAt`, `resolvedAt:timestamp?`. Şikayəti yaradan və admin görür.
- **Upload**: `id`, `businessId`, `purpose:BUSINESS_IMAGE|BOX_IMAGE|VERIFICATION_DOCUMENT`, `mimeType`, `sizeBytes:integer`, `createdAt`; Storage path və service key qaytarılmır.
- **Audit**: `id`, `actorId`, `action`, `targetType`, `targetId`, `reason:string?`, `createdAt`; dəyişikliklərin həssas köhnə/yeni detalları public cavabda yoxdur.

## 6. Endpoint cədvəli: dəqiq input və output

Bütün yollar `/api/v1` ilə başlayır. `{}` boş JSON body-dir; body tələb olunmayan GET-lərə body göndərilmir. `id` və adlandırılmış ID-lər UUID path parametrləridir. Ümumi auth, zərflər və səhvlər bütün sətirlərə aiddir.

### 6.1. Profil və biznes/müraciət

| Method və yol | Rol | Input: body və query | Uğurlu cavab və məqsəd |
|---|---|---|---|
| `GET /auth/me` | A | Yoxdur | `200 Profile`; cari şəxs, rol, status və e-poçt təsdiqi. Suspend edilmiş user üçün `403 ACCOUNT_SUSPENDED`, ona görə suspend məlumatı ayrıca UI mesajından anlaşılır. |
| `PATCH /users/me` | A | Body `{fullName?:string,phone?:string|null}`, ən az 1 sahə | `200 Profile`; yalnız öz adı/telefonu. E-poçt, rol, status və ID qadağandır. |
| `POST /businesses` | C | `{name,description:string|null,category,address,latitude,longitude,contactPhone,imageFileId:null}`; yeni biznes yaratmada hələ upload olmadığına görə şəkil mütləq `null` | `201 ManagedBusiness`, `DRAFT`. `ownerId` serverdən; hesab `CUSTOMER` idisə bu əməliyyatla `BUSINESS_OWNER` edilir. |
| `GET /businesses` | P | `page,pageSize,q?,category?`; sort `name ASC,id ASC` | `200 Business[]`; yalnız `APPROVED` və sahibi `ACTIVE` olan bizneslər. |
| `GET /businesses/:id` | P | Yoxdur | `200 Business`; yalnız public görünən biznes, əks halda `404`. |
| `GET /businesses/me` | C | `page,pageSize`; sort `createdAt DESC,id ASC` | `200 ManagedBusiness[]`; yalnız actor-un biznesləri, statusundan asılı olmayaraq. Route `/businesses/:id`-dən əvvəl qeydiyyatdan keçir. |
| `GET /businesses/:id/manage` | O | Yoxdur | `200 ManagedBusiness`; öz biznesinin vəziyyəti. |
| `PATCH /businesses/:id` | O | `{name?,description?:string|null,category?,address?,latitude?,longitude?,contactPhone?,imageFileId?:uuid|null}`, ən az 1; koordinatlardan biri varsa digəri də tələb olunur | `200 ManagedBusiness`. `name/category/address/latitude/longitude` yalnız `DRAFT` və ya `REJECTED` zamanı dəyişə bilər; `PENDING/APPROVED/SUSPENDED` zamanı `409`. Digər sahələr bütün statuslarda dəyişə bilər. `imageFileId` həmin biznesin `BUSINESS_IMAGE` faylı olmalıdır. |
| `POST /businesses/:id/apply` | O | `{verificationInfo:string,documentFileIds:uuid[]}`; məlumat `10..2000`, sənəd sayı `1..5`; hamısı həmin biznesin `VERIFICATION_DOCUMENT` upload-ıdır | `201 Application`; yalnız `DRAFT`/`REJECTED` üçün. Biznes `PENDING` olur, snapshot yaradılır, əvvəlki rədd tarixçəsi qorunur. |
| `GET /businesses/:id/applications` | O | `page,pageSize`; `submittedAt DESC,id ASC` | `200 Application[]`; öz müraciət tarixçəsi. |

Təsdiqlənmiş biznesin ad/ünvan/koordinat dəyişikliyi bu MVP müqaviləsində özünəxidmətlə mümkün deyil; adminin yoxlanmış əməliyyat proseduru və ya ayrıca gələcək re-verification flow tələb olunur. Mövcud müraciəti sessiz dəyişmək olmaz.

### 6.2. Təkliflər, axtarış və idarəetmə

| Method və yol | Rol | Input: body və query | Uğurlu cavab və məqsəd |
|---|---|---|---|
| `GET /boxes` | P | `page,pageSize,q?,category?,minPriceMinor?,maxPriceMinor?,lat?,lon?,radiusMeters?,pickupFrom?,pickupTo?,available?,sort?` | `200 Box[]`; yalnız aktiv, sayı müsbət, son vaxtı keçməmiş və biznesi görünən təkliflər. Qayda və çeşidləmə aşağıdadır. |
| `GET /boxes/:id` | P | Yoxdur | `200 Box`; eyni public görünmə şərtləri, əks halda `404`. `distanceMeters:null`. |
| `GET /businesses/:id/boxes` | O | `page,pageSize,status?`; `createdAt DESC,id ASC` | `200 Box[]`; həmin biznesin bütün təklifləri, status `ACTIVE|DEACTIVATED|EXPIRED`. Keçmiş pickup olan aktiv sətir `EXPIRED` kimi filtrlənir. |
| `POST /boxes` | O | `{businessId,title,description,category,originalPriceMinor,discountedPriceMinor,availableQuantity,pickupStart,pickupEnd,allergens,foodInfo,imageFileId}` | `201 Box`; biznes `APPROVED`, sahibi `ACTIVE`, fayl həmin biznesin `BOX_IMAGE` upload-ı olmalıdır. Server `ACTIVE` və `expiresAt=pickupEnd` təyin edir. |
| `PATCH /boxes/:id` | O | `{title?,description?,category?,originalPriceMinor?,discountedPriceMinor?,availableQuantity?,pickupStart?,pickupEnd?,allergens?,foodInfo?,imageFileId?}`, ən az 1 | `200 Box`; yalnız `ACTIVE`, vaxtı keçməmiş, biznesi `APPROVED` olduqda. Ən az bir rezervasiya tarixçəsi varsa yalnız `availableQuantity` və `imageFileId` dəyişə bilər; əks halda bütün yuxarıdakı sahələr yeni tam vəziyyət üzrə yoxlanır. |
| `DELETE /boxes/:id` | O | Body yoxdur | `200 Box`; `ACTIVE→DEACTIVATED`, mövcud rezervasiyaları dəyişmir. Artıq deaktiv/expired üçün `409 INVALID_TRANSITION`. Fiziki silmə yoxdur. |

**`GET /boxes` query qaydaları:** `minPriceMinor`, `maxPriceMinor` tam qəpik, `0..100000000`, minimum maksimumu keçməməlidir. `lat` və `lon` birlikdə tələb edilir, standart koordinat hüdudlarındadır; `radiusMeters` `1..100000`, yalnız hər ikisi ilə verilə bilər. Məsafə Haversine (yer radiusu 6 371 000 m) ilə hesablanır, nearest metrə yuvarlaq `distanceMeters` qaytarılır; radius müqayisəsi yuvarlaqlaşdırılmamış məsafə ilə aparılır. `pickupFrom`/`pickupTo` offset-li timestamp-dir; ikisi varsa `pickupFrom < pickupTo`; təklif aralığı filtr aralığı ilə kəsişməlidir: `pickupEnd > pickupFrom` və `pickupStart < pickupTo` (göndərilməyən sərhəd yoxlanmır). `available` yalnız `true|false` qəbul edir, default `true`; `false` public API-də `[]` qaytarır, çünki stokda olmayan elanlar gizlidir. `sort` `newest` default (`createdAt DESC`), `price_asc`, `price_desc`, `distance_asc`; distance üçün `lat,lon` lazımdır; bütün sortlarda son tie-breaker `id ASC`-dir. `q` business name və ya box title üzərində case-insensitive uyğunluqdur.

### 6.3. Rezervasiya və götürmə

| Method və yol | Rol | Input: body, header, query | Uğurlu cavab və məqsəd |
|---|---|---|---|
| `POST /reservations` | C | Header `Idempotency-Key: <UUID>` **məcburi**; `{boxId:uuid,quantity:integer}` | `201 Reservation` və yalnız müştəriyə pickupCode; qiymət, actor, status və stok serverdən. |
| `GET /reservations/me` | C | `page,pageSize,status?`; status reservation enum-u, `createdAt DESC,id ASC` | `200 Reservation[]`; yalnız actor-a aid rezervasiyalar, effective status ilə filtr. |
| `GET /businesses/:id/reservations` | O | `page,pageSize,status?,boxId?`; `createdAt DESC,id ASC` | `200 Reservation[]`; yalnız öz biznesinə aid. `boxId` varsa həmin biznesə məxsus olmalıdır. |
| `GET /reservations/:id` | C və ya O | Yoxdur | `200 Reservation`; yalnız müştəri və ya əlaqəli biznes sahibi. Üçüncü şəxsə `404`. Admin bu endpointdən istifadə etmir. |
| `PATCH /reservations/:id/confirm` | O | `{}` | `200 Reservation`; yalnız ehtiyatı artıq tutulmuş `PENDING→CONFIRMED`, pickupEnd keçməmiş; yeni yaradılan `CONFIRMED` üçün `409`. Stok dəyişmir. |
| `PATCH /reservations/:id/cancel` | C sahibi və ya O | Header `Idempotency-Key: <UUID>` **məcburi**; `{reason:string|null}`; müştəri üçün null və ya `5..500`, biznes üçün `5..500` məcburi | `200 Reservation`; uyğun `PENDING/CONFIRMED→CANCELLED`, vaxt və bərpa qaydaları §8-də. |
| `PATCH /reservations/:id/pickup` | O | Header `Idempotency-Key: <UUID>` **məcburi**; `{pickupCode:string}` | `200 Reservation`; düzgün kod və vaxt aralığında `CONFIRMED→PICKED_UP`. Sahib cavabında `pickupCode:null`. |

### 6.4. Rəylər, şikayətlər və fayllar

| Method və yol | Rol | Input: body və query | Uğurlu cavab və məqsəd |
|---|---|---|---|
| `POST /reviews` | C | `{reservationId:uuid,rating:integer,comment:string|null}` | `201 Review`; reservation actor-a aid, `PICKED_UP` və hələ rəysiz olmalıdır. Business və customer serverdən çıxarılır. |
| `GET /businesses/:id/reviews` | P | `page,pageSize`; `createdAt DESC,id ASC` | `200 Review[]`; biznes public görünməlidir, yalnız `VISIBLE`. |
| `POST /complaints` | C və ya O | `{targetType:"BUSINESS"|"BOX"|"REVIEW"|"RESERVATION",targetId:uuid,description:string}` | `201 Complaint`; reservation yalnız özünə aid, digər target yalnız actor-un normal baxa bildiyi obyekt ola bilər; `userId` serverdən. O da C imkanına malikdir. |
| `GET /complaints/me` | C | `page,pageSize,status?`; `createdAt DESC,id ASC` | `200 Complaint[]`; yalnız öz şikayətləri. |
| `GET /complaints/:id` | C | Yoxdur | `200 Complaint`; yalnız öz şikayəti. Admin üçün ayrıca yol. |
| `POST /uploads` | O | `multipart/form-data`: `businessId:uuid`, `purpose:BUSINESS_IMAGE|BOX_IMAGE|VERIFICATION_DOCUMENT`, `file` tam 1 binary fayl | `201 Upload`; sahiblik, fayl və kvotalar §11-də. Biznes şəkli/sənəd draft biznes üçün, box şəkli isə yalnız APPROVED biznes üçün qəbul edilir. |
| `GET /uploads/:id/access` | P, O və ya D | Yoxdur | `200 {url:string,expiresAt:timestamp}`; linked və public görünən şəkil hamıya, bağlı olmayan/özəl fayl yalnız aid biznes sahibinə və adminə. Sənəd yalnız sahib/adminə; URL 300 saniyəlik signed URL-dir. |

### 6.5. Dashboard və admin

| Method və yol | Rol | Input: body və query | Uğurlu cavab və məqsəd |
|---|---|---|---|
| `GET /businesses/:id/dashboard` | O | `from?,to?` offset-li; ikisi birlikdə, `from < to`, maksimum 366 gün; default son 30 gün `[now−30 gün,now)` | `200 BusinessDashboard` (§6.6). Sahibin yalnız öz biznesi. |
| `GET /admin/dashboard` | D | `from?,to?` biznes dashboard qaydası ilə | `200 AdminDashboard` (§6.6). |
| `GET /admin/users` | D | `page,pageSize,q?,role?,status?`; `q` ad/email, `role` profil rolu, `status:ACTIVE|SUSPENDED`; `createdAt DESC,id ASC` | `200 Profile[]`. |
| `PATCH /admin/users/:id/suspend` | D | `{reason:string}` | `200 Profile`; `ACTIVE→SUSPENDED`, audit yazılır. Özünü suspend etmək və son aktiv admini suspend etmək qadağandır. |
| `PATCH /admin/users/:id/reactivate` | D | `{reason:string}` | `200 Profile`; `SUSPENDED→ACTIVE`, audit yazılır. Biznes və box vəziyyətləri avtomatik dəyişdirilmir. |
| `GET /admin/businesses` | D | `page,pageSize,status?,q?`; status biznes enum-u; `createdAt DESC,id ASC` | `200 ManagedBusiness[]`; status və ad üzrə idarəetmə siyahısı. |
| `GET /admin/business-applications/:applicationId` | D | Yoxdur | `200 Application`; qərar və sənədlərə signed access yalnız admin. |
| `PATCH /admin/businesses/:id/approve` | D | `{applicationId:uuid,reason:string|null}`; reason null və ya `5..500` | `200 Application`; biznes və göstərilən ən son müraciət eyni anda `PENDING` olmalıdır; onlar atomik olaraq `APPROVED` olur. Audit saxlanır. |
| `PATCH /admin/businesses/:id/reject` | D | `{applicationId:uuid,reason:string}` | `200 Application`; eyni stale-request yoxlaması; biznes və müraciət `REJECTED` olur; audit. |
| `PATCH /admin/businesses/:id/suspend` | D | `{reason:string}` | `200 ManagedBusiness`; yalnız `APPROVED→SUSPENDED`, təkliflər public-dən dərhal itir, mövcud rezervasiyalar avtomatik dəyişmir; audit. |
| `PATCH /admin/businesses/:id/reactivate` | D | `{reason:string}` | `200 ManagedBusiness`; yalnız `SUSPENDED→APPROVED`; müddəti keçməmiş, hələ `ACTIVE` və stoklu elanın görünməsi bərpa oluna bilər; audit. |
| `GET /admin/boxes` | D | `page,pageSize,status?,businessId?,q?`; `createdAt DESC,id ASC` | `200 Box[]`; bütün statuslar, moderasiya səbəbi daxil. |
| `PATCH /admin/boxes/:id/deactivate` | D | `{reason:string}` | `200 Box`; `ACTIVE→DEACTIVATED`, səbəb və audit; rezervasiyalar dəyişmir, avtomatik reaktivasiya yoxdur. |
| `GET /admin/reviews` | D | `page,pageSize,status?,businessId?`; status `VISIBLE|HIDDEN`; `createdAt DESC,id ASC` | `200 Review[]`; moderasiya siyahısı. |
| `PATCH /admin/reviews/:id/moderate` | D | `{status:"VISIBLE"|"HIDDEN",reason:string}` | `200 Review`; yalnız fərqli statusa keçid, audit. |
| `GET /admin/complaints` | D | `page,pageSize,status?,targetType?`; `createdAt DESC,id ASC` | `200 Complaint[]`; şikayətlərin idarəetməsi. |
| `GET /admin/complaints/:id` | D | Yoxdur | `200 Complaint`. |
| `PATCH /admin/complaints/:id` | D | `{status:"IN_REVIEW"|"RESOLVED"|"DISMISSED",resolution:string|null}`; son iki statusda resolution `5..500`, `IN_REVIEW` üçün null | `200 Complaint`; yalnız `OPEN→IN_REVIEW|RESOLVED|DISMISSED`, `IN_REVIEW→RESOLVED|DISMISSED`; son statuslar terminal; audit. |
| `GET /admin/audit-logs` | D | `page,pageSize,actorId?,targetType?`; `createdAt DESC,id ASC` | `200 Audit[]`; yalnız oxu. |

### 6.6. Dashboard cavab strukturu və hesablamalar

**BusinessDashboard**: `{businessId,from,to,activeOffers,availableQuantity,reservationsCreated,completedPickups,pickedUpBoxes,estimatedPickupValueMinor,currency:"AZN"}`. `activeOffers` və `availableQuantity` sorğu anındakı public şərtləri ödəyən box sayı və onların mövcud vahid cəmidir, tarix filtrindən asılı deyil. `reservationsCreated` `[from,to)` intervalında `createdAt` üzrə bütün statuslardan yaradılan rezervasiya sayıdır. `completedPickups` və `pickedUpBoxes` uyğun olaraq `pickedUpAt` intervalında rezervasiya sayı və `quantity` cəmidir; `estimatedPickupValueMinor` həmin sətirlərin snapshot `totalPriceMinor` cəmidir. Məbləğ sadəcə götürülmüş rezervasiyaların nəzəri dəyəridir, gəlir/yığılan ödəniş deyil.

**AdminDashboard**: `{from,to,registeredUsers,approvedBusinesses,activeOffers,availableQuantity,pendingApplications,openComplaints,reservationsCreated,completedPickups,pickedUpBoxes,estimatedPickupValueMinor,currency:"AZN"}`. İlk altı rəqəm cari snapshot sayıdır; `registeredUsers` suspend edilmişlər daxil bütün profillər, `approvedBusinesses` yalnız `APPROVED` və sahibi `ACTIVE`, `activeOffers/availableQuantity` public görünmə qaydası ilə, `pendingApplications` `PENDING`, `openComplaints` `OPEN|IN_REVIEW` sayıdır. Interval ölçüləri biznes dashboard ilə eyni qaydada bütün platforma üzrədir. Saylar `0`, cəmlər `0` ola bilər; boş massiv/`null` əvəzinə `0` qaytarılır.

## 7. Səhvlər, idempotency və nümunələr

Uğursuz cavab:

```json
{"success":false,"error":{"code":"INSUFFICIENT_QUANTITY","message":"Seçilmiş sayda qutu mövcud deyil.","details":null,"requestId":"3c93ce49-ae9c-4675-ab0d-989e1cdf5210"}}
```

`details` ya `null`, ya da validasiya üçün `[{"field":"quantity","message":"1 ilə 20 arasında tam ədəd olmalıdır"}]` şəklindədir. Mesajlar Azərbaycan dilində, `code` sabit maşın kodudur. `requestId` server tərəfindən yaradılır və cavab/log korrelyasiyası üçündür; stack, SQL, token, pickup code və secret açıqlanmır.

| HTTP | Kodlar və istifadə |
|---|---|
| `400` | `INVALID_JSON`, `INVALID_MULTIPART` — parse edilə bilməyən sorğu. |
| `401` | `UNAUTHENTICATED`, `TOKEN_INVALID` — token yox, yanlış və ya müddəti keçib. |
| `403` | `FORBIDDEN`, `ACCOUNT_SUSPENDED`, `EMAIL_NOT_VERIFIED` — rol, hesab və ya təsdiq şərti ödənmir. |
| `404` | `NOT_FOUND` — obyekt yoxdur və ya sahiblik gizlədilir. |
| `409` | `INSUFFICIENT_QUANTITY`, `OFFER_UNAVAILABLE`, `INVALID_TRANSITION`, `CANCELLATION_WINDOW_CLOSED`, `PICKUP_WINDOW_CLOSED`, `INVALID_PICKUP_CODE`, `ALREADY_REVIEWED`, `APPLICATION_ALREADY_PENDING`, `IDEMPOTENCY_KEY_REUSED` — müvafiq state konflikti. Yanlış kod və keçid detalları üçün informasiyanı minimum saxlayın. |
| `413` | `FILE_TOO_LARGE`. |
| `415` | `UNSUPPORTED_MEDIA_TYPE`. |
| `422` | `VALIDATION_ERROR` — düzgün parse edilmiş, amma schema/parametr qaydasını pozan input. |
| `429` | `RATE_LIMITED`, `PICKUP_ATTEMPTS_EXCEEDED`; `Retry-After` saniyə ilə. |
| `500` | `INTERNAL_ERROR` — gözlənilməyən xəta, təhlükəsiz mesaj. |
| `503` | `SERVICE_UNAVAILABLE` — tələb olunan DB/Auth/Storage asılılığı əlçatan deyil; keçici xətalarda `Retry-After` verilə bilər. |

**Idempotency:** göstərilən üç yazma endpointində client kriptoqrafik UUID key yaradır və eyni istifadəçi hərəkətinin bütün retry-larında eyni key-i göndərir. DB-də unikal `(actor_id, method, canonical_route, key)` və kanonik body SHA-256 hash saxlanır. Eyni key + eyni hash ilə paralel və ya sonrakı retry ilk tranzaksiyanı gözləyir və onun orijinal HTTP statusu + response body-sini qaytarır; eyni key + fərqli hash `409 IDEMPOTENCY_KEY_REUSED`-dir. Yalnız tamamlanmış uğurlu əməliyyat nəticəsi və onun biznes dəyişiklikləri **eyni tranzaksiyada** commit edilir; validasiya/konflikt və rollback uğursuzluqları key-i müvəffəqiyyət kimi bağlamır. Nəticə pickup code daşıya bildiyindən response şifrələnmiş saxlanır, açar serverdə/secret manager-dədir; loglanmır. Retention ən az 24 saatdır; bundan sonra təkrarın dəqiq bir dəfə icra olunmasına zəmanət yoxdur. TTL bitməzdən əvvəl yalnız tamamlanmış qeydlər təmizlənir. Başqa hərəkət üçün yeni key; müştəri yeni key ilə yenə rezervasiya yarada bilər — bu ayrıca hərəkətdir, sistem avtomatik deduplikasiya etmir.

**Rezervasiya sorğusu:**

```http
POST /api/v1/reservations
Authorization: Bearer <access-token>
Idempotency-Key: 615c0915-9fd4-4ecb-9b96-98fd0692840f
Content-Type: application/json

{"boxId":"eb5e1eee-4603-48f2-a0d8-bf0673c82e4d","quantity":2}
```

```json
{"success":true,"data":{"id":"cd84aa97-2550-4048-877d-bc128d6e37f0","boxId":"eb5e1eee-4603-48f2-a0d8-bf0673c82e4d","businessId":"0121f5c3-ce7f-488b-8f5a-4eea52846d8a","customerId":"65a2298f-6702-48e8-98fa-a34a18d0fcf0","quantity":2,"unitPriceMinor":500,"totalPriceMinor":1000,"currency":"AZN","status":"CONFIRMED","boxTitle":"Günün çörək qutusu","businessName":"Nümunə çörək evi","pickupAddress":"Bakı, Nümunə küçəsi 1","pickupStart":"2026-12-01T14:00:00Z","pickupEnd":"2026-12-01T16:00:00Z","createdAt":"2026-12-01T12:00:00Z","updatedAt":"2026-12-01T12:00:00Z","pickedUpAt":null,"cancelledAt":null,"cancelReason":null,"pickupCode":"M7KD-4TQF-7Z2J"}}
```

`1000` qəpik = `10.00 AZN`; `14:00Z` dekabrda Bakı vaxtı ilə `18:00`-dır. Bu cavab ödənişin həyata keçirilməsini bildirmir.

**Public filtr nümunəsi:** `GET /api/v1/boxes?category=BAKERY&minPriceMinor=300&maxPriceMinor=1000&lat=40.4093&lon=49.8671&radiusMeters=5000&pickupFrom=2026-12-01T17%3A00%3A00%2B04%3A00&pickupTo=2026-12-01T21%3A00%3A00%2B04%3A00&sort=distance_asc&page=1&pageSize=20`.

**Pickup nümunəsi:** `PATCH /api/v1/reservations/cd84aa97-2550-4048-877d-bc128d6e37f0/pickup`, `Authorization` və yeni `Idempotency-Key` header-ləri, body `{"pickupCode":"M7KD-4TQF-7Z2J"}`. Yalnız əlaqəli sahibin doğrulanmış sessiyası ilə işləyir.

## 8. Stok, tranzaksiya, status və yarışların qarşısı

### 8.1. Model və invariants

`surprise_boxes.available_quantity` **hazırda rezerv edilə bilən sərbəst vahidlərin** sayıdır; təsdiqlənmiş və gözləyən rezervasiyalar stokdan artıq çıxılmışdır. Admin və ya sahib qutunu deaktiv etsə də, mövcud rezervasiyalar qəbul edilmiş öhdəlik olaraq qalır; ancaq yeni rezervasiyaya public/business status imkan vermir. Stok `>=0`, rezervasiya miqdarı `>0`, qiymət snapshot-ı immutable olmalıdır. Sahib `availableQuantity`-ni yeni sərbəst stok kimi təyin edir, mövcud tutulmuş vahidləri bu rəqəmdən yenidən çıxmır; sıfıra azaltmaq mövcud rezervasiyanı ləğv etmir.

`PENDING→CONFIRMED`, `PENDING|CONFIRMED→CANCELLED`, `CONFIRMED→PICKED_UP`, `PENDING|CONFIRMED→EXPIRED` icazəlidir. `PICKED_UP`, `CANCELLED`, `EXPIRED` terminaldır. Normal yeni rezervasiya birbaşa `CONFIRMED`-dir. `PENDING` yalnız yoxlanmış server-side import/gələcək workflow ilə yaranarsa ehtiyatı artıq tutulmuş olmalıdır. Hər dəyişikliklə `reservation_events` və əlaqəli outbox hadisəsi eyni DB tranzaksiyasında yaradılır; statusu müştərinin arbitrary PATCH-i ilə dəyişmək olmaz.

### 8.2. Atomik yaratma — PostgreSQL funksiyası psevdokodu

Aşağıdakı, literal copy/paste migration deyil: `raise_domain`, idempotency şifrələmə və event/outbox helper-ləri ayrıca yazılmalı və unit/integration test edilməlidir. Funksiya serverə məhdud `SECURITY DEFINER` RPC-dir. Server təsdiq edilmiş actor-u ötürür, funksiya actor və biznes statusunu da təkrar yoxlayır. `clock_timestamp()` kilidləri aldıqdan **sonra** götürülür: gözləmə səbəbindən vaxtı keçmiş qutunun satışına yol vermək olmaz.

```sql
-- Məntiq: bütün funksiyanın işləməsi bir PostgreSQL transaction-dır.
create function private.create_reservation(
  p_actor uuid, p_box uuid, p_quantity integer,
  p_idem_key uuid, p_request_hash bytea
) returns jsonb
language plpgsql security definer
set search_path = pg_catalog, private, public
as $$
declare
  v_business_id uuid; v_owner_id uuid; v_box public.surprise_boxes%rowtype;
  v_business public.businesses%rowtype;
  v_now timestamptz; v_res public.reservations%rowtype;
  v_code text; v_response jsonb;
begin
  -- Aşağıdakı helper unikal idempotency sətrini kilidləyir/yaradır;
  -- artıq commit edilmiş eyni hash üçün orijinal encrypted response-u qaytarır,
  -- fərqli hash üçün IDEMPOTENCY_KEY_REUSED verir.
  v_response := private.idempotency_begin_or_replay(
    p_actor, 'POST', '/reservations', p_idem_key, p_request_hash);
  if v_response is not null then
    perform private.lock_and_assert_active_actor(p_actor);
    return v_response;
  end if;
  if p_quantity < 1 or p_quantity > 20 then
    perform private.raise_domain('VALIDATION_ERROR');
  end if;

  -- Kilid sırası: idempotency → profillər ID sırası → biznes → box → reservation.
  -- Dəyişməz bağlantılar əvvəl lock-suz oxunur, sonra lock ilə təkrar yoxlanır.
  select box.business_id, biz.owner_id into v_business_id, v_owner_id
    from public.surprise_boxes box
    join public.businesses biz on biz.id = box.business_id
    where box.id = p_box;
  if not found then perform private.raise_domain('NOT_FOUND'); end if;
  -- Hər iki profil eyni olduqda bir dəfə, fərqli olduqda UUID artan sıra ilə
  -- FOR SHARE kilidlənir; actor ACTIVE və CUSTOMER/BUSINESS_OWNER,
  -- biznes sahibi ACTIVE olmalıdır. Bu kilidlər biznesdən əvvəl alınır.
  perform private.lock_and_assert_profiles(p_actor, v_owner_id);
  select * into v_business from public.businesses where id = v_business_id for share;
  if not found or v_business.owner_id <> v_owner_id
     or v_business.verification_status <> 'APPROVED' then
    perform private.raise_domain('OFFER_UNAVAILABLE');
  end if;
  select * into v_box from public.surprise_boxes where id = p_box for update;
  if not found or v_box.business_id <> v_business_id then
    perform private.raise_domain('NOT_FOUND');
  end if;
  v_now := clock_timestamp();
  if v_box.status <> 'ACTIVE' or v_box.pickup_end <= v_now then
    perform private.raise_domain('OFFER_UNAVAILABLE');
  end if;
  if v_box.available_quantity < p_quantity then
    perform private.raise_domain('INSUFFICIENT_QUANTITY');
  end if;
  update public.surprise_boxes
    set available_quantity = available_quantity - p_quantity, updated_at = v_now
    where id = p_box;
  -- Server-generated UUID və unikal, yoxlanıla bilən pickup code;
  -- snapshot qiyməti/vaxtı/ünvanı biznes və box lock altında alınır.
  insert into public.reservations
    (id, customer_id, business_id, surprise_box_id, quantity,
     unit_price_minor, total_price_minor, currency, status,
     box_title, business_name, pickup_address, pickup_start, pickup_end,
     code_nonce, code_key_version, code_hash, created_at, updated_at)
  values
    (gen_random_uuid(), p_actor, v_business_id, p_box, p_quantity,
     v_box.discounted_price_minor, v_box.discounted_price_minor * p_quantity,
     'AZN', 'CONFIRMED', v_box.title, v_business.name, v_business.address,
     v_box.pickup_start, v_box.pickup_end,
     /* crypto nonce, active key version, unique HMAC digest */,
     v_now, v_now)
  returning * into v_res;
  v_code := private.derive_pickup_code(v_res.id, v_res.code_nonce, v_res.code_key_version);
  perform private.append_reservation_event(v_res.id, p_actor, null, 'CONFIRMED', v_now);
  perform private.enqueue_outbox('reservation.confirmed', v_res.id, v_now);
  v_response := private.customer_reservation_dto(v_res, v_code);
  perform private.idempotency_complete(p_actor, 'POST', '/reservations',
                                      p_idem_key, 201, v_response);
  return v_response;
end $$;
```

**Kilid sırası:** helper həqiqətən hər iki profil kilidini UUID artan sıra ilə, biznes kilidindən əvvəl almalıdır. Biznesin `owner_id` və box-un `business_id` MVP-də immutable-dır, lakin lock-suz oxunmuş əlaqələr biznes və box kilidi alındıqdan sonra yenə yoxlanır. Bütün mutatorlar eyni sıralamaya əməl etməli, fərqli lock order istifadə etməməlidir. Paralel əməliyyatlarda `40P01`/`40001` olarsa server bounded retry edir və orijinal idempotency key-ni saxlayır. Email verification-da actor-un Auth yoxlaması API səviyyəsində edilir; funksiya actor profilini ayrıca yoxlayır.

### 8.3. Ləğv, bərpa, expiry və pickup atomikliyi

Hər dəyişiklik üçün eyni lock order: idempotency qeydi (əgər tələb edilirsə), əlaqəli profil(lər) UUID sırası, biznes, box, reservation. Əvvəl ID-ləri lock-suz tapmaq olar, lakin kiliddən sonra bütün əlaqələr və sahiblik təkrar yoxlanmalıdır. Hesab suspend/rol dəyişikliyi profilə `FOR UPDATE` kilidi aldığından, yarışan mutasiya ya əvvəl tam commit olur, ya da yeni statusu görüb rədd edilir. Çoxlu profil dəyişməsi bütün profil kilidlərini ID sırası ilə alır. Biznesin təsdiqi/suspension-ı biznesi yazma kilidi ilə alır; box moderasiyası/miqdar dəyişikliyi box-u yazma kilidi ilə alır.

**Ləğv:** kilidlərdən sonra `t=clock_timestamp()`; əgər `t >= pickupEnd` və status `PENDING|CONFIRMED` isə əvvəl onu `EXPIRED` edin, stok bərpa etməyin, event/outbox yazın; sonra ləğv üçün `409 INVALID_TRANSITION` verin. Bu istisnanı eyni tranzaksiyanı rollback edəcək şəkildə atmaq olmaz: ya lazy expiry-ni ayrıca uğurlu commit edib API-nin `409` nəticəsini qaytarın, ya da worker-ə buraxıb read-də effective `EXPIRED` hesablayın. Əgər vaxt uyğundursa, actor sahibliyi və §1-dəki rol üzrə kəsilmə anını yoxlayın, `PENDING|CONFIRMED→CANCELLED` edin, `cancelledAt=t`, `cancelReason` yazın və **eyni tranzaksiyada** `available_quantity += reservation.quantity` edin. Bu bərpa business/box deaktiv və ya suspend olsa belə izlənir; public filtr həmin qutunu göstərmir. Bu qayda ilə deaktiv qutu sonradan yenidən satışa açılmasa belə daxili say düzdür. İki paralel ləğvdə ikinci sorğu yeni statusu görür və stok ikinci dəfə artmır; eyni idempotency key isə ilk uğurlu cavabı replay edir. Vaxtı keçmiş rezervasiyanın ləğvi stok bərpa etmir.

**Expiry:** `pickupEnd <= now` olduqda aktiv box və `PENDING/CONFIRMED` rezervasiya effektiv olaraq `EXPIRED`-dır. Server public sorğularında birbaşa `pickup_end > clock_timestamp()` şərtindən istifadə edir, job geciksə də keçmiş qutu rezerv edilə bilməz. `GET` DTO və status filtrində keçmiş `ACTIVE` box və `PENDING/CONFIRMED` rezervasiya `EXPIRED` kimi hesablanır; terminal statuslar dəyişmir. Worker ən azı dəqiqədə bir dəfə namizədləri kilidsiz seçir, hər obyekt üçün **eyni kilid sırası** ilə yenidən yoxlayır, status/event/outbox-u atomik yazır və ehtiyatı bərpa etmir. Təkrar worker icrası təhlükəsizdir; mümkün liderlik üçün advisory lock istifadə edilə bilər. Namizədləri seçərkən `reservation FOR UPDATE SKIP LOCKED` alıb sonra box kilidi almaq yuxarıdakı sıranı pozur, bunu etməyin. Məntiqi expiry vaxtı `pickupEnd`, event-in faktiki yazıldığı `createdAt` ayrı saxlanır. Worker uğursuzluğu monitorinq və retry tələb edir; köhnə əşyaların effektiv görünüşünü dəyişmir.

**Pickup:** kod yalnız backenddə yoxlanır, tranzaksiyada status `CONFIRMED`, `pickupStart <= t < pickupEnd`, sahiblik və hesab/biznes icazəsi yenidən yoxlanır. Kod düzgündürsə `PICKED_UP`, `pickedUpAt=t` və event/outbox birlikdə commit edilir; stok dəyişmir. Vaxt bitibsə `EXPIRED`, götürmə rədd edilir. Pickup/cancel/expiry yarışında eyni box və reservation kilidləri səbəbi ilə yalnız bir terminal keçid commit olar. Biznes `SUSPENDED` olarsa sahibi pickup edə bilməz; əməliyyat problemi admin/support-a yönləndirilir, vaxt bitənədək müştəri ləğvi qaydası yenə tətbiq olunur. Biznesin yalnız offer-i deaktiv etməsi təsdiqlənmiş götürməni bloklamır.

### 8.4. Pickup kodunun təhlükəsizliyi

Reservation UUID-si ayrı order ID-dir və pickup secret deyil. Kod backenddə kriptoqrafik HMAC ilə reservation ID + təsadüfi nonce-dan törədilən 12 simvolluq Base32 (`XXXX-XXXX-XXXX`, təqribən 60 bit), unikal yoxlanır; kolliziya halında nonce yenilənir. DB-də yalnız nonce, key versiyası və normallaşdırılmış kodun ayrıca server secret-i ilə HMAC digest-i saxlanır, plain code saxlanmır. Müştəri yenidən oxuyanda server kodu həmin key versiyası ilə təkrar yaradır; key rotation zamanı aktiv reservation-ların köhnə versiya açarı təhlükəsiz saxlanır. Daxil edilən kod uppercase və tirelər çıxarılaraq yoxlanır; digest constant-time müqayisə edilir. Kod yalnız həmin müştəriyə görünür, biznes tərəfindən daxil edilir; log, URL, analytics və audit-də qeyd edilmir. Hər reservation + biznes actor üçün ardıcıl 5 yanlış cəhdə 15 dəqiqəlik blok (`429`, `Retry-After`) mərkəzləşdirilmiş atomik sayğacla tətbiq edilir; əlavə IP/hesab limiti və təhlükəsizlik monitorinqi lazımdır. Kod təsdiqi server hüquqlarını əvəz etmir.

Bu psevdokoddakı DB helper-lərinin HMAC və idempotency response şifrələməsi üçün konkret yolu: açarları operator Supabase Vault kimi server-side secret store-a provision edir; yalnız no-login definer sahibi həmin konkret secret-ləri oxuya bilir. Məhdud DB runtime login-i, `anon` və `authenticated` nə vault-a, nə də derive/decrypt helper-lərinə birbaşa giriş almır. Əgər istifadə olunan mühitdə Vault/açar girişini bu şəkildə məhdudlaşdırmaq mümkün deyilsə, bu dizaynı olduğu kimi buraxmayın: tranzaksiyanı serverin mühafizə edilmiş açar idarəetməsi ilə yenidən dizayn edin. DB parametrləri və query nəticələrinin həssas loglanmasını söndürün. Müştəriyə kod qaytaran oxu da yalnız əlaqəli, aktiv müştərinin yoxlandığı məhdud server entrypoint-dən aparılır.

Yanlış kod cəhdinin sayğacı uğursuz business nəticəsi ilə belə **commit** olmalıdır: yoxlama funksiyası istisna atıb bütün tranzaksiyanı rollback etmək əvəzinə sayğacı atomik artırır və strukturlu `INVALID_PICKUP_CODE`/`PICKUP_ATTEMPTS_EXCEEDED` nəticəsi qaytarır; Express commit-dən sonra uyğun `409`/`429` verir. Bu uğursuz nəticə idempotency uğuru kimi saxlanmır. Doğru kodla pickup üçün status, event və idempotency uğuru bir yerdə commit edilir. Retry və blok müddəti sayğacın lock-u altında yoxlanmalıdır.

## 9. PostgreSQL sxemi, constraint və indekslər

Aşağıdakı cədvəllər migration-ların implementasiya müqaviləsidir; bütün `id` sütunları UUID PK-dir, vaxtlar `timestamptz`, pul `bigint`, quantity `integer`. `created_at/updated_at NOT NULL` default DB vaxtı; `updated_at` tranzaksiya tərəfindən idarə edilir. Enum-lar PostgreSQL enum və ya `CHECK` ilə tətbiq edilə bilər. Fərqli göstərilməyibsə sütunlar `NOT NULL`-dır.

| Cədvəl | Sütunlar, əlaqələr və mühüm qaydalar |
|---|---|
| `profiles` | `id` PK/FK `auth.users(id) ON DELETE RESTRICT`, `full_name`, `phone NULL`, `role`, `status`, timestamps; rol/status CHECK. E-poçt və parol təkrarlanmır. Auth email unikallığı provayderə məxsusdur. |
| `businesses` | `id`, `owner_id→profiles`, `name`, `description NULL`, `category`, `address`, `latitude numeric(9,6)`, `longitude numeric(9,6)`, `contact_phone`, `image_file_id NULL`, `verification_status`, timestamps; koordinat CHECK; owner immutable. Biznes vergi ID-si tələb olunarsa ayrıca normalizasiya və UNIQUE qaydası hüquqi tələblər təsdiqləndikdən sonra əlavə edilir. |
| `business_applications` | `id`, `business_id→businesses`, `status`, `verification_info`, `business_snapshot jsonb`, `submitted_at`, `reviewed_at NULL`, `reviewed_by→profiles NULL`, `decision_reason NULL`; `PENDING` üçün partial unique `(business_id) WHERE status='PENDING'`; qərar vaxtı/actor/status uyğunluğu CHECK. Sənədlər `application_documents(application_id,file_id)` join ilə, composite PK; immutable snapshot. |
| `surprise_boxes` | `id`, `business_id→businesses`, `title`, `description`, `category`, `original_price_minor`, `discounted_price_minor`, `available_quantity`, `pickup_start`, `pickup_end`, `allergens text[]`, `food_info`, `image_file_id→uploads`, `status`, `moderation_reason NULL`, timestamps; `CHECK(0 < discounted_price_minor AND discounted_price_minor < original_price_minor)`, `CHECK(available_quantity >= 0)`, `CHECK(pickup_end > pickup_start)`; `expires_at` ayrıca sütun deyil, `pickup_end`-dən çıxarılır; business_id immutable. |
| `reservations` | `id`, `customer_id→profiles`, `business_id→businesses`, `surprise_box_id→surprise_boxes`, `quantity`, `unit_price_minor`, `total_price_minor`, `currency='AZN'`, `status`, `box_title`, `business_name`, `pickup_address`, `pickup_start`, `pickup_end`, `code_nonce`, `code_key_version`, `code_hash UNIQUE`, `picked_up_at NULL`, `cancelled_at NULL`, `cancel_reason NULL`, timestamps. `CHECK(quantity BETWEEN 1 AND 20)`, `CHECK(total_price_minor = quantity * unit_price_minor)`, `CHECK(unit_price_minor>0)`. Composite FK `(surprise_box_id,business_id)` → box `(id,business_id)` ilə biznes uyğunluğu. Statusa uyğun timestamp CHECK; snapshot/bağlantı sonradan dəyişməz. |
| `reservation_events` | `id`, `reservation_id→reservations`, `actor_id→profiles NULL` (worker üçün null), `from_status NULL`, `to_status`, `occurred_at`, `created_at`; append-only. İlkin təsdiq `from_status=NULL`. |
| `reviews` | `id`, `reservation_id→reservations UNIQUE`, `customer_id→profiles`, `business_id→businesses`, `rating CHECK BETWEEN 1 AND 5`, `comment NULL`, `status`, timestamps. Transaction/function reservation-ın `PICKED_UP` və sahib uyğunluğunu yoxlayır; cross-table vəziyyət adi CHECK ilə təmin edilmir. |
| `complaints` | `id`, `user_id→profiles`, `target_type`, `target_id uuid`, `description`, `status`, `resolution NULL`, `resolved_at NULL`, timestamps; status/terminal timestamp CHECK. Polimorf target FK ilə qorunmur: yazma funksiyası target tipini, mövcudluğunu və görünməsini yoxlayır; fiziki silmə qadağan edilir. |
| `uploads` | `id`, `business_id→businesses`, `uploaded_by→profiles`, `purpose`, `bucket`, `object_path UNIQUE`, `mime_type`, `size_bytes`, `state:READY`, `created_at`; owner və purpose backend tərəfindən yoxlanır. Circular `businesses.image_file_id→uploads` FK migration-da ayrıca əlavə edilir, nullable-dır. |
| `audit_logs` | `id`, `actor_id→profiles`, `action`, `target_type`, `target_id`, `reason NULL`, `created_at`; append-only, admin hərəkəti ilə eyni tranzaksiya. Həssas məlumat, token, kod yoxdur. |
| `idempotency_records` | `actor_id`, `method`, `canonical_route`, `key`, `request_hash bytea`, `http_status`, `encrypted_response bytea`, `created_at`, `expires_at`; composite UNIQUE `(actor_id,method,canonical_route,key)`; DB row-lock ilə yarış idarəsi. `canonical_route` parametrli path-in real resource UUID-sini də ehtiva edir. |
| `pickup_attempts` | `reservation_id`, `actor_id`, `failed_count`, `window_start`, `locked_until NULL`; composite PK, atomik update, shared DB/Redis. Yalnız say və vaxt, kod yox. |
| `outbox` | `id`, `event_type`, `aggregate_id`, `payload jsonb` (secret və kodsuz), `created_at`, `delivered_at NULL`, `attempt_count`, `next_attempt_at`; unikal event ID, retry/backoff və consumer dedup. |

Foreign key-lər audit, maliyyə snapshot-ı və rezervasiya tarixçəsini qorumaq üçün default `RESTRICT` seçilir; hesab silinməsi üçün ayrıca hüquqi retention/anonymization siyasəti lazımdır, cascade ilə tarixçə silinmir. `code_hash` kolliziyası zamanı tranzaksiya nonce-u yenidən yaradır. Qiymət və quantity limitləri hem DB, həm Zod səviyyəsində yoxlanır; `total_price_minor` hesablamasında overflow yoxlanır.

**İndekslər:** `businesses(owner_id,created_at DESC,id)`, `(verification_status,name,id)`; `business_applications(business_id,submitted_at DESC,id)` və yuxarıdakı partial unique; `surprise_boxes(business_id,created_at DESC,id)`, `(status,category,pickup_end)`, qiymət/sıralama üçün uyğun `(status,discounted_price_minor,id)`; public query-də `status='ACTIVE'` üzrə partial index. `now()` kimi dəyişən zaman ifadəsini partial-index predicate-də istifadə etməyin. `reservations(customer_id,created_at DESC,id)`, `(business_id,created_at DESC,id)`, `(surprise_box_id,status)`, `(status,pickup_end)`; reviews `(business_id,status,created_at DESC,id)`; complaints `(status,created_at DESC,id)`; audit `(created_at DESC,id)`; outbox `(next_attempt_at) WHERE delivered_at IS NULL`. Axtarış üçün lazım gəldikdə `pg_trgm` indeksləri və sorğu planı `EXPLAIN ANALYZE` ilə ölçülür. Haversine MVP üçün uyğundur, yüksək həcmdə PostGIS və məkan indeksi əlavə edin.

**RLS və grant testləri:** hər domen cədvəlində `ALTER TABLE ... ENABLE ROW LEVEL SECURITY`; `anon`/`authenticated` üçün cədvəl və sequence hüquqları, eləcə də mutasiya funksiyaları `REVOKE`; exposed schema-larda yeni funksiyaların default `PUBLIC EXECUTE` hüququ migration-da ayrıca alınır. `service_role` bypass səbəbilə onun sorğularında RLS-ə güvənmək olmaz. Authenticated client-in öz rolunu dəyişmək, başqa rezervasiyanı oxumaq, stok yeniləmək, private sənədi əldə etmək və funksiyanı birbaşa çağırmaq cəhdlərinin hamısı testlə rədd edilməlidir. Gələcək açıq view-larda həm view sahibinin RLS davranışı, həm column grant-lar test edilməlidir.

## 10. Frontend inteqrasiyası və localStorage mock-dan keçid

| Mövcud frontend məsuliyyəti / mock əməliyyatı | Backend müqaviləsi |
|---|---|
| Mock login/register və local user/role | §3 Supabase Auth; sessiya dəyişəndə `GET /auth/me`, rol/status serverdən. |
| Biznes yaradılması, təsdiqini mock set etmək | `POST /businesses`, upload, `POST /businesses/:id/apply`; admin `GET /admin/businesses` və approve/reject. |
| Biznes profili/sahib dashboard-u | `GET /businesses/me`, `GET /businesses/:id/manage`, `PATCH /businesses/:id` və dashboard endpointi. |
| Mock box massivində create/update/decrement | `POST/PATCH/DELETE /boxes...`; customer `GET /boxes` filtrləri; ehtiyat heç vaxt browser-də avtoritativ dəyişdirilmir. |
| Mock rezervasiya və local status | `POST /reservations`, `GET /reservations/me`, `GET /reservations/:id`, cancel/pickup; ehtiyat və status yalnız server cavabından. |
| Müştəri tarixçəsi / sahib sifarişləri | `/reservations/me`, `/businesses/:id/reservations`; `PENDING` display mövcud olsa da yeni rezervasiya `CONFIRMED` olur. |
| Rating/complaint mock | `/reviews`, `/businesses/:id/reviews`, `/complaints`, admin moderation/şikayətlər. |
| Admin kartları və mock approval | `/admin/dashboard`, `/admin/users`, `/admin/businesses`, `/admin/boxes`, admin mutate endpointləri. |
| local image URL / data URL | `POST /uploads` → `imageFileId` → `GET /uploads/:id/access`; base64 və mock yolunu DB-yə yazmayın. |

1. Frontend-də API adapter interface-i yaradın (`AuthAdapter`, `BusinessApi`, `BoxApi`, `ReservationApi` və s.); mock və HTTP implementasiyalarını feature flag ilə ayırın. API base URL və Supabase public konfiqurasiyası env-dən alınır. `fetch` wrapper ən son session tokeni, JSON/error decoding və request ID-ni idarə edir; tokenləri loglamır.
2. TanStack Query açarlarını resurs və filtrlə qurun; rezervasiya uğurundan sonra `[boxes]`, box detail, `[reservations,me]` və biznes reservation/dashboard query-lərini invalidate edin. İki müştərinin eyni stoku görməsi normaldır: `409 INSUFFICIENT_QUANTITY` zamanı optimistik ehtiyat dəyişikliyini rollback edin, stok yeniləyin və istifadəçiyə aydın mesaj verin. Pickup/cancel üçün də statusu serverdən yeniləyin.
3. Rezervasiya düyməsinə basılan zaman key yaradın və bu konkret hərəkət bitənə qədər saxlayın; timeout/retry-də eyni key, yeni hərəkətdə yeni key. Offline olduqda uğurlu rezervasiya kimi göstərməyin; request-in nəticəsi bilinmirsə eyni key ilə təkrar edin. UI double-click-i bloklasa da server idempotency vacibdir.
4. React Hook Form/Zod frontend-də erkən yoxlama üçün istifadə oluna bilər, Express eyni qaydaları özündə də tətbiq edir. `Asia/Baku` ilə ISO offset conversion və qəpik formatlaması vahid utility-də olmalıdır; `parseFloat` nəticəsini birbaşa qiymət göndərmək olmaz, onluq mətnindən təhlükəsiz qəpik integer parse edin.
5. Demo localStorage-dakı hesablar, admin rolları, saxta order-lər, şəkillər və stok **etibarlı istehsal məlumatı deyil**. Avtomatik olaraq Supabase-ə import etməyin. Buraxılışda yalnız ad məkanı/version üzrə mock key-ləri silin və ya ayrıca backup/export təklif edin; Supabase session storage-ını təsadüfən silməyin. Real seed yalnız dev/staging üçün, yoxlanmış və ayrıca icazəli mənbədən hazırlanır.
6. Rollar və görünürlük UI-də də əks etdirilir, lakin UI route guard backend authorization əvəzinə keçmir. Session/hesab dəyişəndə TanStack cache və əvvəlki istifadəçiyə aid local state təmizlənir.

## 11. Storage və media təhlükəsizliyi

`business-images`, `surprise-box-images`, `verification-documents` bucket-lərini private yaradın; sənəd bucket-i ayrıca və daha məhdud access-lidir. Browser Storage-a birbaşa upload etmir. `POST /uploads` serverdə session, biznes sahibini və purpose-u yoxlayır; 1 fayl üçün limit şəkillərdə 5 MiB, sənəddə 10 MiB-dir. `BUSINESS_IMAGE`/`BOX_IMAGE`: yalnız JPEG, PNG, WebP; `VERIFICATION_DOCUMENT`: JPEG, PNG, WebP və PDF. MIME header təkbaşına kifayət deyil: magic bytes, ölçü və parse yoxlanır, şəkillər təhlükəsiz decode/re-encode edilərək metadata silinir; SVG/HTML icra edilən fayllar qadağandır. PDF üçün təhlükəsizlik scanning/quarantine deployment imkanı varsa tətbiq edin, əks halda yalnız etibarlı admin baxışı və riskin qəbul edilməsi ilə pilot edin.

Server obyekt adını `businessId/randomUUID` formatında yaradır; client path seçə bilməz. Hər fayl DB upload qeydində sahibi və purpose ilə bağlanır. `imageFileId` cross-business və yanlış purpose olduqda `404`/`422` ilə rədd edilir. `GET /uploads/:id/access` public şəxsə URL-i yalnız fayl hazırda public `Business.imageFileId` və ya public `Box.imageFileId` kimi bağlanıbsa verir; sənədlər və bağlanmamış fayllar üçün yalnız həmin biznesin sahibi və ya admin. `url` 300 saniyəli signed URL-dir; artıq verilən URL müddəti bitənədək paylaşıla bilər, ona görə istifadəçi bu məhdudiyyəti bilməlidir. Linklər loglanmır və uzunmüddətli saxlanmır.

Upload Storage-da uğurlu, DB insert uğursuzdursa obyekt kompensasiya ilə silinir; uğursuz kompensasiyalar reconciliation job-a düşür. Bağlanmamış fayllar ən az 24 saatdan sonra, son istinadı tranzaksiyada yoxlanaraq təmizlənir; paralel bağlama ilə cleanup yarışı kilidlə idarə edilir. Rate, istifadəçi və biznes başına quota tətbiq olunur.

## 12. Təhlükəsizlik və əməliyyat müşahidəsi

- Hər obyekt üçün `owner_id`, reservation `customer_id` və ya reservation→box→business əlaqəsi yoxlanır; başqa hesabın göndərdiyi businessId, customerId və rol heç vaxt avtoritativ deyil. Admin yalnız server-side `ADMIN` ilə təmin olunur.
- HTTPS, HSTS, etibarlı frontend origin-ləri üçün dəqiq CORS allowlist, `helmet`, məhdud JSON/multipart ölçüsü, parametrli SQL, düzgün proxy/real-IP sazlaması, CSP və dependency/secret scanning tətbiq edin. CORS authorization deyil. Bearer token URL-də, local logda və analytics-də olmamalıdır.
- Auth əməliyyatlarını Supabase provider rate limit-ləri ilə, API-də IP və user üzrə search/upload/review/rezervasiya/pickup limitləri ilə qoruyun. Çox instansda shared store istifadə edin; ilkin nümunə `/reservations` 30 req/dəq/user, upload 10/dəq/user, pickup xüsusi §8.4 limiti; real hədlər load test ilə tənzimlənir.
- Əməliyyatlar üçün correlation ID, status code, latency, təhlükəsiz actor ID, operation və nəticə strukturlu loglanır. Email, ünvan, kod, token, secret və sənəd məzmunu loglanmır. Error rate, p95 API latency, 409 stock conflict, auth failure, expiry job lag, outbox backlog, backup və disk limitləri monitorinq edilir. PRD-nin 500 ms hədəfi adi API əməliyyatları üçün normal MVP yükündə hədəfdir; Auth/Storage kimi xarici xidmət gecikməsi xaricdir.
- Hər admin qərarı actor, target, reason və vaxt ilə audit edilir. Daxili kod və DB əməliyyatları test edilə bilən least-privilege prinsipi ilə bölünür; admin qərarında və biznes statusunda atomiklik qorunur.
- Təhlükəsizlik/hüquqi siyasətlər: şəxsi məlumatın retention/silinməsi, məxfiliyə dair bildiriş, allergen/ərzaq təhlükəsizliyi, hesablara giriş və qanuni sorğular pilotdan əvvəl məhsul/hüquq sahibi ilə təsdiqlənməlidir.

## 13. Deployment və mühitlər

| Mühit | Konfiqurasiya və iş qaydası |
|---|---|
| Lokal development | Ayrı Supabase local/dev layihəsi, `VITE_API_URL=http://localhost:5000/api/v1`, Express `PORT=5000`. Test seed və fake e-mail sink; production məlumatı istifadə olunmur. |
| Staging | Production-a bənzər ayrıca Supabase/Auth/Storage və Express/Vercel mühiti, ayrıca Auth redirect/CORS allowlist və test hesabları. Migration və E2E buradan keçirilir. |
| Production | Frontend Vercel, Express Render və ya ekvivalent Node host, ayrıca Supabase layihəsi; HTTPS, yalnız production origin/callback, server secret manager, plan üzrə backup/PITR imkanlarının yoxlanması. |

```env
# Frontend: yalnız public dəyərlər
VITE_API_URL=https://api.example.az/api/v1
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<publishable-or-anon-key>

# Backend: secret-lər server mühitində; heç biri VITE_ deyil
NODE_ENV=production
PORT=5000
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_PUBLISHABLE_KEY=<publishable-or-anon-key>
SUPABASE_SECRET_KEY=<server-only-secret-or-service-role-key>
DB_TRANSACTION_URL=<dedicated-limited-runtime-connection>
FRONTEND_URL=https://app.example.az
```

DB migration bağlantısı `DB_MIGRATION_URL` kimi yalnız CI/operator mühitində ayrı imtiyaz/secret ilə saxlanır; migration owner hüquqları runtime-da istifadə edilməməlidir. `PICKUP_DERIVATION_KEY_V1`, `PICKUP_HASH_KEY` və `IDEMPOTENCY_ENCRYPTION_KEY` operator tərəfindən server-side Vault-a ayrıca provision edilir; frontend env-ə və runtime SQL parametrlərinə qoyulmur. Key rotation, expiry zamanı köhnə pickup açarlarının retention-u və sirrlərin itməsi proseduru yazılı olmalıdır. İstehsalda Auth redirect URL-ləri dəqiq allowlist edilir. Məxfi dəyərləri `.env.example`-da yalnız placeholder kimi göstərin.

**CI/CD ardıcıllığı:** dependency lockfile ilə install → lint/typecheck → unit test → ayrı ephemeral/staging Supabase-də migration və integration/RLS/concurrency testləri → frontend və backend build → staging deploy və Playwright smoke → backup yoxlanışı + təsdiqli migration → production deploy → health və əsas axın yoxlaması. Schema dəyişikliklərini backward-compatible expand/contract mərhələləri ilə edin; problem zamanı application rollback və əvvəlcədən hazırlanmış DB forward-fix/restore prosedurunu tətbiq edin. `GET /health/live` kimi load balancer probe tətbiqi API müqaviləsindən ayrıca, secret-siz yalnız proses statusu verir; DB-yə bağlı readiness üçün ayrıca daxili probe tətbiq oluna bilər.

Worker expiry/outbox üçün ayrıca idarə olunan proses və ya platformanın schedule mexanizmi tələb edir; Express serverinin bir instansının işləməsinə güvənməyin. Ölçülmüş backup restore testi, monitorinq və incident runbook pilot şərtidir. Bildiriş provider-i yoxdursa outbox gecikir, amma rezervasiya transaction-ı uğurlu ola bilər; UI bunu e-poçt çatdırılması ilə qarışdırmır.

## 14. Test planı və acceptance checklist

**Unit (Vitest):** Zod input/unknown field, qiymət və təhlükəsiz qəpik hesablaması, status transition matrisi, cancellation cutoff və exact boundary, UTC/Asia-Baku offset conversion, Haversine və query validation, DTO sahə redaksiyası, owner/role qaydaları, pickup normalize/digest, idempotency hash, dashboard hesablaması.

**DB və HTTP inteqrasiya (Supertest + ayrıca Supabase test DB):** signup trigger/default rol; sign-in, email verification və suspended hesab; bir neçə biznes sahibinin izolyasiyası; application draft→pending→approve/reject və iki adminin eyni müraciətə paralel qərarı; box qiymət/vaxt/fayl və business verified yoxlamaları; reservation transaction və snapshot; review yalnız tamamlanmış order üçün və UNIQUE; complaint target icazəsi; bütün admin auditləri və DB rollback; RLS/grant-ların anon/authenticated üçün bypass olunmaması; Storage-da sahiblik, signed link müddəti və magic-byte yoxlaması. Test DB heç vaxt production olmamalıdır.

**Concurrency və failure injection:**

1. `availableQuantity=1` qutuya ən az 20 ayrı actor/key ilə eyni anda rezervasiya: tam 1 `201`, qalanları `409`, final stok `0`, 1 təsdiqli reservation; mənfi stok yoxdur.
2. Eyni actor/key ilə eyni POST-u paralel 20 dəfə: hamısı eyni `201` və reservation ID qaytarmalı, yalnız bir stok azalması olmalıdır. Eyni key + fərqli body `409`.
3. Fərqli key-lər ilə son qutu yarışında düzgün bir qalib; kifayət edən stokda neçə uğurlu reservation varsa miqdarlar cəmi stok azalmasına bərabərdir.
4. İki cancel, cancel-vs-pickup, cancel-vs-expiry, reservation-vs-deactivation/suspension və quantity edit-vs-reservation yarışlarını təkrarlayın; yalnız qanuni keçid, maksimum bir stock bərpası, ayrıca event/outbox və audit bütövlüyü olmalıdır.
5. `pickupEnd` tam sərhədində rezervasiya və pickup rədd, effective `EXPIRED`; `pickupStart` tam sərhədində müştəri ləğvi rədd, düzgün pickup qəbul. Kilid gözləmə pickupEnd-dən əvvəl başlayıb sonra bitirsə rədd olunur.
6. DB xətasını stok update-dən sonra, event/outbox insert-dən əvvəl və commit-dən sonra response itkisində simulyasiya edin: rollback yarımçıq stok yaratmır; commit sonrası eyni key replay ilə nəticə bərpa edilir. Worker-i iki instansda təkrar işə salın, duplicate terminal event/stock restore yaranmasın.
7. Pickup üçün səhv kod və 5 cəhd limiti, kodun başqa biznes tərəfindən yoxlanması, suspend edilmiş hesabın köhnə tokeni, uydurulmuş actor/role, birbaşa RPC/table çağırışı və service key-in frontend bundle-a düşməsi test edilir.

**E2E (Playwright):** qeydiyyat və e-poçt təsdiqi → biznes müraciəti → admin təsdiqi → şəkil upload və box yaratma → müştərinin məsafə/qiymət/vaxt filtrləri → rezervasiya və order tarixi → sahibin kodla götürməni təsdiqi → rəy → şikayət və admin həlli. Yanlış kod, expiry, ləğv, başqa biznesin məlumatına çıxış və expired session ayrıca yoxlanır. Media və bildiriş asılılıqları üçün həm real staging smoke, həm deterministic test double istifadə edilir.

**Buraxılış meyarları:** PRD/TRD-dəki kritik axınlar işləməli; avtomatik testlər, RLS və concurrency keçməli; backup restore yoxlanmalı; həssas credential frontenddə olmamalı; mövcud stok və statuslar yalnız serverdən gəlməli; çatdırılmayan e-poçt rezervasiyanı pozmamalı; ölçülən p95 və xəta dərəcəsi pilot hədəflərinə uyğun olmalıdır. Onlayn payment axını, ödəniş təsdiqi və refund bu buraxılışın heç bir hissəsində mövcud deyil.

## 15. Bu frontend demosu ilə müqavilə arasındakı konkret fərqlər

Bu sənəd server üçün təklif edilən dizayndır, mövcud mock-un canlı API implementasiyası deyil. İnteqrasiya zamanı aşağıdakı fərqləri qəsdən həll edin və məhsul sahibi ilə təsdiqləyin:

- `src/store.tsx` yeni rezervasiyanı `PENDING` yaradır və biznesin ayrıca təsdiqini göstərir; §1 və §6-dakı təklif edilən API isə birbaşa `CONFIRMED` yaradır. Real inteqrasiyada ya UI-dən həmin əlavə təsdiq addımını çıxarın, ya da backend müqaviləsini dəyişdirin; ikisini səssiz qarışdırmayın.
- Demo müştəri və biznes rollarını ayırır, təklif olunan backend `BUSINESS_OWNER` üçün müştəri imkanlarına da icazə verir. Role mapping və route guard-ları serverdən gələn rola uyğun yeniləyin.
- Demo götürülmə zamanı başlanğıc, bitiş və kodu brauzerdə yoxlayır; server eyni yoxlamaları ayrıca, atomik və etibarlı şəkildə tətbiq etməlidir.
- Demo ləğv zamanı deaktiv təklifin daxili qalığını bərpa edir, amma deaktiv təklifi ictimai göstərmir. Bu davranışın server tranzaksiyasında təkrar icra qarşısı alınmalıdır.
- Demo AZN məbləğlərini `price`/`originalPrice` onluq rəqəmi kimi saxlayır; real API-də `discountedPriceMinor`/`originalPriceMinor` tam qəpikdir. DTO adapterlərində təhlükəsiz çevirmə edin. Demo kateqoriyaları Azərbaycan dilindədir, server enum-ları ilə açıq mapping lazımdır.
- Demo biznes təsdiq məlumatını və yerli şəkil seçimini yalnız brauzerdə saxlayır; serverə real upload etmir. Real sistemdə ayrıca biznes qaralaması, verification faylları, upload və müraciət addımlarını qurun.
- Demo eyni brauzerdəki `localStorage` state və icazələrdən istifadə edir, yarış təhlükəsizliyi və doğrulama təmin etmir. Real serverdə səlahiyyət, istifadəçi identifikasiyası, validasiya, idempotency və atomik inventar mütləq serverdə tətbiq olunmalıdır.
