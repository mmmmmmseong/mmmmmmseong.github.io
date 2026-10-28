import { getCollection, type CollectionEntry } from 'astro:content';
import { extractLinkKeys, noteKey, SECTIONS } from './vault';

export type Wiki = CollectionEntry<'wiki'>;
export type Project = CollectionEntry<'projects'>;
type Note = Wiki | Project;

// draft: true 인 글은 개발 서버에서만 보이고 실제 사이트에는 올라가지 않는다.
const visible = (e: { data: { draft: boolean } }) => import.meta.env.DEV || !e.data.draft;

export async function getWiki(): Promise<Wiki[]> {
  const items = await getCollection('wiki', visible);
  return items.sort((a, b) => lastTouched(b) - lastTouched(a) || a.data.title.localeCompare(b.data.title, 'ko'));
}

export async function getProjects(): Promise<Project[]> {
  const items = await getCollection('projects', visible);
  return items.sort(
    (a, b) =>
      Number(b.data.featured) - Number(a.data.featured) ||
      b.data.order - a.data.order ||
      lastTouched(b) - lastTouched(a),
  );
}

export function lastTouched(e: Note): number {
  const d = e.data.updated ?? ('created' in e.data ? e.data.created : undefined);
  return d ? d.getTime() : 0;
}

export function urlOf(e: Note): string {
  return SECTIONS[e.collection] + e.id;
}

export function wikiCategory(e: Wiki): string {
  if (e.data.category) return e.data.category.replace(/^\/+|\/+$/g, '');
  const i = e.id.lastIndexOf('/');
  return i === -1 ? '' : e.id.slice(0, i);
}

export function formatDate(d?: Date): string {
  if (!d) return '';
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
}

/** 이 문서가 링크한 문서 + 이 문서를 링크한 문서 (위키 ↔ 프로젝트 연결) */
export function connections(entry: Note, all: Note[]): Note[] {
  const self = noteKey(entry.id);
  const outgoing = extractLinkKeys(entry.body ?? '');
  return all.filter((other) => {
    if (other === entry) return false;
    if (outgoing.has(noteKey(other.id))) return true;
    return extractLinkKeys(other.body ?? '').has(self);
  });
}

export interface TreeNode {
  name: string;
  path: string;
  children: TreeNode[];
  entries: Wiki[];
}

/** 카테고리 경로("dev/database")로 위키 트리를 만든다. */
export function buildTree(entries: Wiki[]): TreeNode {
  const root: TreeNode = { name: '', path: '', children: [], entries: [] };
  for (const e of entries) {
    let node = root;
    for (const part of wikiCategory(e).split('/').filter(Boolean)) {
      let child = node.children.find((c) => c.name === part);
      if (!child) {
        child = { name: part, path: node.path ? `${node.path}/${part}` : part, children: [], entries: [] };
        node.children.push(child);
      }
      node = child;
    }
    node.entries.push(e);
  }
  const sort = (n: TreeNode) => {
    n.children.sort((a, b) => a.name.localeCompare(b.name, 'ko'));
    n.entries.sort((a, b) => a.data.title.localeCompare(b.data.title, 'ko'));
    n.children.forEach(sort);
  };
  sort(root);
  return root;
}

export function countEntries(n: TreeNode): number {
  return n.entries.length + n.children.reduce((s, c) => s + countEntries(c), 0);
}

/** 위키 + 프로젝트 전체의 태그 → 문서 목록 */
export async function getTagMap(): Promise<Map<string, Note[]>> {
  const map = new Map<string, Note[]>();
  for (const e of [...(await getProjects()), ...(await getWiki())]) {
    for (const t of e.data.tags) {
      if (!map.has(t)) map.set(t, []);
      map.get(t)!.push(e);
    }
  }
  return new Map([...map].sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], 'ko')));
}
