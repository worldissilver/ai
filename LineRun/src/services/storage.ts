import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PracticeRecord,
  UserProgress,
  UserStats,
} from '../types';

const KEYS = {
  PRACTICE_RECORDS: '@linerun_practice_records',
  USER_PROGRESS: '@linerun_user_progress',
};

// 保存练习记录
export const savePracticeRecord = async (
  record: PracticeRecord
): Promise<void> => {
  try {
    const records = await getPracticeRecords();
    records.push(record);
    await AsyncStorage.setItem(
      KEYS.PRACTICE_RECORDS,
      JSON.stringify(records)
    );
  } catch (error) {
    console.error('Failed to save practice record:', error);
  }
};

// 获取所有练习记录
export const getPracticeRecords = async (): Promise<PracticeRecord[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.PRACTICE_RECORDS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to get practice records:', error);
    return [];
  }
};

// 保存用户进度
export const saveUserProgress = async (
  progress: UserProgress
): Promise<void> => {
  try {
    const allProgress = await getAllUserProgress();
    // 更新或添加新进度
    const index = allProgress.findIndex(
      (p) => p.showId === progress.showId
    );
    if (index >= 0) {
      allProgress[index] = progress;
    } else {
      allProgress.push(progress);
    }
    await AsyncStorage.setItem(
      KEYS.USER_PROGRESS,
      JSON.stringify(allProgress)
    );
  } catch (error) {
    console.error('Failed to save user progress:', error);
  }
};

// 获取用户所有进度
export const getAllUserProgress = async (): Promise<UserProgress[]> => {
  try {
    const data = await AsyncStorage.getItem(KEYS.USER_PROGRESS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to get user progress:', error);
    return [];
  }
};

// 获取特定剧集的进度
export const getShowProgress = async (
  showId: string
): Promise<UserProgress | null> => {
  try {
    const allProgress = await getAllUserProgress();
    return allProgress.find((p) => p.showId === showId) || null;
  } catch (error) {
    console.error('Failed to get show progress:', error);
    return null;
  }
};

// 计算用户统计数据
export const calculateStats = async (): Promise<UserStats> => {
  try {
    const records = await getPracticeRecords();
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

    // 全部数据
    const totalSentences = records.length;
    const averageScore =
      records.length > 0
        ? records.reduce((sum, r) => sum + r.score, 0) / records.length
        : 0;

    // 最近一周
    const weeklyRecords = records.filter((r) => r.timestamp >= oneWeekAgo);
    const weeklySentences = weeklyRecords.length;
    const weeklyAverageScore =
      weeklyRecords.length > 0
        ? weeklyRecords.reduce((sum, r) => sum + r.score, 0) /
          weeklyRecords.length
        : 0;

    // 最近一月
    const monthlyRecords = records.filter((r) => r.timestamp >= oneMonthAgo);
    const monthlySentences = monthlyRecords.length;
    const monthlyAverageScore =
      monthlyRecords.length > 0
        ? monthlyRecords.reduce((sum, r) => sum + r.score, 0) /
          monthlyRecords.length
        : 0;

    return {
      totalSentences,
      averageScore: Math.round(averageScore * 10) / 10,
      weeklySentences,
      weeklyAverageScore: Math.round(weeklyAverageScore * 10) / 10,
      monthlySentences,
      monthlyAverageScore: Math.round(monthlyAverageScore * 10) / 10,
    };
  } catch (error) {
    console.error('Failed to calculate stats:', error);
    return {
      totalSentences: 0,
      averageScore: 0,
      weeklySentences: 0,
      weeklyAverageScore: 0,
      monthlySentences: 0,
      monthlyAverageScore: 0,
    };
  }
};
