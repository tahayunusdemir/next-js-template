'use client';

import { useTranslations } from 'next-intl';
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { Link, usePathname } from '@/libs/I18nNavigation';
import type { NavBadge, NavGroup } from '@/navigation/sidebar-items';

// Normalizes a path so trailing-slash differences don't break active matching.
function normalize(path: string) {
  return path.replace(/\/+$/u, '') || '/';
}

function NavItemBadge(props: { badge?: NavBadge }) {
  if (!props.badge) {
    return null;
  }

  return (
    <SidebarMenuBadge
      className={cn(
        'rounded-sm border capitalize',
        props.badge === 'new' && 'border-green-600 text-green-600',
        props.badge === 'soon' && 'border-muted-foreground text-muted-foreground',
      )}
    >
      {props.badge}
    </SidebarMenuBadge>
  );
}

export function NavMain(props: { groups: NavGroup[] }) {
  const t = useTranslations('DashboardLayout');
  const pathname = normalize(usePathname());

  return (
    <>
      {props.groups.map((group) => (
        <SidebarGroup key={group.id}>
          {group.labelKey && <SidebarGroupLabel>{t(group.labelKey)}</SidebarGroupLabel>}
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              {group.items.map((item) => {
                const url = normalize(item.url);
                const title = t(item.titleKey);
                // The dashboard root only matches exactly; nested routes match prefixes.
                const isActive = url === '/dashboard' ? pathname === url : pathname.startsWith(url);
                const Icon = item.icon;

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      tooltip={title}
                      isActive={isActive}
                      aria-disabled={item.disabled}
                      render={<Link href={item.url} />}
                    >
                      <Icon />
                      <span>{title}</span>
                    </SidebarMenuButton>
                    <NavItemBadge badge={item.badge} />
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
