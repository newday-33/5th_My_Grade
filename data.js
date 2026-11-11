/* =========================================================
 * 5학년 · What grade are you in? / Where is the ___? 데이터
 * - 학년 묻고 답하기 : What grade are you in?  →  I'm in the ___ grade.
 *     학년 1~6 × 초급 / 중급 / 고급  (총 18문장)
 * - 장소 묻고 답하기 : Where is the ___?  →  It's on the ___ floor.
 *     학교 장소 10개 · 층 1~6
 * - 내 학교 만들기 (내 학년 + 장소 3개 × 층) 는 app.js 에서 localStorage 에 저장
 * - 이미지: images/ 폴더에 Canva 로 만든 그림을 넣으면 카드에 표시됨
 *           (그림 파일이 없으면 이모지로 대신 표시)
 *           파일 이름과 Canva 프롬프트는 images/README.md 참고
 * - 단어 뜻 사전
 * ========================================================= */

/* ===== 학년 (1~6) ===== */
const GRADES = [
  { n: 1, en: "first",  ko: "1학년", emoji: "1️⃣", img: "images/grade-1.png" },
  { n: 2, en: "second", ko: "2학년", emoji: "2️⃣", img: "images/grade-2.png" },
  { n: 3, en: "third",  ko: "3학년", emoji: "3️⃣", img: "images/grade-3.png" },
  { n: 4, en: "fourth", ko: "4학년", emoji: "4️⃣", img: "images/grade-4.png" },
  { n: 5, en: "fifth",  ko: "5학년", emoji: "5️⃣", img: "images/grade-5.png" },
  { n: 6, en: "sixth",  ko: "6학년", emoji: "6️⃣", img: "images/grade-6.png" },
];

/* ===== 층 (1~6) ===== */
const FLOORS = [
  { n: 1, en: "first",  ko: "1층", emoji: "1️⃣" },
  { n: 2, en: "second", ko: "2층", emoji: "2️⃣" },
  { n: 3, en: "third",  ko: "3층", emoji: "3️⃣" },
  { n: 4, en: "fourth", ko: "4층", emoji: "4️⃣" },
  { n: 5, en: "fifth",  ko: "5층", emoji: "5️⃣" },
  { n: 6, en: "sixth",  ko: "6층", emoji: "6️⃣" },
];

/* ===== 학교 장소 10개 ===== */
const PLACES = [
  { id: "library",          en: "library",           ko: "도서관",    emoji: "📚", img: "images/place-library.png" },
  { id: "music-room",       en: "music room",        ko: "음악실",    emoji: "🎵", img: "images/place-music-room.png" },
  { id: "art-room",         en: "art room",          ko: "미술실",    emoji: "🎨", img: "images/place-art-room.png" },
  { id: "science-room",     en: "science room",      ko: "과학실",    emoji: "🔬", img: "images/place-science-room.png" },
  { id: "computer-room",    en: "computer room",     ko: "컴퓨터실",  emoji: "💻", img: "images/place-computer-room.png" },
  { id: "gym",              en: "gym",               ko: "체육관",    emoji: "🏀", img: "images/place-gym.png" },
  { id: "cafeteria",        en: "cafeteria",         ko: "급식실",    emoji: "🍱", img: "images/place-cafeteria.png" },
  { id: "nurses-office",    en: "nurse's office",    ko: "보건실",    emoji: "🩹", img: "images/place-nurses-office.png" },
  { id: "teachers-office",  en: "teachers' office",  ko: "교무실",    emoji: "🧑‍🏫", img: "images/place-teachers-office.png" },
  { id: "principals-office", en: "principal's office", ko: "교장실",  emoji: "🏅", img: "images/place-principals-office.png" },
];

/* ===== 학년 말하기 (I'm in the ___ grade.) : 초급 / 중급 / 고급 =====
 * 인덱스 = 학년-1  ·  카테고리: low(1~3학년) / high(4~6학년) */
const GRADE_CATEGORIES = ["low", "low", "low", "high", "high", "high"];

const GRADE_LEVELS = {
  beginner: GRADES.map(g => ({
    en: `I'm in the ${g.en} grade.`,
    ko: `나는 ${g.ko}이야.`,
  })),
  intermediate: GRADES.map(g => ({
    en: `I'm in the ${g.en} grade. My classroom is on the ${g.en} floor.`,
    ko: `나는 ${g.ko}이야. 우리 교실은 ${g.n}층에 있어.`,
  })),
  advanced: [
    { en: "I'm in the first grade. My classroom is on the first floor. I'm new at this school.",
      ko: "나는 1학년이야. 우리 교실은 1층에 있어. 나는 이 학교에 처음 왔어." },
    { en: "I'm in the second grade. My classroom is on the second floor. I have many friends.",
      ko: "나는 2학년이야. 우리 교실은 2층에 있어. 나는 친구가 많아." },
    { en: "I'm in the third grade. My classroom is on the third floor. My teacher is kind.",
      ko: "나는 3학년이야. 우리 교실은 3층에 있어. 우리 선생님은 친절하셔." },
    { en: "I'm in the fourth grade. My classroom is on the fourth floor. I like P.E. class.",
      ko: "나는 4학년이야. 우리 교실은 4층에 있어. 나는 체육 시간을 좋아해." },
    { en: "I'm in the fifth grade. My classroom is on the fifth floor. I like English.",
      ko: "나는 5학년이야. 우리 교실은 5층에 있어. 나는 영어를 좋아해." },
    { en: "I'm in the sixth grade. My classroom is on the sixth floor. It's my last year here.",
      ko: "나는 6학년이야. 우리 교실은 6층에 있어. 올해가 이 학교에서 마지막 해야." },
  ],
};

/* 한국어 조사: 받침 있으면 "이", 없으면 "가" */
function koSubj(word) {
  const c = word.charCodeAt(word.length - 1);
  if (c < 0xac00 || c > 0xd7a3) return word + "이(가)";
  return word + ((c - 0xac00) % 28 ? "이" : "가");
}

/* ===== 단어 뜻 사전 ===== */
function wordKey(w) {
  return w.toLowerCase().replace(/^[^a-z0-9'’:]+/, "").replace(/[^a-z0-9'’:]+$/, "").replace(/’/g, "'");
}

const WORD_MEANINGS = {
  "what": "무엇, 어떤",
  "grade": "학년",
  "are": "~이다 (you are)",
  "you": "너, 너희",
  "in": "~안에, ~에 (학년 앞에)",
  "i'm": "나는 ~이다 (I am)",
  "i": "나는",
  "the": "그 (특정한 것)",
  "where": "어디에",
  "is": "~이다, ~에 있다",
  "it's": "그것은 ~이다 / ~에 있다 (it is)",
  "it": "그것",
  "on": "~위에, ~에 (층 앞에)",
  "floor": "층, 바닥",
  "first": "첫 번째(의), 1",
  "second": "두 번째(의), 2",
  "third": "세 번째(의), 3",
  "fourth": "네 번째(의), 4",
  "fifth": "다섯 번째(의), 5",
  "sixth": "여섯 번째(의), 6",
  "library": "도서관",
  "music": "음악",
  "room": "방, 교실",
  "art": "미술",
  "science": "과학",
  "computer": "컴퓨터",
  "gym": "체육관",
  "cafeteria": "급식실, 식당",
  "nurse's": "보건 선생님의 (nurse's office: 보건실)",
  "nurse": "간호사, 보건 선생님",
  "office": "사무실, ~실",
  "teachers'": "선생님들의 (teachers' office: 교무실)",
  "teacher": "선생님",
  "principal's": "교장 선생님의 (principal's office: 교장실)",
  "principal": "교장 선생님",
  "my": "나의",
  "classroom": "교실",
  "new": "새로운, 새로 온",
  "at": "~에서",
  "this": "이, 이번",
  "school": "학교",
  "have": "가지고 있다",
  "many": "많은",
  "friends": "친구들",
  "kind": "친절한",
  "like": "좋아하다",
  "p.e": "체육 (physical education)",
  "class": "수업, 반",
  "english": "영어",
  "last": "마지막의",
  "year": "해, 년",
  "here": "여기에서",
  "let's": "~하자 (let us)",
  "go": "가다",
  "together": "함께",
  "thank": "고마워하다 (thank you: 고마워)",
  "thanks": "고마워",
};
