// Vercel Edge Function for Translation API
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
    const { text, targetLang = 'ja' } = request.body;
    
    if (!text) {
      return response.status(400).json({ error: 'Text parameter is required' });
    }

    // テキストが短すぎる場合や翻訳不要な場合はそのまま返す
    if (text.length < 3) {
      return response.status(200).json({ translatedText: text });
    }

    // Microsoft Translator API を使用（無料枠あり）
    const translatorEndpoint = 'https://api.cognitive.microsofttranslator.com/translate';
    const translatorKey = process.env.TRANSLATOR_API_KEY;

    if (translatorKey) {
      try {
        const translatorResponse = await fetch(
          `${translatorEndpoint}?api-version=3.0&to=${targetLang}`,
          {
            method: 'POST',
            headers: {
              'Ocp-Apim-Subscription-Key': translatorKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify([{ text: text }])
          }
        );

        if (translatorResponse.ok) {
          const translatorData = await translatorResponse.json();
          if (translatorData[0] && translatorData[0].translations[0]) {
            return response.status(200).json({
              translatedText: translatorData[0].translations[0].text
            });
          }
        }
      } catch (translatorError) {
        console.warn('Microsoft Translator failed:', translatorError);
      }
    }

    // フォールバック: Google Translate API
    const googleApiKey = process.env.GOOGLE_TRANSLATE_API_KEY;
    
    if (googleApiKey) {
      try {
        const googleResponse = await fetch(
          `https://translation.googleapis.com/language/translate/v2?key=${googleApiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              q: text,
              target: targetLang,
              source: 'en'
            })
          }
        );

        if (googleResponse.ok) {
          const googleData = await googleResponse.json();
          if (googleData.data && googleData.data.translations[0]) {
            return response.status(200).json({
              translatedText: googleData.data.translations[0].translatedText
            });
          }
        }
      } catch (googleError) {
        console.warn('Google Translate failed:', googleError);
      }
    }

    // 最終フォールバック: シンプルな辞書ベース翻訳
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

    return response.status(200).json({
      translatedText: translatedText,
      fallback: true
    });

  } catch (error) {
    console.error('Translation API error:', error);
    return response.status(500).json({ 
      error: 'Translation failed',
      translatedText: request.body.text || 'Translation unavailable'
    });
  }
}