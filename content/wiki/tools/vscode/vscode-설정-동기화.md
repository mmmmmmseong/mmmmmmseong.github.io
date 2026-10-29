---
title: VS Code 설정 동기화
description: 여러 PC에서 같은 설정·확장 쓰기 — 설정 동기화, 프로필, 확장 목록 백업
tags: [도구]
order: 5
created: 2026-10-29
updated: 2026-10-29
---

집 PC, 학교 PC, 노트북에서 VS Code를 쓸 때 설정과 확장을 매번 다시 맞추지 않아도 된다.

## 설정 동기화 켜기

1. 왼쪽 아래 **톱니바퀴(관리)** → **설정 동기화 켜기**
2. 동기화할 항목을 고른다.
3. **GitHub** 또는 **Microsoft** 계정으로 로그인한다.
4. 다른 PC에서도 같은 계정으로 1~3을 하면 설정이 그대로 내려온다.

### 동기화되는 것

| 항목 | 내용 |
| --- | --- |
| 설정 | 사용자 `settings.json` |
| 바로 가기 키 | 단축키 변경 |
| 사용자 코드 조각 | 직접 만든 snippet |
| 사용자 작업 | 사용자 수준 task |
| UI 상태 | 사이드바 배치 등 |
| 확장 | 설치한 확장 목록과 켜고 끈 상태 |
| 프로필 | 아래 "프로필" |

**작업 영역 설정**(`.vscode/settings.json`)은 동기화 대상이 아니다. 그건 프로젝트 폴더와 함께 Git으로 관리된다.

### 처음 켤 때 충돌

이미 설정이 있는 PC에서 켜면 어느 쪽을 쓸지 묻는다.

- **병합:** 양쪽을 합친다 (보통 이걸 고른다)
- **로컬 바꾸기:** 이 PC 설정을 버리고 계정에 저장된 설정을 쓴다
- **원격 바꾸기:** 계정에 저장된 설정을 이 PC 설정으로 덮어쓴다

### 되돌리기

명령 팔레트 → `Settings Sync: Show Synced Data`에서 예전에 동기화된 데이터를 보고 그 시점으로 되돌릴 수 있다.

## PC마다 달라야 하는 설정 빼기

JDK 경로처럼 **PC마다 다른 값**은 동기화되면 다른 PC에서 깨진다. 이런 설정은 동기화에서 뺀다.

```jsonc
"settingsSync.ignoredSettings": [
  "java.configuration.runtimes"
],
"settingsSync.ignoredExtensions": [
  // 이 PC에서만 쓰는 확장 ID
]
```

[[vscode-개발-환경]]의 JDK 설정이 대표적인 예다.

## 프로필

**프로필**은 용도별로 설정과 확장을 묶어둔 세트다. 왼쪽 아래 톱니바퀴 → **프로필**에서 만든다.

| 프로필 예 | 넣을 확장 |
| --- | --- |
| Python | Python, Pylance, Python Debugger, Python Environments, SQLite, REST Client |
| Java | Extension Pack for Java, Gradle for Java |
| 보안 분석 | APKLab, Smali, Smalise |

확장이 많을수록 VS Code가 느려지고 자동 완성이 엉뚱하게 뜨기도 한다. 작업에 맞는 프로필만 켜면 가볍게 쓸 수 있다.
폴더마다 마지막으로 쓴 프로필을 기억하고, 프로필도 설정 동기화로 다른 PC에 넘어간다.

## 확장 목록 백업

계정 없이 확장 목록만 옮기고 싶을 때는 명령어로 저장하고 설치한다.

```powershell
# 목록 저장
code --list-extensions > extensions.txt

# 다른 PC에서 한 번에 설치 (PowerShell)
Get-Content extensions.txt | ForEach-Object { code --install-extension $_ }
```

이 위키의 [[vscode-추천-확장]]도 이 목록을 바탕으로 정리했다.

## WSL 쪽 확장

[[vscode-개발-환경#wsl|WSL]]에 연결해서 쓰는 확장은 WSL 안에 따로 설치된다. 설정 동기화는 Windows 쪽 확장을 기준으로 하므로, WSL 쪽 확장은 연결한 뒤 확장 화면에서 **WSL에 설치**를 눌러 맞춘다.
