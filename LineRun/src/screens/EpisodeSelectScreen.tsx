import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Show, Episode } from '../types';
import { MOCK_SHOWS, MOCK_EPISODES } from '../data/shows';

type EpisodeSelectScreenRouteProp = RouteProp<
  RootStackParamList,
  'EpisodeSelect'
>;
type EpisodeSelectScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'EpisodeSelect'
>;

interface Props {
  route: EpisodeSelectScreenRouteProp;
  navigation: EpisodeSelectScreenNavigationProp;
}

const EpisodeSelectScreen: React.FC<Props> = ({ route, navigation }) => {
  const { showId, isResume } = route.params;
  const show = MOCK_SHOWS.find((s) => s.id === showId);

  const handleEpisodePress = (episode: Episode) => {
    navigation.navigate('Practice', {
      episodeId: episode.id,
      showTitle: show?.title || '',
      episodeTitle: episode.title,
    });
  };

  const renderSeason = (season: number) => (
    <View key={season} style={styles.seasonContainer}>
      <Text style={styles.seasonTitle}>第 {season} 季</Text>
      <View style={styles.episodeList}>
        {MOCK_EPISODES
          .filter((ep) => ep.season === season)
          .map((episode) => (
            <TouchableOpacity
              key={episode.id}
              style={styles.episodeItem}
              onPress={() => handleEpisodePress(episode)}
            >
              <View style={styles.episodeInfo}>
                <Text style={styles.episodeNumber}>
                  第 {episode.episode} 集
                </Text>
                <Text style={styles.episodeTitle}>{episode.title}</Text>
                <Text style={styles.episodeTitleEn}>
                  {episode.titleEn}
                </Text>
              </View>
              <View style={styles.arrow}>
                <Text style={styles.arrowText}>{'>'}</Text>
              </View>
            </TouchableOpacity>
          ))}
      </View>
    </View>
  );

  if (!show) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>未找到剧集信息</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.showTitle}>{show.title}</Text>
        <Text style={styles.showTitleEn}>{show.titleEn}</Text>
        {show.description && (
          <Text style={styles.showDescription}>{show.description}</Text>
        )}
      </View>

      <ScrollView style={styles.content}>
        <FlatList
          data={show.seasons}
          keyExtractor={(item) => item.toString()}
          renderItem={({ item }) => renderSeason(item)}
          scrollEnabled={false}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#6366f1',
    padding: 20,
    paddingTop: 10,
  },
  showTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  showTitleEn: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
  },
  showDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
    lineHeight: 20,
  },
  content: {
    flex: 1,
  },
  seasonContainer: {
    marginBottom: 24,
  },
  seasonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  episodeList: {
    paddingHorizontal: 16,
  },
  episodeItem: {
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
  episodeInfo: {
    flex: 1,
  },
  episodeNumber: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
  },
  episodeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 4,
  },
  episodeTitleEn: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  arrow: {
    marginLeft: 12,
  },
  arrowText: {
    fontSize: 20,
    color: '#999',
    fontWeight: '300',
  },
  errorText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 40,
  },
});

export default EpisodeSelectScreen;
