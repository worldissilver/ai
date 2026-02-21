import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { UserStats } from '../types';
import { calculateStats } from '../services/storage';

type StatsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Stats'>;

interface Props {
  navigation: StatsScreenNavigationProp;
}

const StatsScreen: React.FC<Props> = ({ navigation }) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await calculateStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4.5) return '#10b981';
    if (score >= 3.5) return '#3b82f6';
    if (score >= 2.5) return '#f59e0b';
    return '#ef4444';
  };

  const StatCard: React.FC<{
    title: string;
    count: number;
    averageScore: number;
  }> = ({ title, count, averageScore }) => (
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>{title}</Text>
      <View style={styles.statContent}>
        <View style={styles.statValueContainer}>
          <Text style={styles.statValue}>{count}</Text>
          <Text style={styles.statUnit}>句</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statScoreContainer}>
          <Text style={styles.statScoreLabel}>平均分</Text>
          <Text
            style={[styles.statScore, { color: getScoreColor(averageScore) }]}
          >
            {averageScore > 0 ? averageScore : '-'}
          </Text>
        </View>
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* 累计统计 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>累计统计</Text>
        <StatCard
          title="全部练习"
          count={stats?.totalSentences || 0}
          averageScore={stats?.averageScore || 0}
        />
      </View>

      {/* 近期统计 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>近期统计</Text>
        <StatCard
          title="最近一周"
          count={stats?.weeklySentences || 0}
          averageScore={stats?.weeklyAverageScore || 0}
        />
        <StatCard
          title="最近一月"
          count={stats?.monthlySentences || 0}
          averageScore={stats?.monthlyAverageScore || 0}
        />
      </View>

      {/* 学习建议 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>学习建议</Text>
        <View style={styles.tipCard}>
          {stats?.totalSentences === 0 ? (
            <Text style={styles.tipText}>
              开始你的第一次练习吧！每天坚持练习几句，口语会有明显提升。
            </Text>
          ) : stats?.averageScore >= 4 ? (
            <Text style={styles.tipText}>
              很棒！你的翻译准确率很高。可以尝试更复杂的句子，挑战更高的难度。
            </Text>
          ) : stats?.averageScore >= 3 ? (
            <Text style={styles.tipText}>
              表现不错！继续练习，注意语法细节和时态的一致性。
            </Text>
          ) : (
            <Text style={styles.tipText}>
              加油！多练习基本句型，注意主谓一致和时态使用，相信你会越来越棒！
            </Text>
          )}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statValueContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#6366f1',
  },
  statUnit: {
    fontSize: 16,
    color: '#999',
    marginLeft: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e5e5',
    marginHorizontal: 16,
  },
  statScoreContainer: {
    flex: 1,
    alignItems: 'center',
  },
  statScoreLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  statScore: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  tipCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
});

export default StatsScreen;
