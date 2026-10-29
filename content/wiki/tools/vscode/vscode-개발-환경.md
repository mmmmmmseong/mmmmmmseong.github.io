---
title: VS Code 개발 환경
description: 내가 쓰는 언어별 VS Code 설정 — Python, Java, 웹, C/C++, WSL
tags: [도구]
order: 2
created: 2026-10-29
updated: 2026-10-29
---

실제로 설치해서 쓰고 있는 확장 기준으로 정리했다.

## Python

> 관련 프로젝트: [[promptinjection|Break The AI]] · [GitHub](https://github.com/mmmmmmseong/PromptInjection) / [[ctf|웹 CTF]] · [GitHub](https://github.com/mmmmmmseong/CTF) / [[map|학교 등산 행사 지도]] · [GitHub](https://github.com/mmmmmmseong/map)

### 쓰는 확장

| 확장 | 역할 |
| --- | --- |
| **Python** | Python 지원의 기본. 실행, 인터프리터 선택 |
| **Pylance** | 자동 완성, 타입 검사, 오류 표시 |
| **Python Debugger** (debugpy) | 중단점 디버깅 |
| **Python Environments** | 가상환경 만들기·고르기를 화면에서 관리 |

### 인터프리터를 먼저 고른다

`import flask`에 빨간 줄이 생기는 가장 흔한 원인은 **VS Code가 다른 Python을 보고 있어서**다.
패키지는 가상환경에 설치했는데, VS Code는 시스템 Python을 쓰고 있는 경우다.

1. 명령 팔레트 → `Python: Select Interpreter`
2. 프로젝트의 `.venv`를 고른다.
3. 상태 표시줄 오른쪽 아래에 고른 버전과 가상환경 이름이 보이는지 확인한다.

### 가상환경 만들기

명령 팔레트 → `Python: Create Environment` → `Venv`를 고르면 `.venv` 폴더를 만들고 `requirements.txt` 설치까지 해준다.
터미널로 하려면:

```powershell
python -m venv .venv
.venv\Scripts\activate          # Windows
pip install -r requirements.txt
```

PowerShell에서 "이 시스템에서 스크립트를 실행할 수 없으므로…" 오류가 나면, 현재 사용자에게만 스크립트 실행을 허용한다.

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

`.venv`는 `.gitignore`에 넣는다.

### Flask 디버깅

`print()`를 여기저기 넣는 대신 **중단점**을 쓴다. 줄 번호 왼쪽을 클릭해 빨간 점을 찍고 `F5`로 실행하면, 그 줄에서 멈춰 변수 값을 볼 수 있다.

`.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Flask",
      "type": "debugpy",
      "request": "launch",
      "module": "flask",
      "env": { "FLASK_APP": "app.py", "FLASK_DEBUG": "1" },
      "args": ["run", "--no-debugger", "--no-reload"],
      "jinja": true
    },
    {
      "name": "Streamlit",
      "type": "debugpy",
      "request": "launch",
      "module": "streamlit",
      "args": ["run", "main.py"]
    }
  ]
}
```

- Flask: `--no-debugger`는 Flask 자체 디버거를 꺼서 VS Code 디버거와 겹치지 않게 한다. `"jinja": true`면 템플릿 안에도 중단점을 찍을 수 있다.
- Streamlit: 등산 지도처럼 `streamlit run`으로 실행하는 앱용이다.

| 단축키 | 디버깅 중 하는 일 |
| --- | --- |
| `F5` | 시작 / 다음 중단점까지 계속 |
| `F10` | 한 줄 실행 (함수 안으로 안 들어감) |
| `F11` | 함수 안으로 들어가기 |
| `Shift+F5` | 디버깅 끝내기 |

## Java

> 관련 프로젝트: [[mode|Fantasy Economy: Minecraft 경제 모드]] · [GitHub](https://github.com/mmmmmmseong/mode)

### 쓰는 확장

**Extension Pack for Java** 하나를 설치하면 아래가 함께 들어온다.

| 확장 | 역할 |
| --- | --- |
| Language Support for Java (Red Hat) | 자동 완성, 오류 표시, 리팩터링 |
| Debugger for Java | 디버깅 |
| Test Runner for Java | JUnit 테스트 실행 |
| Maven for Java / Project Manager for Java | 프로젝트·의존성 관리 |

여기에 Gradle 프로젝트를 위해 **Gradle for Java**를 따로 쓴다. 사이드바의 Gradle 아이콘에서 `build`, `runClient` 같은 작업을 클릭해서 실행할 수 있다.

### JDK 지정

시스템에 오래된 Java만 있어도, 프로젝트용 JDK를 따로 받아 VS Code에 알려줄 수 있다. ([[fabric-모드-개발-환경]])

```jsonc
// 사용자 설정 (settings.json)
"java.configuration.runtimes": [
  {
    "name": "JavaSE-25",
    "path": "C:\\Users\\<사용자>\\.jdks\\jdk-25.0.4.1+1",
    "default": true
  }
]
```

### Fabric 모드 실행

Fabric Loom은 VS Code용 실행 설정을 만들어 준다.

```powershell
.\gradlew vscode
```

그러면 `.vscode/launch.json`에 Minecraft 클라이언트·서버 실행 항목이 생겨서, `F5`로 게임을 띄우고 모드 코드에 중단점을 찍을 수 있다.

## 웹 (HTML·CSS·JS)

HTML·CSS·JS는 VS Code에 기본으로 들어 있어서 따로 확장이 필요 없다. 여기에 **Live Server**를 쓴다.

- HTML 파일을 연 상태에서 상태 표시줄의 **Go Live**를 누르면 브라우저가 열리고, 저장할 때마다 자동으로 새로고침된다.
- Flask 템플릿처럼 서버가 그려주는 페이지에는 맞지 않는다. 그때는 Flask를 직접 실행한다.
- 이 사이트(Astro)는 `npm run dev`로 띄운다.

## C/C++

**C/C++** 확장(Microsoft)은 자동 완성과 디버깅을 맡는다.
**컴파일러는 들어 있지 않아서** 따로 설치해야 한다. Windows에서는 MSVC(Visual Studio Build Tools)나 MinGW-w64를 쓰거나, 아래 WSL 안의 `gcc`를 쓴다.

## WSL

**WSL** 확장을 쓰면 Windows의 VS Code 화면 그대로, 실제 작업은 WSL(리눅스) 안에서 할 수 있다.

- WSL 터미널에서 프로젝트 폴더로 가서 `code .`을 입력하거나, 명령 팔레트 → `WSL: Connect to WSL`
- 왼쪽 아래에 `WSL: Ubuntu` 같은 표시가 뜨면 연결된 것이다.
- 확장은 **Windows 쪽과 WSL 쪽에 따로** 설치된다. WSL에 연결한 상태에서 확장 화면을 보면 "WSL에 설치" 버튼이 따로 있다.
- 리눅스 전용 도구(gcc, 보안 도구 등)를 쓸 때 편하다.
