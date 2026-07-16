export type ResultType = 'SP_P' | 'SP_N' | 'SU_P' | 'SU_N' | 'FA_P' | 'FA_N' | 'WI_P' | 'WI_N';

export interface ResultInfo {
  id: ResultType;
  title: string;
  keywords: string[];
  color: string;
}

export const RESULTS: Record<ResultType, ResultInfo> = {
  SP_P: {
    id: 'SP_P',
    title: '다정한 봄',
    keywords: ['따스한', '설렘', '시작'],
    color: '#f8c5be'
  },
  SP_N: {
    id: 'SP_N',
    title: '여린 봄',
    keywords: ['유약한', '어리숙한', '방황'],
    color: '#facfa3'
  },
  SU_P: {
    id: 'SU_P',
    title: '맑은 여름',
    keywords: ['싱그러운', '열정', '청춘'],
    color: '#78bbe8'
  },
  SU_N: {
    id: 'SU_N',
    title: '젖은 여름',
    keywords: ['어지러운', '열기', '침전'],
    color: '#436487'
  },
  FA_P: {
    id: 'FA_P',
    title: '무르익은 가을',
    keywords: ['포근한', '낭만', '성숙'],
    color: '#a15814'
  },
  FA_N: {
    id: 'FA_N',
    title: '메마른 가을',
    keywords: ['쓸쓸한', '건조한', '잔해'],
    color: '#421a10'
  },
  WI_P: {
    id: 'WI_P',
    title: '따뜻한 겨울',
    keywords: ['아늑한', '휴식', '추억'],
    color: '#f6eff2'
  },
  WI_N: {
    id: 'WI_N',
    title: '차가운 겨울',
    keywords: ['시린', '고요한', '끝맺음'],
    color: '#090606'
  }
};

export type QuestionCategory = 'class1' | 'class2' | 'yinyang';

export interface Answer {
  text: string;
  value: string; // The specific sub-category to increment
}

export interface Question {
  id: number;
  text: string;
  category: QuestionCategory;
  answers: [Answer, Answer];
}

export const QUESTIONS: Question[] = [
  {
    id: 1,
    text: '일정 없는 주말, 캐릭터/페어은(는) 어떤 하루를 보내고 있나요?',
    category: 'class1',
    answers: [
      { text: '뭘 하든 일단 밖이다.', value: 'sp_su' },
      { text: '집에서 시간을 보내고 있다.', value: 'fa_wi' }
    ]
  },
  {
    id: 2,
    text: '1번 질문에서 상상한 주말 속 시간대는 언제인가요?',
    category: 'yinyang',
    answers: [
      { text: '낮 혹은 오후', value: 'p' },
      { text: '새벽 혹은 밤', value: 'n' }
    ]
  },
  {
    id: 3,
    text: '갑자기 소나기가 내립니다. 비는 어떤 형태인가요?',
    category: 'yinyang',
    answers: [
      { text: '맑고 가벼운 보슬비', value: 'p' },
      { text: '차갑고 무거운 장대비', value: 'n' }
    ]
  },
  {
    id: 4,
    text: '그 빗속에서 캐릭터/페어은(는) 어떤 모습에 가까운가요?',
    category: 'yinyang',
    answers: [
      { text: '생기 있는 모습', value: 'p' },
      { text: '가라 앉은 모습', value: 'n' }
    ]
  },
  {
    id: 5,
    text: '캐릭터/페어 테마의 노래를 만든다면 어떤 장르가 더 끌리나요?',
    category: 'class2',
    answers: [
      { text: '따스한 선율이나 시적인 가사가 도드라지는 어쿠스틱 노래', value: 'sp_fa' },
      { text: '중독성 있는 비트의 유행가 혹은 정적인 백색소음', value: 'su_wi' }
    ]
  },
  {
    id: 6,
    text: '캐릭터/페어을(를) 나무에 비유한다면 어디에 더 가까운가요?',
    category: 'class1',
    answers: [
      { text: '어리고 파릇파릇한 나무', value: 'sp_su' },
      { text: '단단하게 여물은 고목', value: 'fa_wi' }
    ]
  },
  {
    id: 7,
    text: '캐릭터/페어에게 어떤 색이 더 어울리나요?',
    category: 'class2',
    answers: [
      { text: '부드럽고 자연스러운 컬러', value: 'sp_fa' },
      { text: '깔끔하고 비비드한 컬러', value: 'su_wi' }
    ]
  },
  {
    id: 8,
    text: '캐릭터/페어에게 어떤 향이 더 어울리나요?',
    category: 'class1',
    answers: [
      { text: '가볍고 상큼한 시트러스나 싱그러운 풀꽃 향', value: 'sp_su' },
      { text: '묵직하고 따뜻한 우디 향이나 깊고 차분한 머스크 향', value: 'fa_wi' }
    ]
  },
  {
    id: 9,
    text: '캐릭터/페어에게 어떤 여행이 더 어울리나요?',
    category: 'class2',
    answers: [
      { text: '따스한 햇살과 분위기 좋은 거리를 정처 없이 걷는 낭만 가득한 여행', value: 'sp_fa' },
      { text: '일상에서 완전히 벗어나 아무 생각 없이 몸을 눕히고 푹 쉬는 호캉스', value: 'su_wi' }
    ]
  }
];
