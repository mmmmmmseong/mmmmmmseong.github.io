---
title: Fabric 모드 개발 환경
description: Minecraft Fabric 모드를 만들기 위한 JDK·Gradle·Loom 설정과 자주 쓰는 Gradle 작업
tags: [게임, 도구]
created: 2026-10-29
updated: 2026-10-29
---

> 관련 프로젝트: [[mode|Fantasy Economy: Minecraft 경제 모드]] · [GitHub](https://github.com/mmmmmmseong/mode)

## 구성 요소

| 이름 | 역할 |
| --- | --- |
| **Fabric Loader** | 게임 실행 시 모드를 불러오는 로더 |
| **Fabric API** | 이벤트, 아이템 등록 등 모드가 쓰는 공용 기능 모음 |
| **Fabric Loom** | 모드 개발용 Gradle 플러그인. 게임 다운로드, 실행, 빌드를 맡음 |
| **Gradle** | 빌드 도구. 저장소의 `gradlew`(wrapper)가 정해진 버전을 받아 씀 |
| **JDK** | Minecraft 버전에 맞는 Java. 26.1.2는 **Java 25** |

Fantasy Economy에서 검증한 조합:

| 항목 | 버전 |
| --- | --- |
| Minecraft | 26.1.2 |
| Fabric Loader | 0.19.5 |
| Fabric API | 0.155.3+26.1.2 |
| Fabric Loom | 1.18 |
| Gradle | 9.7.1 |
| Java | 25 |

버전은 `gradle.properties`에 모아두고, 공식 템플릿(`FabricMC/fabric-example-mod`의 해당 버전 브랜치)과 `meta.fabricmc.net`에서 맞는 값을 확인합니다.

## 시스템 Java를 건드리지 않고 JDK 쓰기

PC에 다른 버전의 Java가 깔려 있어도, JDK 25를 따로 받아 두고 **빌드할 때만** 지정할 수 있습니다.

```powershell
# PowerShell
$env:JAVA_HOME = "$env:USERPROFILE\.jdks\jdk-25.0.4.1+1"
.\gradlew build
```

```bash
# macOS / Linux
export JAVA_HOME=~/.jdks/jdk-25
./gradlew build
```

## 자주 쓰는 Gradle 작업

| 명령 | 하는 일 |
| --- | --- |
| `gradlew build` | 모드 jar 만들기 + 단위 테스트 (`build/libs/`) |
| `gradlew runClient` | 개발용 게임 클라이언트 실행 |
| `gradlew runServer` | 개발용 서버 실행 |
| `gradlew runGameTest` | 실제 서버를 띄워 GameTest 통합 테스트 실행 |
| `gradlew runClientGameTest` | 클라이언트를 띄워 화면 테스트·스크린샷 |

## 설치

- 빌드한 jar와 같은 버전용 Fabric API를 `.minecraft/mods`에 넣습니다.
- **새 아이템·블록을 등록하는 모드는 서버와 클라이언트 모두에** 설치해야 합니다.

## 테스트 습관

- 게임 로직(가격 계산 등)은 Minecraft에 의존하지 않는 클래스로 빼서 **JUnit으로 빠르게** 테스트합니다.
- 실제 게임과 맞물리는 부분은 **Fabric GameTest**로 서버를 띄워 확인합니다.
- 설정 파일의 잘못된 값도 테스트에서 잡게 하면, 빌드가 실패해서 실수를 바로 알 수 있습니다.

## 관련 문서

- [[게임-경제-설계]]: 이 환경에서 만든 경제 시스템의 설계
