# What grade are you in? · 학년과 학교 장소 묻고 답하기

5학년 영어 **학년 묻고 답하기 · 장소 위치(층) 말하기** 단원 학습용 웹앱입니다.
(기존 *Can you come to the ___?* 웹앱과 같은 구성 · 같은 디자인)

## 주요 표현

| 역할 | 표현 |
|------|------|
| 학년 묻기 | **What grade are you in?** |
| 학년 대답 | **I'm in the ___ grade.** (first ~ sixth) |
| 장소 묻기 | **Where is the ___?** |
| 층 대답 | **It's on the ___ floor.** (first ~ sixth) |

- 🎓 학년 6개: first · second · third · fourth · fifth · sixth grade
- 🔢 층 6개: first ~ sixth floor
- 🏫 학교 장소 10개: library · music room · art room · science room · computer room · gym · cafeteria · nurse's office · teachers' office · principal's office

## 기능

- 🎓 **학년 묻고 답하기** — 질문 배너 + 초급·중급·고급 × 1~3학년/4~6학년, **총 18문장** + 빈칸 채우기
- 🏫 **장소 묻기** — `Where is the ___?` 장소 카드 10개
- 🔢 **층 말하기** — `It's on the ___ floor.` 카드 6개 + 장소·층을 골라 묻고 답하기 빈칸 채우기
- 🎒 **내 학교 만들기** — 내 학년 1개 + **장소 3개**(장소마다 층 1개)를 골라 4줄 대화 완성
  - 🏫 **내 학교 안내도**: 고른 장소가 1~6층 건물 그림에 표시됨
  - 🎲 무작위 채우기 · 브라우저에 저장 · 📝 **워크시트에 적기** 표
- 🎤 **연습 · 짝 활동** — 👫 짝 활동 카드 + 컴퓨터와 미리 연습
  - 줄마다 🎙️ 말하기로 정확도 측정, 🎭 역할극(A 묻기 / B 대답하기) (Chrome 권장)
- 단어 클릭 시 **뜻 풍선 + 발음**, 말하기 **속도 조절** 슬라이더

## 🎨 그림 (Canva)

카드 그림은 `images/` 폴더의 Canva 그림을 사용합니다. 파일 이름과 Canva 프롬프트는
[`images/README.md`](images/README.md)에 있습니다. 그림이 아직 없으면 이모지로 표시됩니다.

## 사용 방법

`index.html`을 브라우저(크롬 권장)에서 열면 됩니다. 별도 설치가 필요 없습니다.

## 파일 구성

| 파일 | 설명 |
|------|------|
| `index.html` | 화면 구조(탭·섹션) |
| `style.css`  | 디자인 |
| `data.js`    | 학년·층·장소 데이터, 학년 문장(초·중·고급), 단어 뜻 |
| `app.js`     | 음성·단어 풍선·내 학교 만들기·안내도·연습(역할극) 채점 로직 |
| `images/`    | Canva 그림 폴더 (파일 이름 안내: `images/README.md`) |
