import { Show, Episode, Dialogue } from '../types';

// 模拟剧集数据
export const MOCK_SHOWS: Show[] = [
  {
    id: 'friends',
    title: '老友记',
    titleEn: 'Friends',
    description: '美国最受欢迎的情景喜剧之一',
    seasons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  },
  {
    id: 'breaking-bad',
    title: '绝命毒师',
    titleEn: 'Breaking Bad',
    description: '讲述一位高中化学老师转变成毒品大亨的故事',
    seasons: [1, 2, 3, 4, 5],
  },
  {
    id: 'the-big-bang-theory',
    title: '生活大爆炸',
    titleEn: 'The Big Bang Theory',
    description: '关于一群天才科学家的情景喜剧',
    seasons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  },
  {
    id: 'modern-family',
    title: '摩登家庭',
    titleEn: 'Modern Family',
    description: '一部关于三个家庭的美国电视剧',
    seasons: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  },
  {
    id: 'the-office',
    title: '办公室',
    titleEn: 'The Office',
    description: '美国版办公室情景喜剧',
    seasons: [1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
];

// 模拟台词数据
export const MOCK_DIALOGUES: Dialogue[] = [
  {
    id: 'friends-s1e1-d1',
    order: 0,
    chinese: '你是知道的，我很高兴能回来这里。',
    english: "You know, I'm really glad I came back here.",
    character: 'Monica',
  },
  {
    id: 'friends-s1e1-d2',
    order: 1,
    chinese: '我也是。',
    english: 'So am I.',
    character: 'Rachel',
  },
  {
    id: 'friends-s1e1-d3',
    order: 2,
    chinese: '你想喝杯咖啡吗？',
    english: 'Do you want some coffee?',
    character: 'Monica',
  },
  {
    id: 'friends-s1e1-d4',
    order: 3,
    chinese: '好的，谢谢。',
    english: 'Yes, please.',
    character: 'Rachel',
  },
  {
    id: 'friends-s1e1-d5',
    order: 4,
    chinese: '我昨天在商场见到了你的前任。',
    english: "I saw your ex at the mall yesterday.",
    character: 'Monica',
  },
  {
    id: 'friends-s1e1-d6',
    order: 5,
    chinese: '真的吗？她怎么样？',
    english: 'Really? How was she?',
    character: 'Rachel',
  },
];

// 模拟集数数据
export const MOCK_EPISODES: Episode[] = [
  {
    id: 'friends-s1e1',
    showId: 'friends',
    season: 1,
    episode: 1,
    title: '试播集',
    titleEn: 'The Pilot',
    dialogues: MOCK_DIALOGUES,
  },
];

// 推荐剧集（随机选择前3个）
export const RECOMMENDED_SHOWS = MOCK_SHOWS.slice(0, 3);
