# Feed Me — 요구사항 정의서

## 핵심 아이디어

URL 하나 넣으면 콘텐츠를 뽑아서 미리보기로 보여주고, 원하는 AI 챗봇으로 바로 보낼 수 있는 미니멀 도구

## 사용자 흐름

1. **URL 입력** — YouTube 또는 아티클 URL을 직접 입력
2. **콘텐츠 추출** — defuddle로 transcript/본문 추출
3. **미리보기** — 추출된 콘텐츠를 확인 (편집 불가, 읽기 전용)
4. **AI로 보내기** — Open In Chat 컴포넌트로 ChatGPT/Claude 등에 원문 전달

## 설계 원칙

- **미니멀** — 불필요한 단계 없이 URL → 미리보기 → AI 전달
- **프롬프트 없음** — 추출된 원문만 전달, 대화는 AI 챗봇에서
- **편집 없음** — 추출 결과를 그대로 사용

## 기술 스택

| 역할 | 도구 |
|---|---|
| 콘텐츠 추출 | [defuddle](https://github.com/kepano/defuddle) |
| AI 챗봇 연결 | [Open In Chat](https://elements.ai-sdk.dev/components/open-in-chat) |
| 프레임워크 | Next.js (현재 프로젝트) |
