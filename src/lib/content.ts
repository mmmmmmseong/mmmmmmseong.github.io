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
    if (other.collection === entry.collection && other.id === entry.id) return false;
    if (outgoing.has(noteKey(other.id))) return true;
    return extractLinkKeys(other.body ?? '').has(self);
  });
}

export interface TreeNode {
  name: string;
  path: string;
  children: TreeNode[];
  entries: Wiki[];
  page?: Wiki; // 폴더와 이름이 같은 상위 문서 (예: tools/vscode.md ↔ tools/vscode/)
}

/** 하위 문서 순서: order → 제목 */
function byOrder(a: Wiki, b: Wiki): number {
  return a.data.order - b.data.order || a.data.title.localeCompare(b.data.title, 'ko');
}

/** 상위 문서: tools/vscode/vscode-기본 → tools/vscode */
export function wikiParent(entry: Wiki, all: Wiki[]): Wiki | undefined {
  const i = entry.id.lastIndexOf('/');
  if (i === -1) return undefined;
  const parentId = entry.id.slice(0, i);
  return all.find((e) => e.id === parentId);
}

/** 바로 아래 하위 문서: tools/vscode → tools/vscode/* (더 깊은 문서는 각자의 상위 문서에 속함) */
export function wikiChildren(entry: Wiki, all: Wiki[]): Wiki[] {
  const prefix = entry.id + '/';
  return all.filter((e) => e.id.startsWith(prefix) && !e.id.slice(prefix.length).includes('/')).sort(byOrder);
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
  // 폴더와 같은 이름의 문서가 있으면 그 폴더의 상위 문서로 옮긴다.
  const attachPages = (n: TreeNode) => {
    for (const child of n.children) {
      const i = n.entries.findIndex((e) => e.id === child.path);
      if (i !== -1) child.page = n.entries.splice(i, 1)[0];
      attachPages(child);
    }
  };
  attachPages(root);
  const label = (n: TreeNode) => n.page?.data.title ?? n.name;
  const sort = (n: TreeNode) => {
    n.children.sort((a, b) => label(a).localeCompare(label(b), 'ko'));
    n.entries.sort(n.page ? byOrder : (a, b) => a.data.title.localeCompare(b.data.title, 'ko'));
    n.children.forEach(sort);
  };
  sort(root);
  return root;
}

export function countEntries(n: TreeNode): number {
  return n.entries.length + n.children.reduce((s, c) => s + countEntries(c), 0);
}

export interface TagInfo {
  id: string;
  name: string;
  description?: string;
}

/** content/tags.yml 의 태그 정보. 목록에 없는 태그는 id 를 그대로 이름으로 쓴다. */
export async function getTagInfo(): Promise<(id: string) => TagInfo> {
  const map = new Map((await getCollection('tags')).map((t) => [t.id, t.data]));
  return (id) => {
    const t = map.get(id);
    return { id, name: t?.name ?? id, description: t?.description };
  };
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
