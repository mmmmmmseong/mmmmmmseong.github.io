---
title: SQL 인젝션
description: 입력이 SQL 코드로 해석되는 취약점의 원리와 파라미터 바인딩으로 막는 법
tags: [보안, 웹]
created: 2026-10-29
updated: 2026-10-29
---

> 관련 프로젝트: [[ctf|웹 CTF: 사내 인트라넷 침투]] · [GitHub](https://github.com/mmmmmmseong/CTF)

## 원리

사용자 입력을 SQL 문자열에 **그대로 이어 붙이면**, 입력 안의 따옴표나 키워드가 SQL 문법으로 해석된다.
CTF 프로젝트의 로그인 코드는 일부러 이렇게 만들었다.

```python
# ❌ 취약한 코드 (CTF 문제용)
query = f"SELECT id, username, role FROM users WHERE username = '{username}' AND password = '{password}'"
cur.execute(query)
```

아이디 칸에 `' OR '1'='1' --`를 넣으면 쿼리가 이렇게 바뀐다.

```sql
SELECT id, username, role FROM users WHERE username = '' OR '1'='1' --' AND password = '...'
```

- `'`로 원래 문자열을 닫고
- `OR '1'='1'`로 항상 참인 조건을 만들고
- `--`로 뒤의 비밀번호 조건을 주석 처리한다.

결과적으로 비밀번호 없이 첫 번째 사용자로 로그인된다.

## 막는 법: 파라미터 바인딩

값은 SQL 문자열에 넣지 말고 **자리표시자(`?`)로 따로** 전달한다. 그러면 DB가 값을 항상 데이터로만 취급한다.

```python
# ✅ 안전한 코드
cur.execute(
    "SELECT id, username, role FROM users WHERE username = ? AND password = ?",
    (username, password),
)
```

CTF 프로젝트의 프로필 조회는 이미 이 방식을 쓴다. 그래서 SQL 인젝션은 안 되지만, 다른 문제([[idor]])가 있다.

## 같이 지킬 것

- **비밀번호는 평문으로 저장하지 않는다.** bcrypt, Argon2 같은 해시 함수로 저장하고, 로그인할 때 해시를 비교한다.
- **에러 메시지에 SQL을 보여주지 않는다.** 공격자에게 쿼리 구조를 알려주게 된다.
- **DB 계정 권한을 최소로** 준다. 읽기만 하는 기능은 읽기 권한만.
- ORM(SQLAlchemy 등)을 쓰면 기본적으로 바인딩이 적용되지만, 문자열로 직접 쿼리를 만드는 기능(`text()` 등)을 쓸 때는 똑같이 조심해야 한다.

## 관련 문서

- [[sqlite-기본]]: 파라미터 바인딩을 쓰는 SQLite 기본 사용법
- [[ctf-문제-설계]]: 이 취약점을 문제로 만든 과정
