---
title: Flask 세션
description: Flask 기본 세션이 쿠키에 저장되는 방식과 secret_key·디버그 모드 주의점
tags: [웹, 보안]
created: 2026-10-29
updated: 2026-10-29
---

> 관련 프로젝트: [[promptinjection|Break The AI]] · [GitHub](https://github.com/mmmmmmseong/PromptInjection) / [[ctf|웹 CTF]] · [GitHub](https://github.com/mmmmmmseong/CTF)

## 기본 사용법

```python
from flask import session

session['stage'] = 'easy_flag'          # 저장
stage = session.get('stage')            # 읽기 (없으면 None)
session.pop('nickname_asked', None)     # 하나 지우기
session.clear()                         # 전부 지우기
session.permanent = True                # 브라우저를 닫아도 유지 (기본 31일)
```

Break The AI는 현재 문제, 푼 문제 목록, 문제별 메시지 수를 세션에 저장합니다.

## 세션은 어디에 저장되나

Flask 기본 세션은 **서버가 아니라 브라우저 쿠키**에 저장됩니다.

- 내용은 **서명만 되어 있고 암호화되지 않습니다.** Base64를 풀면 누구나 내용을 읽을 수 있습니다.
- 서명은 `secret_key`로 만듭니다. 그래서 사용자가 내용을 바꾸면 서명이 맞지 않아 무시됩니다.

그러므로:

| 세션에 넣어도 되는 것 | 넣으면 안 되는 것 |
| --- | --- |
| 현재 페이지, 사용자 ID, 진행 상태 | 비밀번호, API 키, 정답 |

> CTF 프로젝트는 로그인하면 비밀번호까지 세션에 넣습니다. 문제용이라 괜찮지만, 실제 서비스라면 쿠키만 보고도 비밀번호가 드러납니다.

## secret_key가 노출되면

`secret_key`를 아는 사람은 **원하는 내용으로 세션을 만들어 서명할 수 있습니다.** 예를 들어 "푼 문제 목록"이나 "로그인한 사용자 ID"를 마음대로 바꿀 수 있습니다.

```python
# ❌ 짧고 코드에 그대로 적힌 키 (두 프로젝트 모두 지금 이렇게 되어 있음)
app.secret_key = "111111"

# ✅ 길고 무작위인 키를 환경변수에서 읽기
import os, secrets
app.secret_key = os.environ["FLASK_SECRET_KEY"]
# 키 만들기: python -c "import secrets; print(secrets.token_hex(32))"
```

키는 `.env`에 두고 저장소에 올리지 않습니다. ([[env로-api-키-관리]])

## 디버그 모드

```python
app.run(host='0.0.0.0', port=5000, debug=True)
```

`debug=True`는 개발할 때 편하지만, 오류가 나면 **브라우저에서 파이썬 코드를 실행할 수 있는 디버거**가 열립니다(PIN으로 보호되지만 안전하다고 보기 어렵습니다).
`host='0.0.0.0'`과 함께 쓰면 같은 네트워크의 다른 사람도 접속할 수 있으니, 공개할 때는 반드시 끕니다.

```python
debug = os.environ.get("FLASK_DEBUG") == "1"
app.run(debug=debug)
```

## 더 알아볼 것

- 세션 내용을 서버에 저장하고 싶으면 Flask-Session 같은 확장을 씁니다.
- 세션에 저장한 사용자 정보로 **권한을 확인하는 것**을 잊지 않습니다. ([[idor]])
