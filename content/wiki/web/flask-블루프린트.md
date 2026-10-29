---
title: Flask 블루프린트
description: Flask 앱을 기능별 파일로 나누는 블루프린트 구조와 등록 패턴
tags: [웹]
created: 2026-10-29
updated: 2026-10-29
---

> 관련 프로젝트: [[promptinjection|Break The AI]] · [GitHub](https://github.com/mmmmmmseong/PromptInjection) / [[ctf|웹 CTF]] · [GitHub](https://github.com/mmmmmmseong/CTF)

## 왜 쓰나

라우트가 많아지면 `app.py` 하나에 다 넣기 어렵다. **블루프린트(Blueprint)**는 라우트 묶음을 따로 만들어 두었다가 앱에 등록하는 방법이다.

## 기본 사용법

```python
# routes/pages.py
from flask import Blueprint, render_template

bp = Blueprint('pages', __name__)

@bp.route('/')
def landing():
    return render_template('landing.html')
```

```python
# app.py
from flask import Flask
from routes.pages import bp as pages_bp

app = Flask(__name__)
app.register_blueprint(pages_bp)
```

- `Blueprint('pages', __name__)`의 첫 인자가 이름이다. `url_for('pages.landing')`처럼 **"블루프린트 이름.함수 이름"**으로 주소를 만든다.
- `url_prefix='/oss'`를 주면 그 블루프린트의 모든 주소 앞에 붙는다.

## Break The AI의 구조

```
routes/
  __init__.py      register_routes(app): 블루프린트를 한 번에 등록
  pages.py         일반 페이지 (/, /learn, /about, /reset)
  chat.py          AI 채팅 API (/chat)
  rank.py          랭킹 (/rank)
  opensource.py    오픈소스 원본 (/oss/...)
  stages/
    __init__.py    공용 사전(TITLES, ANSWERS, ...)과 문제 순서
    easy_flag.py   문제 하나 = 파일 하나
    ...
```

### 문제가 스스로 등록하는 패턴

`stages/__init__.py`에 빈 사전을 만들고, 각 문제 파일이 import될 때 자기 정보를 채워 넣는다.

```python
# stages/__init__.py
bp = Blueprint('stages', __name__)
TITLES, ANSWERS, SYSTEM_INSTRUCTIONS, MEMORY = {}, {}, {}, {}

# 사전을 만든 '뒤에' import 해야 함 (순환 import 주의)
from . import easy_flag, easy_phone, mid_exam  # ...
```

```python
# stages/easy_flag.py
from . import bp, TITLES, ANSWERS

STAGE = 'easy_flag'
TITLES[STAGE] = '하 - 비밀번호 확보'

@bp.route('/easy/flag')
def easy_flag(): ...
```

새 문제를 추가할 때 **파일 하나를 만들고 import 한 줄만** 더하면, 메뉴·랭킹·채팅이 모두 자동으로 알게 된다.

### 모든 템플릿에 공용 값 넣기

```python
@app.context_processor
def inject_stages():
    return {'TITLES': TITLES, 'STAGE_ORDER': STAGE_ORDER}
```

이렇게 하면 모든 템플릿에서 `{{ TITLES['easy_flag'] }}`처럼 바로 쓸 수 있다.

## 주의할 점

- **순환 import:** 블루프린트 객체나 공용 사전을 정의하기 전에 하위 모듈을 import하면 오류가 난다. 정의 → import 순서를 지킨다.
- **환경변수를 읽는 모듈:** import될 때 환경변수를 읽는 모듈이 있으면, 그보다 먼저 `load_dotenv()`를 호출해야 한다. ([[env로-api-키-관리]])
