import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { vaultLoader } from './lib/vault';

// Obsidian 속성(Properties)은 비어 있으면 null 이 되므로 빈 배열로 맞춘다.
const list = z
  .union([z.array(z.string()), z.string()])
  .nullish()
  .transform((v) => (v == null ? [] : Array.isArray(v) ? v : [v]));
const optionalDate = z.coerce.date().nullish().transform((v) => v ?? undefined);
const optionalText = z.string().nullish().transform((v) => v || undefined);

const wiki = defineCollection({
  loader: vaultLoader('wiki'),
  schema: z.object({
    title: z.string(),
    description: optionalText,
    // 비워두면 폴더 경로가 카테고리가 된다 (예: wiki/dev/redis.md → dev)
    category: optionalText,
    tags: list,
    created: optionalDate,
    updated: optionalDate,
    draft: z.boolean().nullish().transform((v) => v ?? false),
  }),
});

const projects = defineCollection({
  loader: vaultLoader('projects'),
  schema: z.object({
    title: z.string(),
    summary: optionalText,
    period: optionalText,
    role: optionalText,
    stack: list,
    tags: list,
    github: optionalText,
    demo: optionalText,
    thumbnail: optionalText,
    featured: z.boolean().nullish().transform((v) => v ?? false),
    order: z.number().nullish().transform((v) => v ?? 0),
    updated: optionalDate,
    draft: z.boolean().nullish().transform((v) => v ?? false),
  }),
});

const pages = defineCollection({
  loader: vaultLoader('pages'),
  schema: z.object({
    title: z.string(),
    description: optionalText,
  }),
});

export const collections = { wiki, projects, pages };
