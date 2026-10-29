---
title: Streamlit 재실행 모델과 멀티페이지
description: 위젯을 누를 때마다 스크립트 전체가 다시 실행되는 Streamlit의 동작과 st.navigation 구조
tags: [웹]
created: 2026-10-29
updated: 2026-10-29
---

> 관련 프로젝트: [[map|학교 등산 행사 지도]] · [GitHub](https://github.com/mmmmmmseong/map)

## 핵심: 매번 처음부터 다시 실행

Streamlit은 버튼을 누르거나 선택 상자를 바꿀 때마다 **스크립트 전체를 위에서부터 다시 실행**한다.
그래서 일반 변수는 매번 초기화된다.

```python
count = 0
if st.button("+1"):
    count += 1
st.write(count)   # 항상 0 또는 1
```

## 값을 유지하려면: session_state

```python
if "count" not in st.session_state:
    st.session_state.count = 0
if st.button("+1"):
    st.session_state.count += 1
st.write(st.session_state.count)
```

위젯에 `key`를 주면 그 값도 `st.session_state[key]`로 읽을 수 있다.

## 느린 작업은 캐시

CSV 읽기, 지도 데이터 계산처럼 매번 할 필요 없는 작업은 캐시한다.

```python
@st.cache_data
def load_points():
    return pd.read_csv("PathMap.csv")
```

## 멀티페이지: st.navigation

등산 지도는 처음에 한 파일이었다가, 지도·안내 페이지와 공통 사이드바로 나눴다.
`main.py`는 **페이지를 등록하고 실행만** 하는 라우터다.

```python
# main.py
pages = [
    st.Page("map_page.py", title="지도", default=True),
    st.Page("info_page.py", title="산행 안내"),
]
navigation = st.navigation(pages, position="hidden")  # 기본 메뉴는 숨기고
navigation.run()
```

```python
# sidebar.py (모든 페이지에서 호출하는 공통 사이드바)
if st.sidebar.button("지도"):
    st.switch_page("map_page.py")
```

### 겪었던 오류: KeyError

`st.page_link("main.py")`나 등록되지 않은 페이지로 `st.switch_page()`를 부르면 `KeyError`가 난다.
`st.navigation`을 쓰면 **진입 파일(main.py)은 페이지 목록에 없기 때문**이다.

해결: 이동할 페이지를 모두 `st.Page`로 등록하고, 진입 파일이 아니라 **등록한 페이지 파일**로 이동한다.

## 그 밖에

- 사이드바 위젯은 `st.sidebar.selectbox()`처럼 `st.sidebar`에서 만들어야 사이드바에 나온다. `st.selectbox()`는 본문에 나온다.
- 지도 그리기는 [[folium-지도]]에 정리했다.
