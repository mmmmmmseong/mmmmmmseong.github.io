---
title: Git 자주 쓰는 명령어
description: 매번 검색하게 되는 Git 명령어 모음
tags: [git, 도구]
created: 2026-10-28
updated: 2026-10-29
---

## 기본 흐름

```bash
git clone <주소>              # 저장소 내려받기
git status                    # 바뀐 파일 확인
git add <파일>                # 커밋할 파일 고르기 (전부: git add -A)
git commit -m "메시지"
git pull                      # 원격의 새 커밋 받기
git push                      # 내 커밋 올리기
```

## 되돌리기

```bash
git restore <파일>          # 작업 중인 변경 취소
git restore --staged <파일> # add 취소
git commit --amend          # 마지막 커밋 메시지 수정 (push 전에만)
git revert <커밋>           # 이미 push한 커밋을 되돌리는 새 커밋 만들기
```

## 브랜치

```bash
git switch -c <새-브랜치>
git switch <브랜치>
git branch -d <브랜치>
git merge <브랜치>          # 현재 브랜치에 합치기
```

## 기록 보기

```bash
git log --oneline -10       # 최근 커밋 10개 한 줄씩
git log --reverse --format='%ad %s' --date=short | head -1   # 첫 커밋 날짜
git diff                    # 아직 add 안 한 변경
git diff --staged           # add 한 변경
```

## 올리면 안 되는 파일을 올렸을 때

```bash
echo ".env" >> .gitignore
git rm --cached .env        # 저장소에서만 빼고 내 PC 파일은 유지
git commit -m "Stop tracking .env"
```

`rm --cached`는 **앞으로** 추적하지 않게 할 뿐, 이전 커밋에는 그대로 남아 있습니다. 비밀값이었다면 먼저 키를 바꿔야 합니다. ([[env로-api-키-관리]])

`__pycache__/`, `*.db`, `.env`처럼 실행하면 생기는 파일은 처음부터 `.gitignore`에 넣어둡니다.

> 작성법은 [[위키-사용법]]을 참고하세요.
