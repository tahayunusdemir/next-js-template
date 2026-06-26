'use client';

import { useTranslations } from 'next-intl';
import * as React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cineRoles, getCineTypesByRole } from '@/data/cinetype';
import { CineTypeCard } from './cinetype-card';

// Role-filterable grid of all 16 types. Tabs act as the segmentation control;
// 16 items don't warrant numeric pagination.
export function CineDirectory() {
  const tPage = useTranslations('CineTypePage');
  const t = useTranslations('CineType');
  const [filter, setFilter] = React.useState('all');

  const visibleRoles =
    filter === 'all' ? cineRoles : cineRoles.filter((role) => role.slug === filter);

  return (
    <div>
      <Tabs
        value={filter}
        onValueChange={(value) => {
          setFilter(String(value));
        }}
        className="items-center"
      >
        <TabsList className="h-auto max-w-full flex-wrap justify-center">
          <TabsTrigger value="all">{tPage('filter_all')}</TabsTrigger>
          {cineRoles.map((role) => (
            <TabsTrigger key={role.slug} value={role.slug}>
              {t(`role_${role.slug}_name`)}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <div className="mt-12 space-y-16">
        {visibleRoles.map((role) => (
          <section key={role.slug} aria-labelledby={`role-${role.slug}`}>
            <div className="mx-auto max-w-2xl text-center">
              <h3
                id={`role-${role.slug}`}
                className="font-heading text-2xl font-semibold tracking-tight"
              >
                {t(`role_${role.slug}_name`)}
              </h3>
              <p className="mt-2 text-sm text-pretty text-muted-foreground">
                {t(`role_${role.slug}_description`)}
              </p>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {getCineTypesByRole(role.slug).map((type) => (
                <CineTypeCard key={type.code} type={type} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
