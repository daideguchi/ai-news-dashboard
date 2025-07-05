// Vercel Edge Function for Gemini API Translation & Summarization
export default async function handler(request, response) {
  // CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, title, targetLang = 'ja', action = 'translate' } = request.body;
    
    if (!text) {
      return response.status(400).json({ error: 'Text parameter is required' });
    }

    // テキストが短すぎる場合や翻訳不要な場合はそのまま返す
    if (text.length < 3) {
      return response.status(200).json({ 
        translatedText: text, 
        summary: text,
        method: 'skip' 
      });
    }

    let prompt = '';
    let result = {};

    if (action === 'translate') {
      prompt = `以下の英語のニュース記事を日本語に翻訳してください。自然で読みやすい日本語にしてください。

タイトル: ${title || 'なし'}
内容: ${text}

翻訳のみを出力してください。`;

      try {
        // Gemini API を直接使用
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (apiKey) {
          const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [{
                  parts: [{ text: prompt }]
                }]
              })
            }
          );

          if (geminiResponse.ok) {
            const geminiData = await geminiResponse.json();
            const generatedText = geminiData.candidates[0]?.content?.parts[0]?.text || text;
            
            result = {
              translatedText: generatedText.trim(),
              method: 'gemini-api'
            };
          } else {
            throw new Error(`Gemini API error: ${geminiResponse.status}`);
          }
        } else {
          throw new Error('No Gemini API key configured');
        }
      } catch (geminiError) {
        console.warn('Gemini API failed:', geminiError.message);
        
        // フォールバック: シンプルな辞書ベース翻訳
        result = {
          translatedText: await fallbackTranslate(text),
          method: 'fallback'
        };
      }
    } else if (action === 'summarize') {
      const isLongContent = text.length > 500;
      
      prompt = `以下の英語のニュース記事${isLongContent ? '（全文）' : ''}の要約を作成してください。

タイトル: ${title || 'なし'}
内容: ${text}

${isLongContent ? 
        `記事の重要なポイントを3-5点に整理し、具体的な内容を含めて要約してください。` :
        `要点を3つのポイントに整理して簡潔にまとめてください。`
      }

要約のみを日本語で出力してください。`;

      try {
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (apiKey) {
          const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [{
                  parts: [{ text: prompt }]
                }]
              })
            }
          );

          if (geminiResponse.ok) {
            const geminiData = await geminiResponse.json();
            const generatedText = geminiData.candidates[0]?.content?.parts[0]?.text || text;
            
            result = {
              summary: generatedText.trim(),
              method: 'gemini-api'
            };
          } else {
            throw new Error(`Gemini API error: ${geminiResponse.status}`);
          }
        } else {
          throw new Error('No Gemini API key configured');
        }
      } catch (geminiError) {
        console.warn('Gemini API failed:', geminiError.message);
        
        // フォールバック: 簡単な要約
        result = {
          summary: text.substring(0, 100) + '...',
          method: 'fallback'
        };
      }
    } else if (action === 'translate-and-summarize') {
      const isLongContent = text.length > 500;
      
      prompt = `以下の英語のニュース記事${isLongContent ? '（全文）' : ''}を日本語に翻訳し、さらに要約してください。

タイトル: ${title || 'なし'}
内容: ${text}

${isLongContent ? 
  `1. 翻訳: 記事全体を自然で読みやすい日本語に翻訳（重要な情報を漏らさず）
2. 要約: 記事の重要なポイントを3-5点に整理し、具体的な内容を含めて要約` :
  `1. 翻訳: 自然で読みやすい日本語に翻訳
2. 要約: 要点を3つのポイントに整理して簡潔にまとめる`
}

以下の形式で出力してください：
翻訳: [翻訳された内容]
要約: [要約された内容]`;

      try {
        const apiKey = process.env.GEMINI_API_KEY;
        
        if (apiKey) {
          const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                contents: [{
                  parts: [{ text: prompt }]
                }]
              })
            }
          );

          if (geminiResponse.ok) {
            const geminiData = await geminiResponse.json();
            const output = geminiData.candidates[0]?.content?.parts[0]?.text || '';
            
            const translationMatch = output.match(/翻訳:\s*(.+?)(?=要約:|$)/s);
            const summaryMatch = output.match(/要約:\s*(.+)$/s);

            result = {
              translatedText: translationMatch ? translationMatch[1].trim() : text,
              summary: summaryMatch ? summaryMatch[1].trim() : text.substring(0, 100) + '...',
              method: 'gemini-api'
            };
          } else {
            throw new Error(`Gemini API error: ${geminiResponse.status}`);
          }
        } else {
          throw new Error('No Gemini API key configured');
        }
      } catch (geminiError) {
        console.warn('Gemini API failed:', geminiError.message);
        
        // フォールバック
        result = {
          translatedText: await fallbackTranslate(text),
          summary: text.substring(0, 100) + '...',
          method: 'fallback'
        };
      }
    }

    return response.status(200).json(result);

  } catch (error) {
    console.error('Translation API error:', error);
    return response.status(500).json({ 
      error: 'Translation failed',
      translatedText: request.body.text || 'Translation unavailable',
      summary: request.body.text ? request.body.text.substring(0, 100) + '...' : 'Summary unavailable'
    });
  }
}

// フォールバック翻訳関数
async function fallbackTranslate(text) {
  const simpleTranslations = {
    'artificial intelligence': '人工知能',
    'machine learning': '機械学習',
    'deep learning': 'ディープラーニング',
    'neural network': 'ニューラルネットワーク',
    'algorithm': 'アルゴリズム',
    'startup': 'スタートアップ',
    'funding': '資金調達',
    'investment': '投資',
    'venture capital': 'ベンチャーキャピタル',
    'billion': '億',
    'million': '百万',
    'technology': '技術',
    'innovation': 'イノベーション',
    'breakthrough': 'ブレークスルー',
    'research': '研究',
    'development': '開発',
    'model': 'モデル',
    'data': 'データ',
    'analysis': '分析',
    'platform': 'プラットフォーム',
    'software': 'ソフトウェア',
    'hardware': 'ハードウェア',
    'cloud': 'クラウド',
    'computing': 'コンピューティング',
    'automation': '自動化',
    'robotics': 'ロボティクス',
    'chatbot': 'チャットボット',
    'virtual': 'バーチャル',
    'augmented': '拡張現実',
    'reality': '現実',
    'generative': '生成',
    'creative': 'クリエイティブ',
    'image': '画像',
    'video': '動画',
    'text': 'テキスト',
    'language': '言語',
    'natural': '自然',
    'processing': '処理',
    'understanding': '理解',
    'recognition': '認識',
    'speech': '音声',
    'voice': '音声',
    'assistant': 'アシスタント',
    'intelligent': '知能',
    'smart': 'スマート',
    'autonomous': '自律',
    'automated': '自動',
    'optimization': '最適化',
    'performance': 'パフォーマンス',
    'efficiency': '効率',
    'scalability': 'スケーラビリティ',
    'security': 'セキュリティ',
    'privacy': 'プライバシー',
    'ethical': '倫理的',
    'bias': 'バイアス',
    'fairness': '公平性',
    'transparency': '透明性',
    'explainable': '説明可能',
    'interpretable': '解釈可能'
  };

  let translatedText = text;
  Object.entries(simpleTranslations).forEach(([en, ja]) => {
    const regex = new RegExp(`\\b${en}\\b`, 'gi');
    translatedText = translatedText.replace(regex, ja);
  });

  return translatedText;
}