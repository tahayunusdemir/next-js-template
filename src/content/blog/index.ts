import type { BlogPost } from '@/libs/Blog';
import { welcomeToCinePersona } from './welcome-to-cinepersona';

/** All blog posts. Order here is irrelevant — lists are sorted by date in `Blog.ts`. */
export const posts: BlogPost[] = [welcomeToCinePersona];
