import { SiGithub, SiX } from '@icons-pack/react-simple-icons';
import { useTranslations } from 'next-intl';
import { LanguageToggleGroup } from '@/components/language-toggle-group';
import { Brand } from '@/components/marketing/brand';
import { NewsletterForm } from '@/components/marketing/newsletter-form';
import { ThemeToggleGroup } from '@/components/theme-toggle-group';
import { Link } from '@/libs/I18nNavigation';
import { AppConfig } from '@/utils/AppConfig';

// Minimal LinkedIn glyph — the brand mark is restricted in the icon set.
function LinkedinIcon(props: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={props.className} fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.225 0z" />
    </svg>
  );
}

const linkClassName = 'text-sm text-muted-foreground transition-colors hover:text-foreground';

// Routes go through the locale-aware Link; bare anchors stay as placeholders.
function FooterLink(props: { href: string; children: React.ReactNode }) {
  if (props.href.startsWith('/')) {
    return (
      <Link href={props.href} className={linkClassName}>
        {props.children}
      </Link>
    );
  }
  return (
    <a href={props.href} className={linkClassName}>
      {props.children}
    </a>
  );
}

export function MarketingFooter() {
  const t = useTranslations('MarketingFooter');

  const columns = [
    {
      heading: t('col_product'),
      links: [
        { label: t('link_features'), href: '/#features' },
        { label: t('link_pricing'), href: '/pricing' },
        { label: t('link_faq'), href: '/#faq' },
      ],
    },
    {
      heading: t('col_company'),
      links: [
        { label: t('link_about'), href: '/about' },
        { label: t('link_blog'), href: '#' },
        { label: t('link_careers'), href: '#' },
      ],
    },
    {
      heading: t('col_legal'),
      links: [
        { label: t('link_privacy'), href: '#' },
        { label: t('link_terms'), href: '#' },
        { label: t('link_contact'), href: '/about#contact' },
      ],
    },
  ];

  const socials = [
    { label: t('social_github'), href: 'https://github.com', Icon: SiGithub },
    { label: t('social_x'), href: 'https://x.com', Icon: SiX },
    { label: t('social_linkedin'), href: 'https://linkedin.com', Icon: LinkedinIcon },
  ];

  return (
    <footer className="bg-muted/30">
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
          {/* Brand + social */}
          <div>
            <Brand />
            <p className="mt-4 max-w-xs text-sm text-pretty text-muted-foreground">
              {t('tagline')}
            </p>
            <div className="mt-6 flex items-center gap-1">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <social.Icon className="size-4.5" color="currentColor" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-3 gap-8">
            {columns.map((column) => (
              <div key={column.heading}>
                <h3 className="text-sm font-medium">{column.heading}</h3>
                <ul className="mt-4 space-y-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <FooterLink href={link.href}>{link.label}</FooterLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter */}
          <div className="md:col-span-2 lg:col-span-1">
            <h3 className="text-sm font-medium">{t('newsletter_title')}</h3>
            <p className="mt-4 text-sm text-muted-foreground">{t('newsletter_description')}</p>
            <div className="mt-4">
              <NewsletterForm />
            </div>
          </div>
        </div>

        {/* Bottom bar: copyright + appearance & language preferences */}
        <div className="mt-12 flex flex-col gap-6 border-t pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {t('copyright', { year: new Date().getFullYear(), name: AppConfig.name })}
          </p>
          <div className="flex items-center gap-3">
            <ThemeToggleGroup />
            <LanguageToggleGroup />
          </div>
        </div>
      </div>
    </footer>
  );
}
