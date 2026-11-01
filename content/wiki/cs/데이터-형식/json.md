---
title: JSON
description: 객체와 배열로 데이터를 표현하는 텍스트 형식의 규칙, 언어별 사용법, 자주 나는 오류
tags: [cs, 웹]
order: 1
created: 2026-11-01
updated: 2026-11-01
---

## JSON이란

**JSON(JavaScript Object Notation)**은 데이터를 **이름과 값의 쌍**, 그리고 **목록**으로 표현하는 텍스트 형식이다.
2000년대 초 더글러스 크록퍼드(Douglas Crockford)가 정리해 널리 알렸고, 지금은 RFC 8259와 ECMA-404로 표준화되어 있다.

이름처럼 [[javascript|JavaScript]]의 객체 표기에서 문법을 가져왔지만, 실행되는 코드가 아니라 **데이터일 뿐**이다.
그래서 Python, Java, Dart 등 거의 모든 언어에서 읽고 쓸 수 있다.

| 항목 | 값 |
| --- | --- |
| 확장자 | `.json` |
| MIME 타입 | `application/json` |
| 문자 인코딩 | UTF-8 (표준에서 UTF-8을 쓰도록 정했다) |

## 기본 구조

```json
{
  "name": "민수",
  "age": 17,
  "student": true,
  "club": null,
  "subjects": ["국어", "수학"],
  "address": { "city": "서울" }
}
```

- **객체:** `{ }`로 감싸고, 안에 `"이름": 값`을 쉼표로 이어 적는다.
- **배열:** `[ ]`로 감싸고, 값을 순서대로 쉼표로 이어 적는다.
- 객체와 배열은 서로 안에 **얼마든지 겹쳐 넣을 수 있다.**

### 값으로 쓸 수 있는 것

| 종류 | 예 | 비고 |
| --- | --- | --- |
| 문자열 | `"민수"` | 반드시 **큰따옴표** |
| 숫자 | `17`, `3.14`, `-5` | 정수와 실수를 구분하지 않는다 |
| 불리언 | `true`, `false` | 소문자만 |
| null | `null` | 값이 없음 |
| 객체 | `{ ... }` | |
| 배열 | `[ ... ]` | |

날짜, 함수 같은 자료형은 없다. 날짜는 보통 `"2026-11-01"`처럼 **문자열로** 적는다.

## 꼭 지켜야 할 규칙

JavaScript 객체와 비슷해 보여도 JSON이 훨씬 엄격하다.

| JSON에서 안 되는 것 | 예 |
| --- | --- |
| 작은따옴표 | `{'name': '민수'}` ✗ |
| 따옴표 없는 이름 | `{name: "민수"}` ✗ |
| 마지막 쉼표 | `[1, 2, 3,]` ✗ |
| 주석 | `// 설명` ✗ |
| `undefined`, `NaN` | ✗ |

> VS Code의 `settings.json`에는 주석을 쓸 수 있는데, 이건 주석을 허용하는 변형인 **JSONC**(JSON with Comments)로 읽기 때문이다. 확장자를 `.jsonc`로 쓰기도 한다.

## 언어별로 읽고 쓰기

### Python

표준 라이브러리 `json` 모듈을 쓴다.

```python
import json

data = json.loads('{"name": "민수", "age": 17}')   # 문자열 → dict
text = json.dumps(data, ensure_ascii=False, indent=2)  # dict → 문자열

with open("data.json", encoding="utf-8") as f:     # 파일 읽기
    data = json.load(f)
```

- `loads`/`dumps`는 문자열, `load`/`dump`는 파일을 다룬다. 끝의 `s`는 string의 s다.
- `ensure_ascii=False`를 주지 않으면 한글이 `민수`처럼 바뀌어 저장된다. 틀린 건 아니지만 사람이 읽기 어렵다.

| JSON | Python |
| --- | --- |
| 객체 | `dict` |
| 배열 | `list` |
| 문자열 | `str` |
| 숫자 | `int` 또는 `float` |
| `true` / `false` | `True` / `False` |
| `null` | `None` |

### JavaScript

```javascript
const data = JSON.parse('{"name": "민수"}');   // 문자열 → 객체
const text = JSON.stringify(data, null, 2);     // 객체 → 문자열

const res = await fetch("/api/data");
const json = await res.json();                  // 응답 본문을 바로 객체로
```

### Dart

`dart:convert`의 `jsonDecode`, `jsonEncode`를 쓴다. School Helper가 컴시간 응답을 이걸로 읽었다. ([[api-역공학]])

## 어디에 쓰나

- **웹 API:** 서버와 클라이언트가 데이터를 주고받는 사실상의 표준이다. [[크롬-개발자-도구]]의 Network 탭에서 응답을 누르면 JSON이 보기 좋게 펼쳐진다.
- **설정 파일:** `package.json`(Node.js 프로젝트), VS Code의 `settings.json`·`launch.json` ([[vscode-기본]])
- **간단한 저장:** 작은 프로그램의 설정이나 기록을 DB 없이 파일로 저장할 때

## 자주 나는 오류

- **마지막 쉼표, 작은따옴표:** 손으로 고친 JSON에서 가장 흔하다. VS Code는 JSON 파일의 문법 오류에 빨간 줄을 그어준다.
- **JSON이 아닌 응답:** 서버가 오류 페이지(HTML)를 돌려줬는데 JSON으로 읽으려 하면 `Unexpected token '<'` 같은 오류가 난다. 응답 내용부터 확인해보자.
- **뒤에 붙은 쓰레기 값:** 컴시간 응답은 JSON 끝에 불필요한 문자가 붙어 와서 파싱이 실패했다. 마지막 `}`까지만 잘라서 해결했다. ([[문자-인코딩-utf8-cp949]])
- **한글 깨짐:** 형식 문제가 아니라 인코딩 문제다. UTF-8로 읽고 쓰는지 확인하자.

## 보안 관점

- 받은 JSON 문자열을 JavaScript의 `eval()`로 실행해서 읽지 않도록 하자. 데이터 대신 코드가 들어 있으면 그대로 실행된다. 반드시 `JSON.parse`를 쓰면 된다.
- 반대로 JSON은 데이터만 담을 수 있어서, Python `pickle`처럼 역직렬화하면서 코드가 실행되는 형식보다 안전하다. ([[owasp-top-10#a08-software-or-data-integrity-failures-무결성-실패|OWASP Top 10 A08]])
