# mmmmmmseong.github.io

개인 위키 겸 프로젝트 포트폴리오. [Astro](https://astro.build)로 만들고 GitHub Pages로 배포합니다.

- 🌗 라이트/다크 테마 전환 (처음엔 시스템 설정을 따르고, 고른 테마는 기억함)
- 📝 **Obsidian**으로 글쓰기: `[[위키링크]]`, `![[이미지.png]]` 그대로 사용
- 🌐 **/admin** 웹 관리자 화면: 브라우저(휴대폰 포함)에서 글쓰기
- 🔗 위키 ↔ 프로젝트 자동 연결 (서로 링크한 문서를 "연결된 문서"로 표시)

## 폴더 구조

```
content/                ← Obsidian vault (이 폴더를 Obsidian으로 엽니다)
  wiki/                 위키 문서. 하위 폴더 = 분류 (예: wiki/dev/git.md → dev)
  projects/             프로젝트 글 (하나에 문서 하나)
  pages/about.md        소개 페이지
  tags.yml              태그 목록 (/admin 의 "태그 관리"에서 수정)
  attachments/          이미지 등 첨부 파일
  _templates/           새 글 템플릿 (사이트에는 올라가지 않음)
src/
  site.config.ts        사이트 이름, 소개 문구, 링크 ← 먼저 고쳐주세요
  styles/global.css     색상 (포인트 컬러: 맨 위 --accent)
public/admin/           웹 관리자 화면 (Sveltia CMS)
```

## 처음 한 번만 할 일

### 1. GitHub Pages 켜기
저장소 **Settings → Pages → Build and deployment → Source** 를 **GitHub Actions** 로 바꿉니다.
이후 `main` 브랜치에 push 될 때마다 자동으로 배포됩니다 (1–2분).

### 2. Obsidian 연결
1. 이 저장소를 PC에 clone 합니다.
2. Obsidian → **폴더를 보관함으로 열기** → `content` 폴더를 고릅니다.
3. 설정 → 커뮤니티 플러그인 → **Obsidian Git** 설치 후, 옵션에서
   *Auto commit-and-sync interval* 을 원하는 간격(예: 5분)으로 정하면 저장한 글이 자동으로 올라갑니다.

> 첨부 폴더(`attachments`), 링크 형식, 템플릿 폴더는 미리 설정되어 있습니다.
> 새 글은 명령 팔레트(Ctrl/Cmd+P) → **템플릿 삽입** → `위키` 또는 `프로젝트` 를 고르면 속성이 채워집니다.

### 3. /admin 로그인용 토큰 만들기
1. GitHub → Settings → Developer settings → **Personal access tokens → Fine-grained tokens → Generate new token**
2. *Repository access*: **Only select repositories** → `mmmmmmseong.github.io`
3. *Permissions*: **Contents → Read and write**
4. 만든 토큰을 복사해서 `https://mmmmmmseong.github.io/admin/` → **Sign In Using Access Token** 에 붙여넣습니다.

> 토큰은 비밀번호처럼 다뤄주세요. 비밀번호 관리자에 저장해 두면 새 기기에서도 편합니다.
> 이 저장소에 쓰기 권한이 있는 토큰이 없으면 아무도 글을 고칠 수 없습니다.
> 관리자 화면이 영어로 나오면 로그인 후 설정(Settings)에서 언어를 바꿔보세요.

## 글 쓰는 법

| 속성 | 설명 |
| --- | --- |
| `title` | 제목 (비우면 파일 이름) |
| `tags` | 태그 ID 목록 → `/tags` 페이지에 모임 (아래 "태그 관리" 참고) |
| `draft: true` | 사이트에 공개하지 않음 |
| `featured: true` | (프로젝트) 홈 화면 대표 프로젝트로 표시 |

자세한 예시는 `content/wiki/위키-사용법.md` 를 참고하세요.

## 상위 문서와 하위 문서

폴더와 같은 이름의 문서(예: `wiki/tools/vscode.md` + `wiki/tools/vscode/` 폴더)를 만들면, 상위 문서에서 하위 문서를 펼쳐 보거나 따로 열 수 있습니다.
하위 문서 순서는 속성의 `order`(작을수록 앞)로 정합니다. 자세한 내용은 `content/wiki/위키-사용법.md`를 참고하세요.

## 태그 관리

태그는 `content/tags.yml` 한 곳에서 관리합니다. `/admin` → **태그 관리 → 태그 목록**에서 추가·수정·삭제하세요.

- **ID**: 글에 저장되고 주소(`/tags/ID`)에 쓰이는 값. 한 번 정하면 바꾸지 마세요.
- **표시 이름**: 사이트에 보이는 이름. 바꾸면 그 태그가 붙은 모든 글에 바로 반영됩니다.
- **설명**: 태그 페이지에 표시됩니다.

`/admin`에서 글을 쓸 때는 이 목록에서 태그를 고릅니다.
Obsidian에서는 속성의 `tags`에 **ID**를 적으면 됩니다. 목록에 없는 태그를 적어도 사이트에는 그대로 표시됩니다.

## 내 컴퓨터에서 미리 보기 (선택)

Node.js 22.23.4 이상이 필요합니다.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # dist/ 에 사이트 생성
```
