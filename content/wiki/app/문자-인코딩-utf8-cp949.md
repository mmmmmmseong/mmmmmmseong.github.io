---
title: "문자 인코딩: UTF-8과 CP949"
description: 한글이 깨지는 이유와 UTF-8·EUC-KR·CP949의 차이, 응답 인코딩 자동 감지
tags: [앱, 웹]
created: 2026-10-29
updated: 2026-10-29
---

> 관련 프로젝트: [[schoolhelper|School Helper: 컴시간 시간표 앱]] · [GitHub](https://github.com/mmmmmmseong/schoolhelper)

## 인코딩이란

컴퓨터는 글자를 숫자(바이트)로 저장합니다. **어떤 글자를 어떤 바이트로 바꿀지 정한 규칙**이 인코딩입니다.
저장할 때와 읽을 때 규칙이 다르면 글자가 깨집니다(예: `ì•ˆë…•`, `�����`).

## 한글에서 자주 만나는 세 가지

| 인코딩 | 한글 한 글자 | 특징 |
| --- | --- | --- |
| **UTF-8** | 3바이트 | 전 세계 문자를 모두 표현. 웹의 표준 |
| **EUC-KR** | 2바이트 | 옛 한국어 표준. 완성형 한글 **2,350자**만 표현 (`똠`, `뷁` 같은 글자는 없음) |
| **CP949** | 2바이트 | EUC-KR을 확장한 윈도우 방식. 한글 **11,172자** 모두 표현 |

CP949는 EUC-KR을 포함하므로, 오래된 한국 서비스의 응답은 대부분 CP949로 읽으면 됩니다.

## 겪었던 문제: 컴시간 응답

컴시간 서버는 상황에 따라 UTF-8 또는 CP949로 응답했습니다. 그래서 **먼저 UTF-8로 읽어보고, 실패하면 CP949로** 읽게 했습니다.

```dart
import 'dart:convert';
import 'package:cp949_codec/cp949_codec.dart';

String body;
try {
  body = utf8.decode(response.bodyBytes);   // 잘못된 UTF-8이면 FormatException
} catch (_) {
  body = cp949.decode(response.bodyBytes);
}
```

- Dart의 `utf8.decode`는 UTF-8 규칙에 맞지 않는 바이트를 만나면 예외를 던집니다. 이 성질을 **자동 감지**에 이용한 것입니다.
- 반대 순서(CP949 먼저)는 안 됩니다. CP949 디코더는 UTF-8 바이트도 오류 없이 엉뚱한 글자로 읽어버릴 수 있습니다.

### 덤: 응답 끝의 쓰레기 값

응답 JSON 뒤에 불필요한 문자가 붙어 와서 `jsonDecode`가 실패했습니다. 마지막 `}`까지만 잘라서 해결했습니다.

```dart
final lastBrace = body.lastIndexOf('}');
if (lastBrace != -1) body = body.substring(0, lastBrace + 1);
```

## 다른 곳에서 만나는 경우

- **CSV 파일:** 엑셀에서 "CSV UTF-8"로 저장하면 맨 앞에 **BOM**(`EF BB BF`)이 붙습니다. 파이썬에서는 `encoding="utf-8-sig"`로 읽으면 BOM이 제거됩니다. ([[folium-지도]])
- **엑셀에서 UTF-8 CSV를 열 때 한글이 깨지면:** BOM이 없는 UTF-8이라서입니다. BOM을 붙여 저장하거나 "데이터 가져오기"로 인코딩을 지정합니다.
- **HTTP:** 응답 헤더의 `Content-Type: text/html; charset=...`에 인코딩이 적혀 있으면 그것을 먼저 따릅니다.

## 원칙

새로 만드는 파일, DB, API는 **모두 UTF-8**로 통일하고, 다른 인코딩은 외부 데이터를 읽는 입구에서만 변환합니다.
