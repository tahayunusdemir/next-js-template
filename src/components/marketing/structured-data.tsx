import { useTranslations } from 'next-intl';
import { formatPrice, PLANS } from '@/lib/plans';
import { AppConfig } from '@/utils/AppConfig';
import { getBaseUrl } from '@/utils/Helpers';

// Emits JSON-LD (Organization, WebSite, FAQPage, Product) so the landing page is
// eligible for rich results. Copy is sourced from the same i18n keys shown on-page.
export function StructuredData() {
  const tLanding = useTranslations('LandingPage');
  const tFaq = useTranslations('Faq');
  const tPricing = useTranslations('Pricing');

  const baseUrl = getBaseUrl();

  const faqItems = [
    { question: tFaq('q1'), answer: tFaq('a1') },
    { question: tFaq('q2'), answer: tFaq('a2') },
    { question: tFaq('q3'), answer: tFaq('a3') },
    { question: tFaq('q4'), answer: tFaq('a4') },
    { question: tFaq('q5'), answer: tFaq('a5') },
    { question: tFaq('q6'), answer: tFaq('a6') },
  ];

  // Sourced from the plan catalog so JSON-LD prices never drift from the page.
  const offers = PLANS.map((plan) => ({
    name: tPricing(`${plan.id}_name`),
    price: formatPrice(plan.monthly),
  }));

  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': `${baseUrl}/#organization`,
        name: AppConfig.name,
        url: baseUrl,
        sameAs: ['https://www.linkedin.com/company/cinepersona'],
      },
      {
        '@type': 'WebSite',
        '@id': `${baseUrl}/#website`,
        url: baseUrl,
        name: AppConfig.name,
        description: tLanding('meta_description'),
        publisher: { '@id': `${baseUrl}/#organization` },
      },
      {
        '@type': 'Product',
        name: AppConfig.name,
        description: tLanding('meta_description'),
        brand: { '@type': 'Brand', name: AppConfig.name },
        offers: offers.map((offer) => ({
          '@type': 'Offer',
          name: offer.name,
          price: offer.price,
          priceCurrency: 'USD',
          availability: 'https://schema.org/InStock',
        })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${baseUrl}/#faq`,
        mainEntity: faqItems.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD requires raw script content
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
