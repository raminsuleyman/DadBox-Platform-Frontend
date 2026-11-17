# PayBox — icra planı

## Məqsəd və texnologiya
PRD/TRD-dəki Bakı yönümlü sürpriz qutu marketpleysini Azərbaycan dilində, React + TypeScript + Vite əsasında işlək mock frontend kimi hazırlamaq. Bütün üç rolun əsas axınları brauzer daxilində imitasiya edilir və localStorage-da saxlanır; heç bir real backend, autentifikasiya, ödəniş və ya təhlükəsizlik təminatı olduğunu iddia etmir. Backend üçün ayrıca Node/Express/Supabase inteqrasiya və endpoint təlimatı təqdim edilir. Layihə müstəqil işlədilə bilən mənbə kodu və istifadə qaydaları ilə ZIP-ə yığılır.

## Dizayn istiqamətləri
- Editorial neighborhood market (0.07): Təbii tonlar, redaksiya tipoqrafiyası və dürüst qida fotoqrafiyası.
- Modern civic utility (0.05): Aydın grid, mavi və neytral rəngli praktik idarəetmə.
- Friendly corner shop (0.04): Canlı rəngli, iri kartlı və oyuncaq illüstrasiyalı interfeys.

## Seçilmiş istiqamət: Editorial neighborhood market
- **Hərəkat:** Müasir redaksiya dizaynı ilə yerli ərzaq dükanı estetikası.
- **Prinsiplər:** Mehriban və anlaşıqlı dil; praktik hərəkətlər; əlçatan kontrast; real yeməyin ön planda olması.
- **Rəng fəlsəfəsi:** Tünd meşə yaşılı etibar və davamlılığı, yumşaq krem fon istilik və yaxınlığı, portağal məhdud sayda enerji və endirimləri ifadə edir.
- **Quruluş:** Enli redaksiya başlığı, asimmetrik vizual hero, axtarış üçün əlçatan sahə və aydın kart sıraları; idarəetmədə yığcam yan naviqasiya.
- **İmza elementləri:** Dairəvi yarpaq nişanı, foto üzərində kiçik məlumat nişanları, canlı status çipləri.
- **İnteraksiya:** Əsas düymələr aydın; rezervasiya, inventar, status və səhv təsdiqləri dərhal göstərilir.
- **Animasiya:** Yalnız sürətli və sakit hover keçidləri; prefers-reduced-motion dəstəyi.
- **Tipoqrafiya:** Başlıqlar üçün Georgia serif, interfeys üçün system sans; aydın ölçü iyerarxiyası.
- **Brend mahiyyəti:** PayBox — yaxınlıqdakı dadlı fürsətləri daha sərfəli qiymətlə kəşf edən şüurlu şəhərlilər üçün marketpleys. Səmimi, nikbin, etibarlı.
- **Brend səsi:** Sadə və mühakiməsiz. Nümunələr: “Yaxşı yeməyin ikinci şansı.” / “Yaxınlıqdakı dadlı fürsətləri kəşf et.”
- **Loqo:** Xüsusi dairəvi yarpaq/formalı ikon və səliqəli kiçik hərfli paybox wordmark.
- **İmza rəngi:** Tünd şam yaşılı #173f35.

## Modul quruluşu
- `src/types.ts`, `src/mockData.ts`, `src/store.tsx`: modellər, mock məlumat və localStorage əməliyyatları.
- `src/pages/`: kəşf, təklif detalları, müştəri, biznes və idarəçi səhifələri.
- `src/components/`: ümumi naviqasiya və UI komponentləri.
- `src/styles/`: responsive stil sistemləri.
- `docs/BACKEND_GUIDE.md`: server və inteqrasiya spesifikasiyası.
- `README.md`: quraşdırma, demo rolları, məhdudiyyətlər və arxiv strukturu.
