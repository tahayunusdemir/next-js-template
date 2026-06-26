import { useTranslations } from 'next-intl';
import { Badge } from '@/components/ui/badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Link } from '@/libs/I18nNavigation';
import type { CineType } from '@/types/CineType';
import { CineLetterChips } from './cinetype-letter-chips';

// Detail-page hero: breadcrumb, four-letter code, name, role, optional epigraph.
export function CineProfileHeader(props: { type: CineType }) {
  const t = useTranslations('CineType');
  const tDetail = useTranslations('CineTypeDetailPage');
  const name = t(`${props.type.slug}_name`);

  return (
    <section className="border-b border-dashed">
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 sm:py-20">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href="/cinetype">{tDetail('breadcrumb_root')}</Link>} />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{name}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mt-10 text-center">
          <p className="font-heading text-5xl font-semibold tracking-tight sm:text-6xl">
            {props.type.code}
          </p>
          <Badge variant="outline" className="mt-4">
            {t(`role_${props.type.roleSlug}_name`)}
          </Badge>
          <h1 className="mt-4 font-heading text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {name}
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-base text-pretty text-muted-foreground sm:text-lg">
            {t(`${props.type.slug}_tagline`)}
          </p>
          <blockquote className="mx-auto mt-6 max-w-xl border-l-2 pl-4 text-left text-sm text-pretty text-muted-foreground italic">
            {t(`${props.type.slug}_epigraph`)}
          </blockquote>
        </div>

        <CineLetterChips type={props.type} className="mx-auto mt-10 max-w-md" />
      </div>
    </section>
  );
}
