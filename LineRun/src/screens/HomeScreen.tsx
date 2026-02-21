import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Show } from '../types';
import { MOCK_SHOWS, RECOMMENDED_SHOWS } from '../data/shows';
import { getShowProgress } from '../services/storage';

type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

const HomeScreen: React.FC<Props> = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [filteredShows, setFilteredShows] = useState<Show[]>([]);
  const [recentProgress, setRecentProgress] = useState<Show | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadRecentProgress();
  }, []);

  useEffect(() => {
    if (searchText.trim()) {
      const filtered = MOCK_SHOWS.filter(
        (show) =>
          show.title.includes(searchText) ||
          show.titleEn.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredShows(filtered);
    } else {
      setFilteredShows([]);
    }
  }, [searchText]);

  const loadRecentProgress = async () => {
    setIsLoading(true);
    try {
      // 模拟获取最近练习的剧集（在实际应用中，从 AsyncStorage 获取）
      // 这里暂时使用第一个推荐剧集作为示例
      setRecentProgress(RECOMMENDED_SHOWS[0]);
    } catch (error) {
      console.error('Failed to load recent progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowPress = async (show: Show, isRecent: boolean = false) => {
    if (isRecent) {
      // 如果是最近练习的剧集，直接跳转到练习页面
      const progress = await getShowProgress(show.id);
      if (progress) {
        navigation.navigate('Practice', {
          episodeId: progress.episodeId,
          startIndex: progress.dialogueIndex,
          showTitle: show.title,
          episodeTitle: '继续练习',
        });
      } else {
        navigation.navigate('EpisodeSelect', { showId: show.id });
      }
    } else {
      // 否则，引导用户选择剧集
      navigation.navigate('EpisodeSelect', { showId: show.id });
    }
  };

  const renderShowItem = (item: Show, isRecent: boolean = false) => (
    <TouchableOpacity
      style={styles.showItem}
      onPress={() => handleShowPress(item, isRecent)}
    >
      <View style={styles.showInfo}>
        <Text style={styles.showTitle}>{item.title}</Text>
        <Text style={styles.showTitleEn}>{item.titleEn}</Text>
        {item.description && (
          <Text style={styles.showDescription}>{item.description}</Text>
        )}
        {isRecent && (
          <View style={styles.recentBadge}>
            <Text style={styles.recentBadgeText}>继续练习</Text>
          </View>
        )}
      </View>
      <View style={styles.arrow}>
        <Text style={styles.arrowText}>{'>'}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* 搜索框 */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="搜索剧集..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
        />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={styles.listContent}
          data={
            searchText.trim()
              ? filteredShows
              : RECOMMENDED_SHOWS
          }
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            searchText.trim() ? null : (
              <>
                {/* 最近练习 */}
                {recentProgress && (
                  <View style={styles.section}>
                    <Text style={styles.sectionTitle}>最近练习</Text>
                    {renderShowItem(recentProgress, true)}
                  </View>
                )}
                {/* 推荐剧集 */}
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>推荐剧集</Text>
                </View>
              </>
            )
          }
          renderItem={({ item }) => (
            <View style={styles.showWrapper}>{renderShowItem(item)}</View>
          )}
          ListEmptyComponent={
            searchText.trim() ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>没有找到匹配的剧集</Text>
              </View>
            ) : null
          }
        />
      )}

      {/* 底部导航 */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Text style={[styles.navText, styles.navTextActive]}>首页</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('History')}
        >
          <Text style={styles.navText}>历史</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Stats')}
        >
          <Text style={styles.navText}>统计</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  searchContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  searchInput: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  showItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  showWrapper: {
    marginBottom: 8,
  },
  showInfo: {
    flex: 1,
  },
  showTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  showTitleEn: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  showDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  recentBadge: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  recentBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  arrow: {
    marginLeft: 12,
  },
  arrowText: {
    fontSize: 20,
    color: '#999',
    fontWeight: '300',
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  bottomNav: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
    paddingBottom: 8,
    paddingTop: 8,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navText: {
    fontSize: 14,
    color: '#999',
  },
  navTextActive: {
    color: '#6366f1',
    fontWeight: '600',
  },
});

export default HomeScreen;
