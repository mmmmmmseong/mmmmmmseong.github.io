---
title: SQLite 기본
description: 파이썬 sqlite3로 테이블 만들기, 안전하게 쿼리하기, 트랜잭션과 연결 닫기
tags: [도구, 웹]
created: 2026-10-29
updated: 2026-10-29
---

> 관련 프로젝트: [[promptinjection|Break The AI]] · [GitHub](https://github.com/mmmmmmseong/PromptInjection) / [[ctf|웹 CTF]] · [GitHub](https://github.com/mmmmmmseong/CTF)

**SQLite**는 파일 하나가 곧 데이터베이스인 가벼운 DB다. 서버를 따로 띄울 필요가 없고, 파이썬에 `sqlite3` 모듈이 기본으로 들어 있다.
Break The AI의 랭킹(`rank.db`)과 CTF의 사용자 정보(`users.db`)가 SQLite다.

## 연결하고 테이블 만들기

```python
import sqlite3

db = sqlite3.connect("rank.db")   # 파일이 없으면 새로 만듦
db.execute(
    "CREATE TABLE IF NOT EXISTS records ("
    "id INTEGER PRIMARY KEY AUTOINCREMENT, "
    "stage TEXT NOT NULL, messages INTEGER NOT NULL, solved_at TEXT NOT NULL)"
)
```

`CREATE TABLE IF NOT EXISTS`를 연결할 때마다 실행하면, 따로 초기화 스크립트를 돌리지 않아도 된다.

## 값은 항상 `?`로

```python
db.execute(
    "INSERT INTO records (stage, messages, solved_at) VALUES (?, ?, ?)",
    (stage, messages, now),
)
rows = db.execute(
    "SELECT stage, messages FROM records WHERE stage = ? ORDER BY messages",
    (stage,),
).fetchall()
```

f-string으로 값을 넣으면 [[sql-인젝션]]이 생긴다. 값이 하나여도 `(stage,)`처럼 **튜플**로 넘긴다.

## 트랜잭션과 연결 닫기

Break The AI에서 쓰는 패턴이다.

```python
from contextlib import closing

with closing(get_db()) as db:   # 블록이 끝나면 연결을 닫음
    with db:                    # 블록이 끝나면 commit, 오류가 나면 rollback
        db.execute("INSERT ...", (...))
```

헷갈리기 쉬운 점: **`with db:`는 연결을 닫지 않는다.** commit/rollback만 해준다. 그래서 `closing()`으로 한 번 더 감싼다.

## 결과를 이름으로 읽기

```python
db.row_factory = sqlite3.Row
row = db.execute("SELECT * FROM users WHERE id = ?", (1,)).fetchone()
row["username"]    # row[1] 대신 이름으로
```

## 자주 쓰는 것

```sql
SELECT COALESCE(nickname, '방문객 #' || id) FROM visitors;   -- NULL이면 대신할 값, ||는 문자열 잇기
SELECT * FROM records ORDER BY messages, solved_at;          -- 여러 기준 정렬
SELECT r.*, v.nickname FROM records r LEFT JOIN visitors v ON v.id = r.visitor_id;
```

## 주의

- DB 파일은 보통 **저장소에 올리지 않는다**(`.gitignore`에 `*.db`). 실제 사용자 데이터가 섞이기 쉽다. CTF처럼 문제용 데이터가 꼭 필요하면 초기화 스크립트로 만드는 게 더 깔끔하다.
- 여러 사람이 동시에 많이 쓰는 서비스에는 PostgreSQL 같은 서버형 DB가 맞다.
- 명령줄에서 보기: `sqlite3 rank.db` → `.tables`, `.schema records`
