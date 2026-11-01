# 사이트 문구 수정 안내

글(위키·프로젝트·소개 본문)이 아니라 **사이트 자체에 있는 글자**(메뉴, 제목, 버튼, 안내 문구)를 고칠 때 어느 파일을 열어야 하는지 정리한 문서다.

> 이 파일은 저장소 루트에 있어서 사이트에는 올라가지 않는다.

## 먼저 알아둘 것

- 이 파일들은 `content/` 밖에 있어서 **Obsidian이나 `/admin`으로는 고칠 수 없다.** VS Code나 GitHub 웹 편집기로 고치면 된다.
  - VS Code: 저장소 폴더를 열고 고친 뒤 커밋·push 하면 1~2분 뒤 반영된다.
  - GitHub 웹: 저장소 페이지에서 `.` 키를 누르면 웹 편집기(github.dev)가 열린다.
- **문구만 바꿀 때는** `"..."` 따옴표 안이나 `>글자<` 사이의 글자만 바꾸면 된다. 중괄호 `{ }` 안은 코드라서 건드리지 않도록 하자.

```astro
<h2>대표 프로젝트</h2>               ← "대표 프로젝트"만 바꾸면 된다
<p>하위 문서 {subs.length}개</p>      ← {subs.length}는 그대로 둔다
```

---

## 1. 사이트 기본 정보: `src/site.config.ts`

**대부분은 이 파일만 고치면 된다.**

| 항목 | 어디에 보이나 |
| --- | --- |
| `title` | 왼쪽 위 사이트 이름, 브라우저 탭, 맨 아래 저작권 줄 |
| `description` | 홈 맨 위 작은 파란 글씨, 검색 결과 설명 |
| `intro` | 홈 맨 위 큰 제목 |
| `links.github` | 맨 아래 GitHub 링크, 소개 페이지 버튼 |
| `links.email` | 맨 아래 Email 링크, 소개 페이지 버튼 (비워두면 안 보인다) |
| `NAV` | 위쪽 메뉴의 주소·이름·순서 (프로젝트 / 위키 / 태그 / 소개) |

```ts
export const NAV = [
  { href: '/projects', label: '프로젝트' },   // label이 메뉴에 보이는 이름
  ...
];
```

## 2. 페이지별 고정 문구: `src/pages/`

| 파일 | 지금 문구 |
| --- | --- |
| `index.astro` (홈) | "프로젝트 보기", "위키 둘러보기", "대표 프로젝트", "최근 업데이트된 위키", "전체 보기 →", "아직 프로젝트가 없다." |
| `projects/index.astro` (프로젝트 목록) | "프로젝트", "만든 것들과 그 과정에서 배운 점을 정리한다.", 빈 목록 안내 |
| `projects/[...id].astro` (프로젝트 글) | "← 프로젝트", "기간", "역할", "기술", "GitHub", "데모 보기", "하위 문서 N개 · 아래에서 보기" |
| `wiki/index.astro` (위키 목록) | "위키", "공부하고 정리한 내용을 주제별로 모아둔다.", "분류", "최근 업데이트", 빈 목록 안내 |
| `wiki/[...id].astro` (위키 글) | "← 위키 전체", "작성", "수정", "하위 문서 N개", "목차" |
| `tags/index.astro` (태그 목록) | "태그", "위키와 프로젝트를 태그로 모아본다.", "아직 태그가 없다." |
| `tags/[tag].astro` (태그 한 개) | "← 태그", "프로젝트", "위키", "문서 N개" |
| `about.astro` (소개 틀) | 소개 파일이 없을 때 안내 문구. **소개 본문은 `content/pages/about.md`** |
| `404.astro` (없는 주소) | "404", "페이지를 찾을 수 없다", "주소가 바뀌었거나 아직 작성되지 않은 문서일 수 있다.", "홈으로" |

각 파일 위쪽 `<Base title="..." description="...">`의 값은 **브라우저 탭 제목과 검색 결과 설명**이다.

## 3. 여러 페이지에 공통으로 나오는 부품: `src/components/`

한 곳만 고치면 그 부품을 쓰는 모든 페이지에 반영된다.

| 파일 | 문구 | 나오는 곳 |
| --- | --- | --- |
| `ProjectCard.astro` | "대표", "하위 문서 N" 배지 | 홈, 프로젝트 목록의 카드 |
| `SubDocs.astro` | "하위 문서", "모두 펼치기", "모두 접기", "이 문서만 따로 보기 →" | 하위 문서가 있는 위키·프로젝트 글 |
| `DocPager.astro` | "← 이전", "다음 →" | 하위 문서 아래쪽 |
| `Connections.astro` | "연결된 문서", "위키", "프로젝트" | 위키·프로젝트 글 맨 아래 |
| `WikiList.astro` | (고정 문구 없음, 날짜 표시 형식만) | 홈, 위키 목록 |
| `WikiTree.astro` | (고정 문구 없음) | 위키 왼쪽 분류 트리 |
| `ThemeToggle.astro` | "라이트/다크 테마 전환" (마우스를 올리면 나오는 설명) | 오른쪽 위 테마 버튼 |

## 4. 전체 틀: `src/layouts/Base.astro`

모든 페이지를 감싸는 틀이다.

- 위쪽 메뉴 영역 (메뉴 내용은 `site.config.ts`의 `NAV`)
- 맨 아래 줄: `© 연도 사이트 이름`, GitHub·Email 링크
- 브라우저 탭 제목 형식: `글 제목 · 사이트 이름`
- 글꼴(Pretendard) 불러오기, 테마 기억하기
- 키보드 사용자를 위한 "본문으로 건너뛰기"

## 5. 그 밖에

| 파일 | 내용 | 비고 |
| --- | --- | --- |
| `content/tags.yml` | 태그 이름과 설명 | `/admin` → 태그 관리에서도 고칠 수 있다 |
| `public/admin/config.yml` | `/admin` 화면의 메뉴 이름, 입력 칸 이름과 안내 | 사이트가 아니라 관리자 화면 |
| `src/styles/global.css` | 색·글꼴·간격 | 포인트 컬러는 맨 위 `--accent`, 다크 테마 색은 `[data-theme='dark']` 부분 |
| `public/favicon.svg` | 브라우저 탭 아이콘 | |
| `public/robots.txt` | 검색엔진 수집 규칙 | |

## 6. 날짜·숫자 표시 형식

- 날짜 `2026.10.29` 형식: `src/lib/content.ts`의 `formatDate`
- 위키 문서 상단의 분류 표시 `security / web`: `src/pages/wiki/[...id].astro`에서 `/`를 ` / `로 바꿔 보여준다.

---

## 빠른 찾기

| 바꾸고 싶은 것 | 열 파일 |
| --- | --- |
| 사이트 이름, 홈 큰 제목 | `src/site.config.ts` |
| 위쪽 메뉴 | `src/site.config.ts` (`NAV`) |
| 홈 버튼·섹션 제목 | `src/pages/index.astro` |
| "연결된 문서" | `src/components/Connections.astro` |
| "하위 문서", "모두 펼치기" | `src/components/SubDocs.astro` |
| 404 화면 | `src/pages/404.astro` |
| 맨 아래 줄 | `src/layouts/Base.astro` |
| 소개 본문 | `content/pages/about.md` (Obsidian·`/admin`으로 수정 가능) |
| 포인트 컬러 | `src/styles/global.css` (`--accent`) |

모르는 문구가 있으면 VS Code에서 `Ctrl+Shift+F`로 그 문구를 검색하면 들어 있는 파일이 바로 나온다.
