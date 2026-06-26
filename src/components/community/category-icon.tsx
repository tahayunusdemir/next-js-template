import {
  ClapperboardIcon,
  FingerprintIcon,
  GhostIcon,
  HeartIcon,
  NewspaperIcon,
  RocketIcon,
  ShieldIcon,
  SparklesIcon,
  SwordsIcon,
  Wand2Icon,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// Maps the icon name stored on each community category to its lucide component.
const ICONS: Record<string, LucideIcon> = {
  Swords: SwordsIcon,
  Sparkles: SparklesIcon,
  Fingerprint: FingerprintIcon,
  Clapperboard: ClapperboardIcon,
  Wand2: Wand2Icon,
  Ghost: GhostIcon,
  Newspaper: NewspaperIcon,
  Heart: HeartIcon,
  Rocket: RocketIcon,
  Shield: ShieldIcon,
};

// Renders a category's lucide icon by name, falling back to a neutral glyph.
export function CategoryIcon(props: { name: string; className?: string }) {
  const Icon = ICONS[props.name] ?? NewspaperIcon;

  return <Icon className={props.className} />;
}
