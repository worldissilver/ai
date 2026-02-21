import { TranslationResult } from '../types';

// 智谱 AI API 配置
// 注意：在生产环境中，API Key 应该从后端获取，而不是直接存储在前端代码中
// 这里从环境变量或常量文件读取
const ZHIPU_API_KEY =
  typeof process !== 'undefined' && process.env?.ZHIPU_API_KEY
    ? process.env.ZHIPU_API_KEY
    : 'b771cfdb9de1474bacca603d3c1b60b2.dw0YRK6O87cyh7p2';

const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

/**
 * 调用智谱 AI API 评估用户翻译
 * @param userTranslation 用户的翻译
 * @param originalEnglish 原始英文台词
 * @param originalChinese 原始中文台词
 * @returns 评分和反馈
 */
export const evaluateTranslation = async (
  userTranslation: string,
  originalEnglish: string,
  originalChinese: string
): Promise<TranslationResult> => {
  try {
    const response = await fetch(ZHIPU_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${ZHIPU_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'glm-4-flash',
        messages: [
          {
            role: 'system',
            content:
              '你是一个英语学习助手。评估用户的英语翻译是否准确，给出1-5的评分和详细的语法建议。返回JSON格式。',
          },
          {
            role: 'user',
            content: `请评估以下翻译：
原始中文：${originalChinese}
原始英文：${originalEnglish}
用户翻译：${userTranslation}

请以JSON格式返回，包含：
- score: 1-5的评分（5为完美）
- rating: 简短的评价（如"优秀"、"良好"、"一般"、"需要改进"等）
- originalText: 原始英文台词
- feedback: 针对错误的具体反馈
- grammarTips: 语法知识点数组（如果有错误）`,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    });

    const data = await response.json();

    if (data.choices && data.choices[0]) {
      const content = data.choices[0].message.content;
      // 尝试解析返回的 JSON
      try {
        const result = JSON.parse(content);
        return {
          score: result.score || 3,
          rating: result.rating || '一般',
          originalText: result.originalText || originalEnglish,
          feedback: result.feedback,
          grammarTips: result.grammarTips || [],
        };
      } catch (parseError) {
        // 如果解析失败，返回默认结果
        console.error('Failed to parse API response:', parseError);
        return {
          score: 3,
          rating: '一般',
          originalText: originalEnglish,
          feedback: content,
        };
      }
    }

    // 如果 API 返回错误信息
    if (data.error) {
      console.error('Zhipu API Error:', data.error);
      // 降级到本地评估
      return mockEvaluateTranslation(
        userTranslation,
        originalEnglish,
        originalChinese
      );
    }

    throw new Error('Invalid API response');
  } catch (error) {
    console.error('Failed to call Zhipu API:', error);
    // 降级到本地评估
    return mockEvaluateTranslation(
      userTranslation,
      originalEnglish,
      originalChinese
    );
  }
};

/**
 * 本地模拟评估（当 API 不可用时使用）
 */
const mockEvaluateTranslation = (
  userTranslation: string,
  originalEnglish: string,
  originalChinese: string
): TranslationResult => {
  // 简单的字符串相似度计算
  const similarity = calculateSimilarity(userTranslation, originalEnglish);

  let score = Math.round(similarity * 5);
  score = Math.max(1, Math.min(5, score)); // 限制在1-5之间

  let rating = '';
  if (score === 5) rating = '完美！';
  else if (score >= 4) rating = '优秀';
  else if (score >= 3) rating = '良好';
  else if (score >= 2) rating = '一般';
  else rating = '需要改进';

  let feedback = '';
  let grammarTips: string[] = [];

  if (score < 3) {
    feedback = '翻译与原文有较大差异，请尝试更准确地表达。';
    grammarTips = ['注意时态的一致性', '检查主谓搭配'];
  } else if (score < 5) {
    feedback = '基本正确，但还有一些细微差异。';
  } else {
    feedback = '翻译非常准确，继续保持！';
  }

  return {
    score,
    rating,
    originalText: originalEnglish,
    feedback,
    grammarTips,
  };
};

/**
 * 计算两个字符串的相似度（简单的 Levenshtein 距离变种）
 */
const calculateSimilarity = (str1: string, str2: string): number => {
  const s1 = str1.toLowerCase().replace(/[^\w\s]/g, '').trim();
  const s2 = str2.toLowerCase().replace(/[^\w\s]/g, '').trim();

  if (s1 === s2) return 1;

  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);

  const set1 = new Set(words1);
  const set2 = new Set(words2);

  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return intersection.size / union.size;
};
