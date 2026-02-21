import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { PracticeRecord } from '../types';
import { getPracticeRecords } from '../services/storage';

type HistoryScreenNavigationProp = StackNavigationProp<RootStackParamList, 'History'>;

interface Props {
  navigation: HistoryScreenNavigationProp;
}

const HistoryScreen: React.FC<Props> = ({ navigation }) => {
  const [records, setRecords] = useState<PracticeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    setIsLoading(true);
    try {
      const data = await getPracticeRecords();
      // 按时间倒序排列
      const sorted = [...data].sort((a, b) => b.timestamp - a.timestamp);
      setRecords(sorted);
    } catch (error) {
      console.error('Failed to load records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return '今天';
    if (days === 1) return '昨天';
    if (days < 7) return `${days}天前`;

    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 5) return '#10b981';
    if (score >= 4) return '#3b82f6';
    if (score >= 3) return '#f59e0b';
    return '#ef4444';
  };

  const renderRecordItem = ({ item }: { item: PracticeRecord }) => (
    <View style={styles.recordItem}>
      <View style={styles.recordHeader}>
        <View style={styles.recordTitle}>
          <Text style={styles.showTitle}>{item.showTitle}</Text>
          <Text style={styles.episodeTitle}>{item.episodeTitle}</Text>
        </View>
        <View style={styles.scoreBadge}>
          <Text style={[styles.scoreText, { color: getScoreColor(item.score) }]}>
            {item.score}
          </Text>
          <Text style={styles.scoreMax}>/5</Text>
        </View>
      </View>

      <View style={styles.recordBody}>
        <View style={styles.translationSection}>
          <Text style={styles.translationLabel}>你的翻译：</Text>
          <Text style={styles.translationText}>{item.userTranslation}</Text>
        </View>

        {item.feedback && (
          <View style={styles.feedbackSection}>
            <Text style={styles.feedbackLabel}>评价：</Text>
            <Text style={styles.feedbackText}>{item.feedback}</Text>
          </View>
        )}

        <View style={styles.recordFooter}>
          <Text style={styles.dateText}>{formatDate(item.timestamp)}</Text>
          <Text style={styles.timeText}>{formatTime(item.timestamp)}</Text>
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
    <View style={styles.container}>
      {records.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>暂无练习记录</Text>
          <Text style={styles.emptySubtext}>开始你的第一次练习吧！</Text>
        </View>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id}
          renderItem={renderRecordItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  listContent: {
    padding: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#bbb',
  },
  recordItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  recordTitle: {
    flex: 1,
  },
  showTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  episodeTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  scoreBadge: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  scoreText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scoreMax: {
    fontSize: 12,
    color: '#999',
    marginLeft: 2,
  },
  recordBody: {
    padding: 16,
  },
  translationSection: {
    marginBottom: 12,
  },
  translationLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  translationText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  feedbackSection: {
    marginBottom: 12,
  },
  feedbackLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  feedbackText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  recordFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
  },
  timeText: {
    fontSize: 12,
    color: '#bbb',
  },
});

export default HistoryScreen;
