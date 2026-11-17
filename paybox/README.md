# PayBox — sürpriz qutu marketpleysi (frontend demo)

PayBox, Bakıdakı yerli qida bizneslərini müştərilərlə birləşdirən sürpriz qutu marketpleysinin Azərbaycan dilli React + TypeScript + Vite frontend prototipidir. Bu arxiv PRD/TRD əsasında hazırlanmış müştəri, biznes və administrator interfeyslərini, lokal demo məlumatları və ayrıca backend inteqrasiya təlimatını ehtiva edir.

## Sürətli başlama

**Tələblər:** Node.js 22.13 və ya daha yeni versiya və pnpm 11. (Lazım olduqda `corepack enable` və `corepack prepare pnpm@11.25.0 --activate`.)

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Brauzerdə `http://localhost:3000` açın. Production build və preview:

```bash
pnpm build
pnpm preview
```

## Demo rolları və məlumatlar

Başlıqda **Daxil ol** bölməsinə keçin və demo rol düymələrindən müştəri, biznes və ya administratoru seçin. Eyni brauzerdə rollar arasında keçərək bir rolun yaratdığı dəyişiklikləri digərində görə bilərsiniz. Nümunə hesablar: `musteri@paybox.az`, `biznes@paybox.az`, `admin@paybox.az`. Giriş demo simulyasiyasıdır: mövcud e-poçt və istənilən ən azı 6 simvollu demo şifrə qəbul edilir; şifrələr saxlanılmır və yoxlanılmır. **Real, şəxsi və ya başqa yerdə istifadə etdiyiniz şifrələri daxil etməyin.**

Müştəri qutunu seçib rezervasiya edir, biznes rezervasiyanı təsdiqləyir və kodla götürülməni qeyd edir, admin biznes müraciətini və moderasiyanı idarə edir. Məhsul sifariş zamanı ödənilmir; ödənişin götürmə yerində edilməsi göstərilir.

Bütün məlumatlar yalnız cari brauzerin `localStorage` yaddaşında saxlanılır, başqa cihazlara sinxronlaşmır və brauzer məlumatlarını təmizlədikdə itir. Profil səhifəsində demo məlumatlarını sıfırlamaq olar. İlkin təkliflərin götürmə vaxtı demo yaradılan ana nisbətəndir; müddət bitdikdə demo məlumatlarını sıfırlayın. Demo məsafələr Bakı mərkəzindən təxmini, sabit rəqəmlərdir; cihazın yeri və ya marşrut hesablanmır. Ödəniş, e-poçt, real autentifikasiya, fayl saxlama və server yoxdur. Ekranda yaradılan müraciətlər və bildirişlər həqiqi dünyada göndərilmir.

**Təhlükəsizlik:** brauzer tərəfli rol məhdudiyyətləri və localStorage istehsalat təhlükəsizliyi deyil. Demo eyni serverə bağlı çoxsaylı istifadəçi əməliyyatları arasında oversell qarşısını almaq üçün nəzərdə tutulmayıb. Real sistemdə bütün validasiya, atomik inventar, icazə və server tərəfli autentifikasiya `docs/BACKEND_GUIDE.md`-də izah olunduğu kimi qurulmalıdır. Frontend AZN qiymətlərini demo rahatlığı üçün onluq ədədlə göstərir; backend üçün təlimatda göstərilən qəpik vahidinə çevrilməlidir.

## Struktur

- `src/pages` — kəşf, qutu/biznes detalları, müştəri, biznes, admin səhifələri.
- `src/components` — təkrar istifadə edilən interfeys komponentləri.
- `src/types.ts`, `src/mockData.ts`, `src/store.tsx` — demo modellər, məlumat və əməliyyatlar.
- `src/styles` — responsive dizayn.
- `public/images` — arxivə daxil edilmiş şəkillər; ayrıca şəbəkə bağlantısı tələb etmir.
- `docs/BACKEND_GUIDE.md` — endpoint kataloqu, verilənlər bazası, təhlükəsizlik, tranzaksiya və inteqrasiya planı.
- `docs/ORIGINAL_PRD_TRD.md` — təqdim edilən ilkin tələblər.

Şriftlər Google Fonts-dan yüklənə bilər; şəbəkə olmadıqda sistem/Georgia ehtiyat şriftləri istifadə olunur. Demo fotoşəkillər Unsplash üzərindən tapılmış nümunə şəkillərdir və istehsalata keçməzdən əvvəl seçilmiş istifadəyə dair hüquqlar və brend tələbləri yenidən yoxlanmalıdır.

## Avtomatik testlər

`pnpm test` demo store-un rezervasiya miqdarı, ehtiyatın bərpası, icazə, sifarişin təsdiqi/götürülməsi və rəy qaydalarını yoxlayır. Bunlar real backend tranzaksiya və çox istifadəçili concurrency testlərini əvəz etmir; server testləri backend təlimatında ayrıca göstərilir.

## Texniki seçim və PRD-dən fərq

İşlək demo React, TypeScript, Vite, React Router, Lucide ikonları və modul CSS istifadə edir. Dizayn **Tailwind/shadcn komponentləri ilə deyil, custom CSS ilə** qurulub; mock state React Context və localStorage ilə idarə olunur. `@tanstack/react-query`, `react-hook-form` və `zod` paketləri gələcək inteqrasiyaya hazırlıq üçün asılılıqlarda mövcuddur, lakin hazırkı demo onların üzərində qurulmayıb. Real API-yə keçərkən bu seçimlər PRD/TRD-yə uyğun yenidən tətbiq edilməlidir. E-poçt təsdiqi və şifrə bərpasının canlı göndərişi, həqiqi storage və autentifikasiya mövcud deyil. Brauzer tabları məlumat dəyişikliklərini qəbul edir, lakin eyni anda aparılan yazılar üçün tranzaksiya zəmanəti yoxdur.
