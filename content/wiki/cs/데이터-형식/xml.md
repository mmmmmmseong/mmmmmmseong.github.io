---
title: XML
description: 직접 정한 태그로 데이터 구조를 표현하는 형식의 규칙, HTML과의 차이, 지금 쓰이는 곳
tags: [cs]
order: 4
created: 2026-11-01
updated: 2026-11-01
---

## XML이란

**XML(eXtensible Markup Language)**은 **태그로 데이터의 구조를 표현**하는 텍스트 형식이다. 1998년 W3C 표준이 되었다.
모양은 [[html|HTML]]과 비슷하지만, 태그 이름을 **직접 정할 수 있다(eXtensible)**는 점이 다르다.

[[json|JSON]]이 널리 쓰이기 전에는 웹 서비스끼리 데이터를 주고받는 대표 형식이었다.
지금은 새 API에서는 JSON에 많이 밀렸지만, 문서와 설정 파일 곳곳에 여전히 남아 있다.

| 항목 | 값 |
| --- | --- |
| 확장자 | `.xml` |
| MIME 타입 | `application/xml`, `text/xml` |

## 기본 구조

```xml
<?xml version="1.0" encoding="UTF-8"?>
<student id="1">
  <name>민수</name>
  <age>17</age>
  <subjects>
    <subject>국어</subject>
    <subject>수학</subject>
  </subjects>
</student>
```

- **요소:** `<name>민수</name>`처럼 여는 태그와 닫는 태그로 감싼다.
- **속성:** `id="1"`처럼 여는 태그 안에 덧붙이는 정보다.
- 맨 위의 `<?xml ... ?>`는 버전과 인코딩을 알려주는 선언이다.

## 꼭 지켜야 할 규칙

HTML은 태그를 조금 틀려도 브라우저가 알아서 보여주지만, XML은 **규칙을 하나라도 어기면 읽지 못한다.**

- 모든 태그는 **닫아야 한다.** 내용이 없으면 `<br/>`처럼 스스로 닫는다.
- 최상위 요소는 **딱 하나**여야 한다.
- 태그 이름은 **대소문자를 구분**한다. `<Name>`과 `<name>`은 다른 태그다.
- 속성 값은 **따옴표로 감싼다.**
- `<`, `&`는 내용에 그대로 쓸 수 없어서 `&lt;`, `&amp;`로 적는다.

## HTML, JSON과 비교

| 구분 | XML | HTML | JSON |
| --- | --- | --- | --- |
| 목적 | 데이터를 **담기** | 내용을 **보여주기** | 데이터를 **담기** |
| 태그 | 직접 정함 | 정해진 태그만 | 태그 없음 |
| 엄격함 | 매우 엄격 | 너그러움 | 엄격 |
| 크기 | 닫는 태그 때문에 큼 | | 작음 |
| 기타 | 속성, 주석, 스키마(XSD)로 구조 검증 가능 | | 주석 없음 |

## 지금도 쓰이는 곳

| 쓰는 곳 | 예 |
| --- | --- |
| 안드로이드 | 화면 레이아웃, `AndroidManifest.xml`, 문자열 리소스 |
| Java 빌드 | Maven의 `pom.xml` |
| 웹 | 사이트 지도 `sitemap.xml`([[웹-정찰]]), RSS 피드, SVG 이미지 |
| 오피스 문서 | `.docx`, `.xlsx`는 사실 **XML 파일들을 ZIP으로 묶은 것**이다. 확장자를 `.zip`으로 바꿔 풀어보면 안의 XML이 보인다 |

## 파이썬에서 읽기

표준 라이브러리 `xml.etree.ElementTree`를 쓴다.

```python
import xml.etree.ElementTree as ET

root = ET.parse("student.xml").getroot()
print(root.get("id"))                 # 속성 → "1"
print(root.find("name").text)         # 요소 → "민수"
for s in root.iter("subject"):
    print(s.text)
```

## 보안 관점: XXE

XML에는 **외부 엔티티**라는 기능이 있어서, 문서 안에서 다른 파일이나 주소의 내용을 끌어올 수 있다.
이걸 악용해 서버의 파일을 읽어내는 공격이 **XXE(XML External Entity)**다.

- 외부에서 받은 XML을 읽을 때는 외부 엔티티 기능을 꺼두자.
- 파이썬 공식 문서도 표준 `xml` 모듈은 악의적인 데이터에 안전하지 않다고 안내한다. 믿을 수 없는 XML은 `defusedxml` 패키지로 읽는 것이 좋다.
