---
title: Folium으로 지도 그리기
description: 마커·팝업·경로선을 그리고 Streamlit에 띄우는 Folium 기본 사용법
tags: [웹]
created: 2026-10-29
updated: 2026-10-29
---

> 관련 프로젝트: [[map|학교 등산 행사 지도]] · [GitHub](https://github.com/mmmmmmseong/map)

**Folium**은 파이썬으로 Leaflet.js 지도를 만드는 라이브러리다. 결과물은 HTML이라 웹페이지나 Streamlit에 그대로 넣을 수 있다.

## 지도 만들기

```python
import folium

m = folium.Map(location=[37.407576, 126.719651], zoom_start=15, tiles="OpenStreetMap")
```

- `location`: 처음 보여줄 중심 좌표 `[위도, 경도]`
- `zoom_start`: 확대 정도 (클수록 가까이)
- `tiles`: 지도 배경. 바꿔 끼울 수 있다.

## 마커와 팝업

```python
import html

# 지점 종류에 따라 아이콘을 바꾼다
if name == "입구":
    icon = "log-in"
elif name == "정상":
    icon = "flag"
else:
    icon = "map-marker"

popup_html = f"""
<h4>{html.escape(name)}</h4>
<img src="{image_url}" width="180px">
"""

folium.Marker(
    location=[lat, lng],
    popup=folium.Popup(popup_html, max_width=220),
    tooltip=f"{name} (클릭 시 사진 보기)",
    icon=folium.Icon(color=course_color, icon=icon),
).add_to(m)
```

- `popup`: 클릭하면 뜨는 창. HTML을 넣을 수 있어서, 등산 지도에서는 지점 사진을 보여준다.
- `tooltip`: 마우스를 올리면 뜨는 짧은 글
- `icon`: 색과 모양. 등산 지도는 코스마다 색(A 빨강, B 파랑, …)을 정했다.

> 팝업 HTML에 글자를 넣을 때는 `html.escape()`로 감싼다. 그대로 넣으면 그 값에 들어 있는 스크립트가 실행될 수 있다(XSS). 등산 지도도 지점 이름을 이렇게 감싸서 넣는다.

## 경로선

```python
course_points = [[lat1, lng1], [lat2, lng2], ...]   # 순서대로
folium.PolyLine(course_points, color="red", weight=2.5, opacity=1).add_to(m)
```

## 데이터는 CSV로

지점 정보를 코드에 쓰지 않고 `PathMap.csv` 하나에 모았다.

```text
연번,코스,위치명,위도,경도,소요시간,이미지
1,A,입구,37.406063,126.720797,0:00,https://raw.githubusercontent.com/.../A입구.jpg
```

```python
path = pd.read_csv("PathMap.csv", encoding="utf-8-sig")
course_points = path[path["코스"] == "A"][["위도", "경도"]].values.tolist()
```

- 엑셀에서 저장한 CSV는 맨 앞에 BOM이 붙어 첫 열 이름이 `﻿연번`이 될 수 있다. `encoding="utf-8-sig"`로 읽으면 해결된다. ([[문자-인코딩-utf8-cp949]])
- 위치 이름에 쉼표가 있으면 그 칸을 따옴표로 감싸야 한다.

## Streamlit에 띄우기

```python
from streamlit_folium import st_folium

st_folium(m, use_container_width=True, height=400)
```

Streamlit은 위젯을 조작할 때마다 지도를 다시 그린다. ([[streamlit-재실행-모델]])
