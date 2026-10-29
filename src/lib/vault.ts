// Obsidian vault(content/)를 Astro 콘텐츠 컬렉션으로 읽어오는 로더.
// [[위키링크]], ![[이미지]] 같은 Obsidian 문법을 일반 HTML/마크다운으로 바꿔서 렌더링한다.
import fs from 'node:fs/promises';
import path from 'node:path';
import { parse as parseYaml } from 'yaml';
import { slug as headingSlug } from 'github-slugger';
import type { Loader } from 'astro/loaders';

export const CONTENT_DIR = path.resolve('content');
export const ATTACHMENTS_DIR = path.join(CONTENT_DIR, 'attachments');

// 컬렉션 이름 → URL 접두사
export const SECTIONS = {
  wiki: '/wiki/',
  projects: '/projects/',
  pages: '/',
} as const;
export type Section = keyof typeof SECTIONS;

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|avif|svg)$/i;
const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n|$)/;
const CODE = /(```[\s\S]*?```|~~~[\s\S]*?~~~|`[^`\n]*`)/;
export const WIKILINK = /(!?)\[\[([^\[\]|#\n]+)(#[^\[\]|\n]*)?(?:\|([^\[\]\n]*))?\]\]/g;

/** "Redis Pub Sub" → "redis-pub-sub" (한글은 그대로 둔다) */
export function slugifySegment(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}_-]/gu, '')
    .replace(/-+/g, '-');
}

/** "dev/Redis Pub.md" → "dev/redis-pub" */
export function toId(relPath: string): string {
  return relPath
    .replace(/\.md$/i, '')
    .split(/[\\/]/)
    .map(slugifySegment)
    .join('/');
}

/** 위키링크 대상 이름을 비교용 키로 바꾼다. 폴더 경로는 무시하고 파일 이름만 본다. */
export function noteKey(name: string): string {
  const base = name.trim().replace(/\.md$/i, '').split('/').pop() ?? '';
  return slugifySegment(base);
}

export function splitFrontmatter(src: string): { data: Record<string, unknown>; body: string } {
  const m = src.match(FRONTMATTER);
  if (!m) return { data: {}, body: src };
  const data = (parseYaml(m[1]) ?? {}) as Record<string, unknown>;
  return { data, body: src.slice(m[0].length) };
}

/** 코드 블록/인라인 코드를 건드리지 않고 나머지 부분만 변환한다. */
function mapOutsideCode(body: string, fn: (text: string) => string): string {
  return body
    .split(CODE)
    .map((part, i) => (i % 2 === 0 ? fn(part) : part))
    .join('');
}

/** 본문에서 [[링크]] 대상 키를 모은다 (백링크 계산용). */
export function extractLinkKeys(body: string): Set<string> {
  const keys = new Set<string>();
  mapOutsideCode(body, (text) => {
    for (const m of text.matchAll(WIKILINK)) {
      if (!(m[1] && IMAGE_EXT.test(m[2]))) keys.add(noteKey(m[2]));
    }
    return text;
  });
  return keys;
}

async function walk(dir: string, rel = ''): Promise<string[]> {
  let dirents;
  try {
    dirents = await fs.readdir(path.join(dir, rel), { withFileTypes: true });
  } catch {
    return [];
  }
  const out: string[] = [];
  for (const d of dirents) {
    // .obsidian, _templates 같은 폴더/파일은 사이트에 올리지 않는다.
    if (d.name.startsWith('.') || d.name.startsWith('_')) continue;
    const p = path.join(rel, d.name);
    if (d.isDirectory()) out.push(...(await walk(dir, p)));
    else out.push(p);
  }
  return out;
}

interface VaultIndex {
  notes: Map<string, { url: string; title: string }>; // noteKey → 문서 URL, 제목
  attachments: Map<string, string>; // 파일 이름 → /attachments/... URL
}

async function buildIndex(): Promise<VaultIndex> {
  const notes: VaultIndex['notes'] = new Map();
  for (const [section, prefix] of Object.entries(SECTIONS)) {
    const dir = path.join(CONTENT_DIR, section);
    for (const rel of await walk(dir)) {
      if (!rel.toLowerCase().endsWith('.md')) continue;
      const id = toId(rel);
      let title = path.basename(rel, path.extname(rel));
      try {
        const { data } = splitFrontmatter(await fs.readFile(path.join(dir, rel), 'utf-8'));
        if (typeof data.title === 'string' && data.title) title = data.title;
      } catch {
        // 속성(frontmatter)이 깨진 문서는 파일 이름을 제목으로 쓴다.
      }
      notes.set(noteKey(id), { url: prefix + id, title });
    }
  }
  const attachments = new Map<string, string>();
  for (const rel of await walk(ATTACHMENTS_DIR)) {
    attachments.set(path.basename(rel).toLowerCase(), attachmentUrl(rel));
  }
  return { notes, attachments };
}

function attachmentUrl(rel: string): string {
  return '/attachments/' + rel.split(/[\\/]/).map(encodeURIComponent).join('/');
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
}

/** 이미지 경로를 사이트 URL로 바꾼다. "[[a.png]]", "attachments/a.png", "/attachments/a.png" 모두 지원. */
export function resolveAsset(value: string, index: VaultIndex): string {
  const wiki = value.match(/^!?\[\[([^\]|]+)(?:\|[^\]]*)?\]\]$/);
  const name = wiki ? wiki[1] : value;
  if (/^(https?:)?\/\//.test(name)) return name;
  const found = index.attachments.get(path.basename(name).toLowerCase());
  if (found) return found;
  const rel = name.replace(/^(\.{0,2}\/)*(attachments\/)?/, '');
  return attachmentUrl(rel);
}

function transformBody(body: string, index: VaultIndex): string {
  return mapOutsideCode(body, (text) =>
    text
      .replace(WIKILINK, (_all, bang: string, target: string, hash: string | undefined, alias: string | undefined) => {
        const note = index.notes.get(noteKey(target));
        const label = (alias ?? note?.title ?? target.split('/').pop() ?? target).trim();
        if (bang && IMAGE_EXT.test(target)) {
          // ![[image.png|300]] 처럼 숫자 별칭은 너비로 쓴다 (Obsidian과 동일).
          const width = alias && /^\d+$/.test(alias.trim()) ? ` width="${alias.trim()}"` : '';
          const alt = width ? target : label;
          return `<img src="${resolveAsset(target, index)}" alt="${escapeHtml(alt)}"${width} loading="lazy" />`;
        }
        if (!note) return `<span class="wikilink wikilink-missing" title="아직 작성되지 않은 문서">${escapeHtml(label)}</span>`;
        const anchor = hash && hash.length > 1 ? '#' + headingSlug(hash.slice(1)) : '';
        return `<a class="wikilink" href="${note.url}${anchor}">${escapeHtml(label)}</a>`;
      })
      // 일반 마크다운 이미지 중 attachments 폴더를 가리키는 상대 경로도 사이트 URL로 맞춘다.
      .replace(/(!\[[^\]]*\]\()(?:\.{0,2}\/)*attachments\/([^)\s]+)/g, (_all, head: string, rel: string) => head + attachmentUrl(decodeURI(rel)))
      // **굵게**를 직접 <strong>으로 바꾼다. 마크다운 규칙상 `**인코딩(Encoding)**은`처럼
      // 닫는 ** 앞이 문장부호이고 뒤에 조사가 붙으면 굵게 처리되지 않는데, 한국어에서는 이런 경우가 흔하다.
      .replace(/\*\*(?=\S)([^*\n]*?\S)\*\*/g, '<strong>$1</strong>'),
  );
}

/** content/<section> 폴더의 마크다운을 읽어오는 컬렉션 로더 */
export function vaultLoader(section: Section): Loader {
  const dir = path.join(CONTENT_DIR, section);
  return {
    name: `vault-${section}`,
    load: async ({ store, parseData, renderMarkdown, generateDigest, logger, watcher }) => {
      const sync = async () => {
        const index = await buildIndex();
        // 다른 문서의 제목/주소가 바뀌면 링크도 다시 그려야 하므로, 전체 목록을 digest 에 함께 넣는다.
        const indexDigest = generateDigest(JSON.stringify([[...index.notes], [...index.attachments]]));
        const seen = new Set<string>();
        for (const rel of await walk(dir)) {
          if (!rel.toLowerCase().endsWith('.md')) continue;
          const filePath = path.join(dir, rel);
          const id = toId(rel);
          try {
            const src = await fs.readFile(filePath, 'utf-8');
            const { data, body } = splitFrontmatter(src);
            if (typeof data.thumbnail === 'string' && data.thumbnail) data.thumbnail = resolveAsset(data.thumbnail, index);
            if (!data.title) data.title = path.basename(rel, path.extname(rel));
            const parsed = await parseData({ id, data, filePath });
            const rendered = await renderMarkdown(transformBody(body, index));
            seen.add(id);
            store.set({
              id,
              data: parsed,
              body,
              filePath: path.relative(process.cwd(), filePath),
              digest: generateDigest(src + indexDigest),
              rendered,
            });
          } catch (err) {
            logger.error(`${path.relative(process.cwd(), filePath)}: ${(err as Error).message}`);
          }
        }
        for (const id of store.keys()) if (!seen.has(id)) store.delete(id);
      };

      await sync();

      // 개발 서버: content/ 폴더가 바뀌면 다시 읽는다 (다른 문서의 링크도 갱신되도록 전체를 다시 읽음).
      if (watcher) {
        watcher.add(CONTENT_DIR);
        const onChange = (changed: string) => {
          if (changed.startsWith(CONTENT_DIR) && changed.toLowerCase().endsWith('.md')) void sync();
        };
        watcher.on('add', onChange);
        watcher.on('change', onChange);
        watcher.on('unlink', onChange);
      }
    },
  };
}
