---
title: YAML
description: 들여쓰기로 구조를 표현하는 설정 파일 형식의 규칙과, 값이 엉뚱하게 해석되는 함정
tags: [cs]
order: 3
created: 2026-11-01
updated: 2026-11-01
---

## YAML이란

**YAML**은 들여쓰기로 구조를 표현하는 텍스트 형식이다. 2001년에 처음 나왔고, 지금은 1.2 버전이 표준이다.
이름은 처음엔 "Yet Another Markup Language"였다가, 문서가 아니라 데이터를 위한 형식이라는 뜻으로 **"YAML Ain't Markup Language"**로 바뀌었다.

[[json|JSON]]과 표현할 수 있는 내용은 거의 같지만, 괄호와 따옴표를 줄여서 **사람이 쓰고 읽기 편한 것**을 목표로 한다.
그래서 주로 사람이 직접 고치는 **설정 파일**에 쓰인다.

| 항목 | 값 |
| --- | --- |
| 확장자 | `.yaml`, `.yml` (둘 다 같다) |

## 기본 구조

```yaml
# 주석을 쓸 수 있다
name: 민수
age: 17
student: true
subjects:          # 목록은 - 로
  - 국어
  - 수학
address:           # 들여쓰기로 안에 넣는다
  city: 서울
memo: |            # | 는 줄바꿈을 그대로 살린 여러 줄 글
  첫째 줄
  둘째 줄
```

위 내용을 JSON으로 바꾸면 `{"name": "민수", "age": 17, "subjects": ["국어", "수학"], ...}`가 된다.
YAML 1.2는 JSON을 포함하도록 만들어져서, JSON 문법으로 적어도 대부분 YAML로 읽힌다.

## 꼭 지켜야 할 규칙

- **들여쓰기는 스페이스만:** 탭을 쓰면 오류가 난다.
- **같은 단계는 같은 칸만큼:** 들여쓰기가 한 칸만 어긋나도 구조가 바뀌거나 오류가 난다.
- **콜론 뒤에 한 칸:** `name:민수`가 아니라 `name: 민수`다.

## 함정: 값이 알아서 바뀐다

YAML은 따옴표 없이 적은 값의 **자료형을 알아서 추측**한다. 편하지만 의도와 다르게 읽히는 경우가 있다.

| 적은 값 | 기대한 것 | 실제로 읽히는 것 |
| --- | --- | --- |
| `version: 3.10` | 글자 "3.10" | 숫자 `3.1` |
| `period: 2026.10` | 글자 "2026.10" | 숫자 `2026.1` |
| `zip: 01234` | 글자 "01234" | 숫자 (앞의 0이 사라지거나 8진수로 해석) |
| `country: NO` | 글자 "NO" (노르웨이) | 옛 방식(YAML 1.1)에서는 `false` |

이 사이트에서도 프로젝트 문서의 `period: 2026.10`이 숫자로 읽혀서 페이지가 빠진 적이 있다.
**글자로 쓰고 싶은 값은 따옴표로 감싸는 습관**을 들이면 된다: `period: "2026.10"`

## 어디에 쓰나

| 쓰는 곳 | 예 |
| --- | --- |
| 이 사이트 | 태그 목록 `content/tags.yml`, 관리 화면 설정 `admin/config.yml` |
| 문서 속성 | 마크다운 문서 맨 위 `---` 사이의 **frontmatter**가 YAML이다 |
| CI/CD | GitHub Actions의 `.github/workflows/*.yml` |
| 컨테이너 | Docker Compose의 `compose.yaml`, Kubernetes 설정 |

## 파이썬에서 읽기

표준 라이브러리에는 없어서 `PyYAML`(`pip install pyyaml`)을 쓴다.

```python
import yaml

with open("tags.yml", encoding="utf-8") as f:
    data = yaml.safe_load(f)
```

**`yaml.load()` 대신 `yaml.safe_load()`를 쓰자.** 옛 방식의 `load`는 YAML 안의 특수 태그로 파이썬 객체를 만들 수 있어서, 믿을 수 없는 파일을 읽으면 코드가 실행될 수 있다. ([[owasp-top-10#a08-software-or-data-integrity-failures-무결성-실패|OWASP Top 10 A08]])
