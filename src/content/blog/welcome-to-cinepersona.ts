import type { BlogPost } from '@/libs/Blog';

export const welcomeToCinePersona: BlogPost = {
  slug: 'welcome-to-cinepersona',
  date: '2026-06-26',
  author: 'taha',
  tags: ['product'],
  featured: true,
  content: {
    en: {
      title: 'Meet CinePersona: the cinema persona behind your taste',
      description:
        'What CinePersona is, how the CineTest works, and how it turns your film taste into recommendations and real connection.',
      blocks: [
        {
          type: 'paragraph',
          text: 'Finding your next great film — and someone to watch it with — is harder than it should be. Your taste is scattered across endless watchlists and feeds, and most recommendations feel like they were made for everyone except you. CinePersona turns that taste into something you can actually use: a cinema persona that understands how you watch.',
        },
        { type: 'heading', text: 'Discover your CineType' },
        {
          type: 'paragraph',
          text: 'It starts with the CineTest — 48 quick, film-first questions with no right or wrong answers. In about five minutes it maps how you watch, feel, and choose onto one of sixteen cinema personas: your CineType.',
        },
        {
          type: 'paragraph',
          text: 'Every CineType is built from where you land across four dimensions:',
        },
        {
          type: 'list',
          items: [
            'Gaze — watching alone and absorbed, or together and social',
            'Eye — chasing the spectacle, or the meaning',
            'Pulse — surrendering to feeling, or reading the craft',
            'Compass — returning to favorites, or chasing the frontier',
          ],
        },
        { type: 'heading', text: 'Recommendations tuned to you' },
        {
          type: 'paragraph',
          text: 'Your CineType powers film picks built around your taste — by genre, mood, era, and vibe. The more you watch and rate, the sharper they get, so the next thing worth watching is always close.',
        },
        { type: 'heading', text: 'Find your people' },
        {
          type: 'paragraph',
          text: 'Taste is better shared. Match with viewers who love the same films, follow the ones you click with, join discussions across every genre, and host Movie Nights where you pick and watch together.',
        },
        {
          type: 'callout',
          variant: 'tip',
          text: 'CinePersona is free to start. Create an account, take the CineTest, and explore your persona — no credit card required.',
        },
        { type: 'heading', text: 'Start in minutes' },
        {
          type: 'paragraph',
          text: 'Take the CineTest, meet your CineType, and let your taste lead the way to films made for you and people who watch like you do.',
        },
      ],
    },
    tr: {
      title: 'CinePersona ile tanışın: zevkinizin ardındaki sinema kişiliği',
      description:
        'CinePersona nedir, CineTest nasıl çalışır ve film zevkinizi nasıl önerilere ve gerçek bağlara dönüştürür?',
      blocks: [
        {
          type: 'paragraph',
          text: 'Bir sonraki harika filmi — ve onu birlikte izleyecek birini — bulmak olması gerekenden zor. Zevkiniz sonu gelmeyen izleme listeleri ve akışlar arasında dağılmış durumda ve çoğu öneri sizden herkes için yapılmış gibi geliyor. CinePersona bu zevki gerçekten işe yarar bir şeye dönüştürür: nasıl izlediğinizi anlayan bir sinema kişiliği.',
        },
        { type: 'heading', text: 'CineType’ınızı keşfedin' },
        {
          type: 'paragraph',
          text: 'Her şey CineTest ile başlar — doğru ya da yanlış cevabı olmayan 48 kısa, film odaklı soru. Yaklaşık beş dakikada nasıl izlediğinizi, hissettiğinizi ve seçtiğinizi on altı sinema kişiliğinden birine eşler: CineType’ınıza.',
        },
        {
          type: 'paragraph',
          text: 'Her CineType, dört boyutta nerede durduğunuzdan oluşur:',
        },
        {
          type: 'list',
          items: [
            'Bakış — tek başına ve kendinden geçerek mi, birlikte ve sosyal mi izlemek',
            'Göz — gösteriyi mi, anlamı mı kovalamak',
            'Nabız — duyguya kapılmak mı, ustalığı okumak mı',
            'Pusula — favorilere dönmek mi, sınırı kovalamak mı',
          ],
        },
        { type: 'heading', text: 'Size göre ayarlanmış öneriler' },
        {
          type: 'paragraph',
          text: 'CineType’ınız, zevkinize göre kurulmuş film önerilerini besler — tür, mod, dönem ve atmosfere göre. İzledikçe ve puanladıkça keskinleşir; böylece izlemeye değer bir sonraki film her zaman elinizin altındadır.',
        },
        { type: 'heading', text: 'Sizin gibilerini bulun' },
        {
          type: 'paragraph',
          text: 'Zevk paylaşılınca daha güzel. Aynı filmleri seven izleyicilerle eşleşin, anlaştıklarınızı takip edin, her türde tartışmalara katılın ve birlikte film seçip izlediğiniz Film Geceleri düzenleyin.',
        },
        {
          type: 'callout',
          variant: 'tip',
          text: 'CinePersona’ya başlamak ücretsiz. Bir hesap oluşturun, CineTest’i çözün ve kişiliğinizi keşfedin — kredi kartı gerekmez.',
        },
        { type: 'heading', text: 'Dakikalar içinde başlayın' },
        {
          type: 'paragraph',
          text: 'CineTest’i çözün, CineType’ınızla tanışın ve bırakın zevkiniz sizi size özel filmlere ve sizin gibi izleyen insanlara götürsün.',
        },
      ],
    },
  },
};
