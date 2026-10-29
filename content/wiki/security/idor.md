---
title: IDOR (안전하지 않은 직접 객체 참조)
description: 주소의 ID만 바꾸면 남의 데이터가 보이는 권한 검증 누락 취약점
tags: [보안, 웹]
created: 2026-10-29
updated: 2026-10-29
---

> 관련 프로젝트: [[ctf|웹 CTF: 사내 인트라넷 침투]] · [GitHub](https://github.com/mmmmmmseong/CTF)

## 원리

**IDOR(Insecure Direct Object Reference)**는 서버가 요청한 데이터의 **주인이 누구인지 확인하지 않아서**, ID 값만 바꾸면 다른 사람의 데이터에 접근할 수 있는 취약점이다.
OWASP Top 10의 *Broken Access Control(접근 제어 실패)*에 속한다.

CTF 프로젝트의 프로필 페이지는 일부러 이렇게 만들었다.

```python
# ❌ 취약한 코드 (CTF 문제용)
@intranet_bp.route('/profile')
def profile():
    user_id = request.args.get('user_id')       # 주소에서 받은 ID를
    cur.execute("SELECT * FROM users WHERE id = ?", (user_id,))  # 그대로 조회
    ...
```

로그인한 뒤 `/intranet/profile?user_id=1`처럼 숫자만 바꾸면 다른 직원의 프로필이 보인다.
쿼리는 파라미터 바인딩을 써서 [[sql-인젝션]]에는 안전하지만, **"이 사람이 이 데이터를 봐도 되는가"**를 확인하지 않는다.

## 막는 법

### 1. 서버에서 권한을 확인한다

```python
# ✅ 본인 것만 보거나, 관리자만 남의 것을 볼 수 있게
user_id = request.args.get('user_id', type=int)
if user_id != session.get('user_id') and session.get('role') != 'admin':
    abort(403)
```

### 2. 애초에 ID를 받지 않는다
"내 프로필"처럼 본인 데이터만 보는 기능이면, 주소에서 ID를 받지 말고 **세션의 사용자 ID**로 조회한다.

### 3. 추측하기 어려운 ID는 보조 수단일 뿐
1, 2, 3 대신 UUID를 쓰면 찾기 어려워지지만, ID가 한 번 노출되면 그만이다. **권한 확인을 대신할 수 없다.**

## 찾는 요령 (공격자 입장)

- 주소, 폼의 숨은 값, API 요청 본문에서 `id`, `user_id`, `no` 같은 값을 찾는다.
- 두 계정을 만들어 A의 ID로 B가 요청해 본다.
- 조회뿐 아니라 **수정·삭제** 요청에서도 같은 문제가 있는지 확인한다.

## 관련 문서

- [[flask-세션]]: 세션에 저장한 사용자 정보로 권한을 확인할 때 주의할 점
