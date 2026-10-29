import { defineCollection } from 'astro:content';
import { file } from 'astro/loaders';
import { z } from 'astro/zod';
import { parse as parseYaml } from 'yaml';
import { vaultLoader } from './lib/vault';

// YAML 은 따옴표 없는 2026.10 같은 값을 숫자로 읽는다. 글이 통째로 빠지지 않도록 숫자도 글자로 받는다.
const text = z.union([z.string(), z.number()]).transform(String);
// Obsidian 속성(Properties)은 비어 있으면 null 이 되므로 빈 배열로 맞춘다.
const list = z
  .union([z.array(text), text])
  .nullish()
  .transform((v) => (v == null ? [] : Array.isArray(v) ? v : [v]));
const optionalDate = z.coerce.date().nullish().transform((v) => v ?? undefined);
const optionalText = text.nullish().transform((v) => v || undefined);

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

// 태그 목록 (content/tags.yml). /admin 의 "태그 관리"에서 한 번에 관리한다.
const tags = defineCollection({
  loader: file('content/tags.yml', {
    parser: (text) => {
      const list = (parseYaml(text) as { tags?: unknown[] } | null)?.tags ?? [];
      return list.filter((t): t is { id: unknown } => !!t && typeof t === 'object' && 'id' in t && !!t.id)
        .map((t) => ({ ...t, id: String(t.id) }));
    },
  }),
  schema: z.object({
    name: optionalText,
    description: optionalText,
  }),
});

export const collections = { wiki, projects, pages, tags };
