// 剧集类型
export interface Show {
  id: string;
  title: string;
  titleEn: string;
  poster?: string;
  description?: string;
  seasons: number[];
}

// 集数类型
export interface Episode {
  id: string;
  showId: string;
  season: number;
  episode: number;
  title: string;
  titleEn: string;
  dialogues: Dialogue[];
}

// 台词类型
export interface Dialogue {
  id: string;
  order: number;
  chinese: string;
  english: string;
  character?: string;
}

// 用户练习记录类型
export interface PracticeRecord {
  id: string;
  showId: string;
  showTitle: string;
  episodeId: string;
  episodeTitle: string;
  dialogueId: string;
  userTranslation: string;
  score: number;
  feedback?: string;
  timestamp: number;
}

// 用户进度类型
export interface UserProgress {
  showId: string;
  episodeId: string;
  dialogueIndex: number;
  lastPracticeTime: number;
}

// 用户统计数据类型
export interface UserStats {
  totalSentences: number;
  averageScore: number;
  weeklySentences: number;
  weeklyAverageScore: number;
  monthlySentences: number;
  monthlyAverageScore: number;
}

// 翻译结果类型
export interface TranslationResult {
  score: number;
  rating: string;
  originalText: string;
  feedback?: string;
  grammarTips?: string[];
}
