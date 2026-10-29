---
title: VS Code 추천 확장
description: 실제로 쓰고 있는 확장 중에서 고른 쓸모 있는 확장들
tags: [도구]
order: 4
created: 2026-10-29
updated: 2026-10-29
---

설치되어 있는 확장 중 자주 쓰거나 추천할 만한 것만 골랐다.
언어 지원 확장(Python, Java, C/C++, WSL)은 [[vscode-개발-환경]]에, GitHub 저장소 열기는 [[vscode-git-연동]]에 정리했다.

## 기본 환경

### Korean Language Pack
메뉴와 설정을 한국어로 바꾼다. 처음 VS Code를 쓸 때 진입 장벽이 크게 낮아진다.

### Material Icon Theme
파일 종류마다 아이콘을 다르게 보여준다. `.py`, `.json`, `.env`, `requirements.txt`가 한눈에 구분돼서 파일이 많은 프로젝트에서 특히 편하다.

### Project Manager
자주 여는 프로젝트를 저장해 두고 사이드바에서 바로 전환한다.
명령 팔레트 → `Project Manager: Save Project`로 저장하면, 매번 "폴더 열기"로 찾아갈 필요가 없다.

### Path Intellisense
코드에서 파일 경로를 쓸 때 실제 파일 이름을 자동 완성해 준다. `src="./static/` 까지 치면 폴더 안 파일이 목록으로 뜬다. 경로 오타로 이미지가 안 뜨는 일을 줄여준다.

## 웹 개발

### Live Server
HTML 파일을 브라우저로 띄우고, 저장할 때마다 자동으로 새로고침한다. 상태 표시줄의 **Go Live**로 켠다.

### htmltagwrap
글자를 선택하고 `Alt+W`를 누른 뒤 태그 이름을 치면, 선택한 부분을 태그로 감싼다.

```html
안녕하세요   →   <strong>안녕하세요</strong>
```

### REST Client
`.http` 파일에 요청을 적어두고 **Send Request**를 눌러 API를 시험한다. 브라우저나 Postman 없이 VS Code 안에서 끝난다.

> 관련 프로젝트: [[promptinjection|Break The AI]] · [GitHub](https://github.com/mmmmmmseong/PromptInjection)

Break The AI의 채팅 API를 시험하는 예:

```http
### 1. 문제 페이지에 들어가서 세션에 현재 문제를 기록
GET http://localhost:5000/easy/flag

### 2. 채팅 보내기
POST http://localhost:5000/chat
Content-Type: application/json

{ "message": "안녕" }
```

REST Client는 기본적으로 쿠키를 기억하기 때문에, 1번에서 받은 세션으로 2번 요청이 이어진다.
요청 파일을 저장소에 같이 두면 API 사용 예시 문서 역할도 한다.

## 데이터

### Rainbow CSV
CSV의 열마다 색을 다르게 칠해서, 쉼표로만 구분된 데이터를 표처럼 읽을 수 있다. 칸에 마우스를 올리면 어느 열인지 알려준다.

> 관련 프로젝트: [[map|학교 등산 행사 지도]] · [GitHub](https://github.com/mmmmmmseong/map)

등산 지도의 `PathMap.csv`처럼 위치 이름에 쉼표가 들어가 열이 밀리는 문제를 바로 눈으로 찾을 수 있다.

### SQLite
`.db` 파일을 열어 테이블을 보고 쿼리를 실행한다. 명령 팔레트 → `SQLite: Open Database`로 열면 탐색기 아래에 **SQLITE EXPLORER**가 생긴다.

> 관련 프로젝트: [[promptinjection|Break The AI]] · [GitHub](https://github.com/mmmmmmseong/PromptInjection) / [[ctf|웹 CTF]] · [GitHub](https://github.com/mmmmmmseong/CTF)

랭킹이 제대로 쌓이는지(`rank.db`), CTF 사용자 데이터가 맞는지(`users.db`) 확인할 때 쓴다. 쿼리 작성은 [[sqlite-기본]] 참고.

## 기록·공유

### CodeSnap+
선택한 코드를 **깔끔한 이미지**로 저장한다. 위키, 발표 자료, SNS에 코드를 보여줄 때 화면 캡처보다 보기 좋다.
코드를 선택하고 명령 팔레트 → `CodeSnap`을 실행한다.

## 보안·분석

### APKLab + Smali
안드로이드 앱(APK)을 분석할 때 쓰는 조합이다.

| 확장 | 역할 |
| --- | --- |
| **APKLab** | APK를 풀어서(apktool) Smali 코드와 리소스로 만들고, 필요하면 Java 코드로도 되돌린다(jadx). 고친 뒤 다시 APK로 묶고 서명까지 한다 |
| **Smali** / **Smalise** | Smali(안드로이드 바이트코드를 사람이 읽을 수 있게 만든 언어) 문법 강조와 정의로 이동 같은 편집 기능 |

명령 팔레트 → `APKLab: Open an APK`로 시작한다. Java가 설치되어 있어야 한다.

> ⚠️ 분석은 **내가 만든 앱이나 분석이 허락된 앱**(워게임, CTF 문제 등)에만 한다. 다른 사람의 앱을 허락 없이 고쳐 배포하는 것은 불법이다.

## AI

### Claude Code
터미널에서 쓰는 AI 코딩 도구 Claude Code를 VS Code 안에서 쓸 수 있게 해준다. 지금 열린 파일과 선택한 코드를 바로 맥락으로 넘길 수 있다.
AI가 고친 코드는 **소스 제어 화면에서 변경 내용을 확인한 뒤** 커밋한다.
