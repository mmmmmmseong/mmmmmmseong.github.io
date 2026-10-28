// 사이트 전체에서 쓰는 기본 정보. 자유롭게 고쳐서 쓰세요.
export const SITE = {
  title: 'mmmmmmseong',
  description: '개인 위키 & 프로젝트 포트폴리오',
  // 홈 화면 맨 위에 나오는 소개 문구
  intro: '배운 것을 기록하고, 만든 것을 정리합니다.',
  links: {
    github: 'https://github.com/mmmmmmseong',
    email: '', // 예: 'me@example.com' (비워두면 표시하지 않음)
  },
};

export const NAV = [
  { href: '/projects', label: '프로젝트' },
  { href: '/wiki', label: '위키' },
  { href: '/tags', label: '태그' },
  { href: '/about', label: '소개' },
];

export const STATUS_LABEL = {
  seed: '🌱 씨앗',
  growing: '🌿 자라는 중',
  evergreen: '🌳 완성',
} as const;
