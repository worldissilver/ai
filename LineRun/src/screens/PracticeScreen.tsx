import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Dialogue, TranslationResult } from '../types';
import { MOCK_EPISODES } from '../data/shows';
import { evaluateTranslation } from '../services/zhipu';
import { savePracticeRecord, saveUserProgress } from '../services/storage';
import * as Speech from 'expo-speech';

type PracticeScreenRouteProp = RouteProp<RootStackParamList, 'Practice'>;
type PracticeScreenNavigationProp = StackNavigationProp<
  RootStackParamList,
  'Practice'
>;

interface Props {
  route: PracticeScreenRouteProp;
  navigation: PracticeScreenNavigationProp;
}

const PracticeScreen: React.FC<Props> = ({ route, navigation }) => {
  const { episodeId, startIndex, showTitle, episodeTitle } = route.params;

  const [currentIndex, setCurrentIndex] = useState(startIndex || 0);
  const [dialogues, setDialogues] = useState<Dialogue[]>([]);
  const [userTranslation, setUserTranslation] = useState('');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // 加载剧集台词数据
    const episode = MOCK_EPISODES.find((ep) => ep.id === episodeId);
    if (episode) {
      setDialogues(episode.dialogues);
    }
  }, [episodeId]);

  const currentDialogue = dialogues[currentIndex];
  const isLastDialogue = currentIndex >= dialogues.length - 1;

  const handleSpeak = (text: string) => {
    setIsSpeaking(true);
    Speech.speak(text, {
      language: 'en-US',
      onDone: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });
  };

  const handleEvaluate = async () => {
    if (!userTranslation.trim()) {
      Alert.alert('提示', '请先输入你的翻译');
      return;
    }

    setIsEvaluating(true);
    try {
      const evaluation = await evaluateTranslation(
        userTranslation,
        currentDialogue.english,
        currentDialogue.chinese
      );
      setResult(evaluation);

      // 保存练习记录
      await savePracticeRecord({
        id: `${Date.now()}-${currentIndex}`,
        showId: episodeId.split('-')[0],
        showTitle,
        episodeId,
        episodeTitle,
        dialogueId: currentDialogue.id,
        userTranslation,
        score: evaluation.score,
        feedback: evaluation.feedback,
        timestamp: Date.now(),
      });

      // 更新用户进度
      await saveUserProgress({
        showId: episodeId.split('-')[0],
        episodeId,
        dialogueIndex: currentIndex,
        lastPracticeTime: Date.now(),
      });
    } catch (error) {
      console.error('Failed to evaluate translation:', error);
      Alert.alert('错误', '评估失败，请重试');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleRetry = () => {
    setUserTranslation('');
    setResult(null);
  };

  const handleNext = () => {
    if (isLastDialogue) {
      Alert.alert('恭喜', '本集练习完成！', [
        {
          text: '确定',
          onPress: () => navigation.goBack(),
        },
      ]);
    } else {
      setUserTranslation('');
      setResult(null);
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 5) return '#10b981';
    if (score >= 4) return '#3b82f6';
    if (score >= 3) return '#f59e0b';
    return '#ef4444';
  };

  if (!currentDialogue) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 进度指示 */}
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            台词 {currentIndex + 1} / {dialogues.length}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentIndex + 1) / dialogues.length) * 100}%` },
              ]}
            />
          </View>
        </View>

        {/* 中文章词 */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>请将以下中文翻译成英文：</Text>
          <Text style={styles.chineseText}>{currentDialogue.chinese}</Text>
          {currentDialogue.character && (
            <Text style={styles.character}>{currentDialogue.character}</Text>
          )}
        </View>

        {/* 用户输入 */}
        {!result && (
          <View style={styles.card}>
            <TextInput
              style={styles.input}
              placeholder="输入你的英文翻译..."
              value={userTranslation}
              onChangeText={setUserTranslation}
              multiline
              autoFocus
            />
            <TouchableOpacity
              style={styles.button}
              onPress={() => handleSpeak(currentDialogue.english)}
              disabled={isSpeaking}
            >
              <Text style={styles.buttonText}>
                {isSpeaking ? '朗读中...' : '听原文'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.primaryButton]}
              onPress={handleEvaluate}
              disabled={isEvaluating || !userTranslation.trim()}
            >
              {isEvaluating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>提交翻译</Text>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* 评估结果 */}
        {result && (
          <View style={styles.card}>
            <View style={styles.scoreContainer}>
              <Text style={styles.scoreLabel}>评分</Text>
              <View style={styles.scoreValueContainer}>
                <Text
                  style={[
                    styles.scoreValue,
                    { color: getScoreColor(result.score) },
                  ]}
                >
                  {result.score}
                </Text>
                <Text style={styles.scoreMax}> / 5</Text>
              </View>
              <Text
                style={[
                  styles.ratingText,
                  { color: getScoreColor(result.score) },
                ]}
              >
                {result.rating}
              </Text>
            </View>

            <View style={styles.resultSection}>
              <Text style={styles.resultLabel}>原文：</Text>
              <Text style={styles.resultText}>{result.originalText}</Text>
              <TouchableOpacity
                style={styles.speakSmallButton}
                onPress={() => handleSpeak(result.originalText)}
              >
                <Text style={styles.speakSmallButtonText}>🔊</Text>
              </TouchableOpacity>
            </View>

            {result.feedback && (
              <View style={styles.resultSection}>
                <Text style={styles.resultLabel}>评价：</Text>
                <Text style={styles.resultText}>{result.feedback}</Text>
              </View>
            )}

            {result.grammarTips && result.grammarTips.length > 0 && (
              <View style={styles.resultSection}>
                <Text style={styles.resultLabel}>语法知识点：</Text>
                {result.grammarTips.map((tip, index) => (
                  <View key={index} style={styles.tipItem}>
                    <Text style={styles.tipBullet}>•</Text>
                    <Text style={styles.resultText}>{tip}</Text>
                  </View>
                ))}
              </View>
            )}

            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleRetry}
              >
                <Text style={styles.buttonText}>重新练习</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.primaryButton]}
                onPress={handleNext}
              >
                <Text style={styles.buttonText}>
                  {isLastDialogue ? '完成练习' : '下一句'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e5e5e5',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  chineseText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    lineHeight: 28,
  },
  character: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
    fontStyle: 'italic',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e5e5e5',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    marginBottom: 12,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#e5e5e5',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  primaryButton: {
    backgroundColor: '#6366f1',
  },
  secondaryButton: {
    flex: 1,
    marginRight: 8,
    backgroundColor: '#e5e5e5',
  },
  buttonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
  scoreContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  scoreValueContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  scoreMax: {
    fontSize: 20,
    color: '#999',
  },
  ratingText: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 4,
  },
  resultSection: {
    marginBottom: 12,
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  resultText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  speakSmallButton: {
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  speakSmallButtonText: {
    fontSize: 16,
  },
  tipItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  tipBullet: {
    color: '#6366f1',
    marginRight: 8,
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
});

export default PracticeScreen;
