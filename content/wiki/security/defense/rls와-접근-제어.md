---
title: RLS와 접근 제어
description: 인증과 인가의 차이, 접근 제어의 원칙, 데이터베이스가 행마다 권한을 검사하는 RLS(행 단위 보안)와 정책 작성법
tags: [보안, 웹]
order: 3
created: 2026-11-20
updated: 2026-11-20
---

> 관련 프로젝트: [[schoolhelper|스쿨헬퍼]] — 공지 테이블이 RLS 없이 열려 있던 문제를 고친 사례

## 인증과 인가

접근 제어는 두 단계로 나뉜다. 이름이 비슷해서 자주 헷갈린다.

| | 인증 (Authentication) | 인가 (Authorization) |
| --- | --- | --- |
| 질문 | **누구인가?** | **무엇을 해도 되는가?** |
| 예 | 아이디·비밀번호 로그인, 지문, OTP | "자기 반 공지만 쓸 수 있다", "관리자만 삭제할 수 있다" |
| 실패하면 | 401 Unauthorized (로그인 필요) | 403 Forbidden (권한 없음) |

실패했을 때의 [[http와-https#상태-코드|HTTP 상태 코드]]도 다르다. 로그인(인증)만 붙이고 권한 검사(인가)를 빠뜨리는 경우가 많다. "로그인한 사람이면 누구나 아무 글이나 지울 수 있는" 상태가 된다.
[[owasp-top-10#a01-broken-access-control-접근-제어-실패|OWASP Top 10의 1위]]가 바로 이 **접근 제어 실패**다. [[idor|IDOR]]도 인가 검사를 빠뜨려서 생기는 대표적인 취약점이다.

## 접근 제어의 원칙

| 원칙 | 뜻 |
| --- | --- |
| **서버에서 검사한다** | 앱이나 브라우저의 검사는 사용자가 마음대로 바꿀 수 있다. 진짜 검사는 서버나 DB가 한다 |
| **기본은 거부** | 허락한 것만 가능하고 나머지는 모두 막는다. "막을 것을 나열"하면 빠뜨린 것이 구멍이 된다 |
| **최소 권한** | 꼭 필요한 권한만 준다. 읽기만 하면 되는 사용자에게 쓰기 권한을 주지 않는다 |
| **매 요청마다 검사** | 로그인할 때 한 번이 아니라, 데이터를 읽고 쓸 때마다 확인한다 |

### 화면에서 숨기는 것은 보안이 아니다

스쿨헬퍼 첫 버전에는 "학생 / 임원"을 고르는 화면이 있었다. 임원을 고르면 공지 작성 버튼이 보였다.
겉보기에는 권한을 나눈 것 같지만, **누구나 "임원"을 누를 수 있었고**, 버튼이 없어도 앱 안의 공개 키로 DB에 직접 요청하면 공지를 쓰고 지울 수 있었다.

버튼을 숨기는 것은 **사용 편의**이지 보안이 아니다. 권한은 데이터가 있는 곳에서 검사해야 한다.

## RLS란

**RLS(Row Level Security, 행 단위 보안)**는 데이터베이스가 **행(row)마다** "이 사용자가 이 행을 읽거나 바꿀 수 있는가"를 검사하는 기능이다. PostgreSQL, SQL Server 등이 지원한다.

일반적인 DB 권한은 **테이블 단위**다. "이 사용자는 notice 테이블을 읽을 수 있다"까지만 정할 수 있다.
RLS는 더 잘게 나눈다. "notice 테이블 중 **자기 반 행만** 수정할 수 있다"처럼 정할 수 있다.

```text
같은 요청: DELETE FROM notice WHERE id = 42

2-3반 임원이 보내면  → 42번이 2-3반 공지면 삭제, 아니면 아무것도 안 지워짐
로그인 안 한 사람이   → 아무것도 안 지워짐
```

앱 코드에 권한 검사를 빠뜨려도 **DB가 마지막에 막아준다.** 그래서 앱이 DB에 직접 접속하는 [[supabase와-baas|Supabase 같은 BaaS]]에서는 RLS가 사실상 유일한 방어선이다.

## 정책 작성하기

RLS는 두 단계로 쓴다. 먼저 테이블에 RLS를 켜고, 그다음 **정책(Policy)**으로 허락할 조건을 적는다.

```sql
-- 1. RLS 켜기: 켜는 순간 정책이 없는 동작은 모두 막힌다 (기본 거부)
alter table notice enable row level security;
```

정책은 동작(SELECT, INSERT, UPDATE, DELETE)마다 따로 만든다. 조건은 두 종류가 있다.

| 조건 | 언제 검사하나 | 쓰는 동작 |
| --- | --- | --- |
| `using (...)` | **이미 있는 행**을 대상으로 할 수 있는가 | SELECT, UPDATE, DELETE |
| `with check (...)` | **새로 쓰는 행**이 조건에 맞는가 | INSERT, UPDATE |

UPDATE는 둘 다 쓴다. "남의 반 공지를 고칠 수 없다"(using)와 "자기 반 공지를 남의 반으로 옮길 수 없다"(with check)를 모두 막아야 하기 때문이다.

### 스쿨헬퍼의 정책

스쿨헬퍼의 규칙은 "읽기는 누구나, 쓰기·수정·삭제는 자기 학급 임원만"이다. 임원 명단은 `executives` 테이블(`user_id`, `grade`, `class`)에 있다. 이 규칙을 정책으로 옮기면 아래와 같은 모양이 된다(실제 정의와 세부는 다를 수 있다).

```sql
-- 읽기: 누구나
create policy "공지 읽기" on notice
  for select using (true);

-- 쓰기: 로그인한 사용자 중, 그 공지의 학년·반 임원만
create policy "자기 반 임원만 작성" on notice
  for insert to authenticated
  with check (
    exists (
      select 1 from executives e
      where e.user_id = auth.uid()
        and e.grade = notice.grade
        and e.class = notice.class
    )
  );

-- 수정: 지금도 자기 반 공지이고(using), 고친 뒤에도 자기 반 공지여야(with check)
create policy "자기 반 임원만 수정" on notice
  for update to authenticated
  using      (exists (select 1 from executives e where e.user_id = auth.uid() and e.grade = notice.grade and e.class = notice.class))
  with check (exists (select 1 from executives e where e.user_id = auth.uid() and e.grade = notice.grade and e.class = notice.class));
```

- `auth.uid()`는 **지금 요청을 보낸 로그인 사용자의 ID**다. Supabase가 로그인 토큰에서 꺼내 준다. 앱이 보낸 값이 아니라서 속일 수 없다.
- `executives`에 없는 사람은 로그인에 성공해도 아무것도 쓸 수 없다. **인증(Auth 계정)과 인가(임원 명단)를 따로** 둔 것이다.
- 전체 공지(학년·반이 비어 있음)는 어느 임원의 반과도 일치하지 않아서 임원도 쓸 수 없다. 의도한 동작이다.

### RLS는 조회 결과도 걸러 준다

RLS가 켜진 테이블은 조건 없이 조회해도 **볼 수 있는 행만** 돌아온다.

스쿨헬퍼는 로그인한 뒤 임원 정보를 이렇게 가져온다.

```dart
// 조건이 없는데도 내 행 하나만 온다
final executive = await client.from('executives').select().maybeSingle();
```

`executives`에 "자기 행만 읽을 수 있다"(`using (user_id = auth.uid())`) 같은 정책이 걸려 있으면, 조건을 적지 않아도 DB가 내 행만 돌려준다. 결과가 없으면 임원이 아니므로 바로 로그아웃시킨다.

## 테이블 권한도 함께 정리한다

PostgreSQL에는 RLS와 별개로 **테이블 단위 권한**(GRANT)이 있다. 둘 다 통과해야 접근할 수 있다.

```sql
-- 로그인하지 않은 사용자(anon)에게서 쓰기 권한을 회수
revoke insert, update, delete, truncate on notice from anon;
```

특히 `TRUNCATE`(테이블 전체 비우기)는 **RLS가 적용되지 않는다.** 행 하나하나를 검사하지 않고 테이블을 통째로 비우기 때문이다. 스쿨헬퍼 첫 버전은 익명 사용자에게 이 권한까지 열려 있어서, 공개 키만 있으면 공지 전체를 한 번에 지울 수 있었다.

## 데이터 규칙은 DB 제약으로

권한과 비슷하게, **데이터의 모양**도 DB가 지키게 하는 편이 안전하다. 앱이 실수해도 잘못된 데이터가 들어가지 않는다.

```sql
alter table notice
  add constraint tag_valid check (tag in ('수행평가', '공지', '행사')),
  add constraint grade_class_pair check ((grade is null) = (class is null));
```

스쿨헬퍼에서 이 제약을 넣은 계기는 두 가지 버그였다.
- 앱이 `tag: null`을 보내서 기본값(`공지`)이 적용되지 않았다.
- 학년만 있고 반이 없는 공지가 생겨서, 어떤 필터에도 걸리지 않아 **아무에게도 보이지 않았다.**

## 점검 목록

- [ ] 클라이언트가 직접 접근하는 테이블은 모두 RLS가 켜져 있는가
- [ ] 정책이 동작(SELECT, INSERT, UPDATE, DELETE)마다 필요한 만큼만 있는가
- [ ] UPDATE 정책에 `using`과 `with check`가 모두 있는가
- [ ] 정책 조건이 앱이 보낸 값이 아니라 `auth.uid()` 같은 **서버가 아는 값**을 기준으로 하는가
- [ ] 익명 사용자의 쓰기·TRUNCATE 권한을 회수했는가
- [ ] 다른 사용자 계정으로 직접 요청해서 정말 막히는지 확인했는가

Supabase 대시보드의 **Security Advisor**는 RLS가 꺼진 테이블을 찾아서 경고해 준다.

## 관련 문서

- [[supabase와-baas]]: 앱이 DB에 직접 접속하는 구조와 공개 키
- [[owasp-top-10]]: A01 접근 제어 실패
- [[idor]]: 인가 검사를 빠뜨려서 생기는 취약점
- [[sql-인젝션]]: DB를 노리는 또 다른 대표 공격
