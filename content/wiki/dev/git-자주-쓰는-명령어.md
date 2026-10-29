---
title: Git 자주 쓰는 명령어
description: 매번 검색하게 되는 Git 명령어 모음
tags: [git, 도구]
created: 2026-10-28
updated: 2026-10-28
---

## 되돌리기

```bash
git restore <파일>          # 작업 중인 변경 취소
git restore --staged <파일> # add 취소
git commit --amend          # 마지막 커밋 메시지 수정
```

## 브랜치

```bash
git switch -c <새-브랜치>
git branch -d <브랜치>
```

> 작성법은 [[위키-사용법]]을 참고하세요.
