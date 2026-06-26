import { SiThemoviedatabase } from '@icons-pack/react-simple-icons';
import { useTranslations } from 'next-intl';
import { LinkedinIcon } from '@/components/icons/linkedin-icon';
import { LanguageToggleGroup } from '@/components/language-toggle-group';
import { Brand } from '@/components/marketing/brand';
import { NewsletterForm } from '@/components/marketing/newsletter-form';
import { ThemeToggleGroup } from '@/components/theme-toggle-group';
import { Link } from '@/libs/I18nNavigation';
import { AppConfig } from '@/utils/AppConfig';

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
      heading: t('col_explore'),
      links: [
        { label: t('link_films'), href: '/films' },
        { label: t('link_community'), href: '/community' },
        { label: t('link_cinetype'), href: '/cinetype' },
        { label: t('link_cinetest'), href: '/cinetest' },
        { label: t('link_cinematch'), href: '/cinematch' },
      ],
    },
    {
      heading: t('col_company'),
      links: [
        { label: t('link_about'), href: '/about' },
        { label: t('link_blog'), href: '/blog' },
        { label: t('link_pricing'), href: '/pricing' },
      ],
    },
    {
      heading: t('col_legal'),
      links: [
        { label: t('link_privacy'), href: '/privacy' },
        { label: t('link_terms'), href: '/terms' },
        { label: t('link_contact'), href: '/about#contact' },
      ],
    },
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
              <a
                href="https://www.linkedin.com/company/cinepersona"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t('social_linkedin')}
                className="flex size-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <LinkedinIcon className="size-4.5" />
              </a>
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
        <div className="mt-12 border-t pt-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              {t('copyright', { year: new Date().getFullYear(), name: AppConfig.name })}
            </p>
            <div className="flex items-center gap-3">
              <ThemeToggleGroup />
              <LanguageToggleGroup />
            </div>
          </div>

          {/* TMDB attribution — required by the TMDB API terms of use. */}
          <a
            href="https://www.themoviedb.org"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            <SiThemoviedatabase className="size-4 shrink-0" color="currentColor" />
            {t('tmdb_attribution')}
          </a>
        </div>
      </div>
    </footer>
  );
}
