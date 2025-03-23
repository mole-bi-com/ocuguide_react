# OcuGuide - 백내장 수술 안내 서비스

OcuGuide는 백내장 수술을 앞둔 환자들에게 맞춤형 정보를 제공하는 React 기반 웹 애플리케이션입니다. 환자 정보와 검사 결과를 바탕으로 백내장 수술의 과정, 회복, 주의사항 등에 대한 맞춤형 정보를 제공합니다.

## 기능

- **환자 정보 관리**: 환자 정보 입력 및 관리
- **맞춤형 진단**: 환자의 검사 결과를 기반으로 한 맞춤형 진단 제공
- **단계별 수술 정보**: 백내장 수술에 관한 다양한 정보를 단계별로 제공
- **음성 지원**: 정보의 음성 재생 및 음성 입력 기능
- **챗봇 상담**: 백내장 수술 관련 질문에 답변하는 AI 챗봇
- **사용 통계**: 환자별 정보 확인 기록 및 체류 시간 통계

## 시작하기

### 요구사항

- Node.js 14.0.0 이상
- npm 6.0.0 이상

### 설치

```bash
# 저장소 클론
git clone https://github.com/yourusername/ocuguide-react.git
cd ocuguide-react

# 의존성 설치
npm install

# 개발 서버 실행
npm start
```

### 환경 설정

`.env` 파일을 프로젝트 루트에 생성하고 다음 환경 변수를 설정합니다:

```
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_KEY=your_supabase_key
REACT_APP_OPENAI_API_KEY=your_openai_api_key
```

## 프로젝트 구조

```
ocuguide-react/
├── public/                 # 정적 파일
│   ├── assets/             # 이미지, 오디오 등의 자산
│   └── index.html          # HTML 템플릿
├── src/                    # 소스 코드
│   ├── components/         # 재사용 가능한 컴포넌트
│   ├── context/            # React Context
│   ├── hooks/              # 커스텀 Hook
│   ├── pages/              # 페이지 컴포넌트
│   ├── services/           # API 및 서비스
│   ├── styles/             # 스타일 파일
│   ├── App.js              # 메인 App 컴포넌트
│   └── index.js            # 진입점
└── package.json            # 프로젝트 메타데이터 및 의존성
```

## 주요 페이지

1. **로그인 페이지**: 사용자 인증
2. **홈페이지**: 서비스 소개 및 주요 기능 안내
3. **환자 정보 페이지**: 환자 정보 입력 및 진단 결과 확인
4. **수술 정보 페이지**: 단계별 백내장 수술 정보 제공
5. **챗봇 페이지**: AI 챗봇을 통한 질의응답
6. **통계 페이지**: 사용 통계 및 환자 정보 요약

## 기술 스택

- **프론트엔드**: React, React Router, Context API
- **스타일링**: CSS Modules
- **상태 관리**: React Context API
- **API 통신**: Axios
- **데이터베이스**: Supabase
- **음성 처리**: Web Speech API, MediaRecorder API
- **차트**: Recharts

## 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다. 자세한 내용은 LICENSE 파일을 참조하세요.