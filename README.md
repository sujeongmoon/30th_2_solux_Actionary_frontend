# req2res FrontEnd
모든 갓생 습관을 한곳에 담은 올인원 생산성 플랫폼인 **req2res**의 프론트엔드 서버입니다.

# 📌프로젝트 특징
- 화상 스터디: 실시간으로 여러명이서 온라인 줌 스터디 가능
- 게시글: 여러가지 카테고리로 분리된 게시글을 작성하여 스터디 관련 정보들을 나눔
- 북마크: 본인이 자주 이용하는 사이트를 북마크 해 바로 링크 진입 가능
- 투두리스트: 오늘 해야할 일들을 계획하고 체크할 수 있음
- 사이드바 기능: 웹만의 특징을 살려 사이드바로 누적 포인트, 오늘 공부 시간, 오늘 투두리스트 확인 가능
- AI Summary 기능: 파일(PDF)을 전송하면 AI가 핵심 내용을 요약
--- 

# 📥 프로젝트 링크
https://www.actionary.site/
---

# ⚡Tech Stack
- **React**: 사용자 인터페이스(UI)를 구성하는 프론트엔드 라이브러리
- **CSS**: 스타일링 가능
- **React Query**: 서버 상태를 관리하고 API 데이터를 효율적으로 가져오기 위한 라이브러리
- **Tiptap**: 풍부한 텍스트 에디터 구현을 위한 리치 텍스트 편집기

# 📁프론트엔드 폴더구조

src/
├── assets/           # 이미지, 아이콘, 폰트, PDF 등 정적 자원
├── components/       # 재사용 가능한 UI 컴포넌트
│   ├── Button/
│   │   ├── Button.tsx
│   │   └── Button.css
│   └── ...
├── pages/            # 라우트별 페이지 컴포넌트
│   ├── Home/
│   │   └── Home.tsx
│   ├── Study/
│   │   └── Study.tsx
│   └── ...
├── layouts/          # 페이지 레이아웃, 공통 헤더/사이드바
├── hooks/            # 커스텀 훅
├── context/          # React Context / 전역 상태 관리
├── services/         # API 요청 / axios instance
├── utils/            # 공용 함수, helper
├── types/            # 타입 정의 (TypeScript)
├── store/            # Redux / Zustand 등 상태관리
├── routes/           # 라우터 정의
├── styles/           # 전역 스타일, 테마
└── App.tsx           # 최상위 컴포넌트
└── main.tsx          # 엔트리 포인트
---

# 📌commit 형식
[Feat]: 새로운 기능 추가 <br>
[Fix]: 버그 수정 <br>
[Docs]: 문서 수정 <br>
[Style]: 코드 포맷팅, 세미콜론 누락, 코드 변경이 없는 경우 <br>
[Refactor]: 코드 리펙토링 <br>
[Test]: 테스트 코드, 리펙토링 테스트 코드 추가 <br>
[Chore]: 빌드 업무 수정, 패키지 매니저 수정 <br><br>
