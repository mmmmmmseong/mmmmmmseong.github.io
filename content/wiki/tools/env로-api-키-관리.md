---
title: .env로 API 키 관리하기
description: API 키·비밀값을 코드와 저장소에서 분리하는 .env 사용법과 실수했을 때 대처
tags: [도구, 보안]
created: 2026-10-29
updated: 2026-10-29
---

> 관련 프로젝트: [[promptinjection|Break The AI]] · [GitHub](https://github.com/mmmmmmseong/PromptInjection)

## 원칙

**비밀값은 코드에 쓰지 않는다.** API 키, DB 비밀번호, Flask `secret_key` 같은 값은 환경변수로 받고, 개발할 때는 `.env` 파일에 둔다.

## 파일 구성

```text
.env            실제 값 (저장소에 올리지 않음)
.env.example    키 이름만 적은 견본 (저장소에 올림)
.gitignore      .env 를 제외
```

```bash
# .env.example
GEMINI_API_KEY=
GEMINI_MODEL=
```

```gitignore
# .gitignore
.env
```

새로 받은 사람은 `.env.example`을 `.env`로 복사하고 값만 채우면 된다. Break The AI의 README도 이렇게 안내한다.

## 파이썬에서 읽기

```bash
pip install python-dotenv
```

```python
from dotenv import load_dotenv
load_dotenv()   # .env 내용을 환경변수로 불러옴 (이미 있는 환경변수는 덮어쓰지 않음)

import os
api_key = os.environ["GEMINI_API_KEY"]                         # 없으면 바로 오류 → 빠뜨린 걸 금방 앎
model = os.environ.get("GEMINI_MODEL", "gemini-3.5-flash-lite")  # 없으면 기본값
```

### 순서 주의

Break The AI의 `routes/chat.py`는 **import되는 순간** API 키를 읽는다. 그래서 `app.py`에서 `load_dotenv()`를 라우트 import보다 **먼저** 불러야 한다.

```python
# app.py
from dotenv import load_dotenv
load_dotenv()                       # 1. 먼저

from routes import register_routes  # 2. 그 다음
```

## 실수로 키를 올렸다면

1. **키를 즉시 폐기하고 새로 발급한다.** (가장 중요)
2. 그 다음 저장소에서 파일을 지운다.

Git 기록에는 지운 뒤에도 키가 남아 있고, 공개 저장소는 자동으로 키를 수집하는 봇이 금방 찾아낸다. **기록을 지우는 것보다 키를 바꾸는 것이 먼저**다.

## 배포할 때

서버나 배포 서비스(Render, Railway 등)에는 `.env` 파일 대신 **설정 화면의 환경변수**에 값을 넣는다.

## 관련 문서

- [[flask-세션]]: `secret_key`도 같은 방식으로
- [[git-자주-쓰는-명령어]]
