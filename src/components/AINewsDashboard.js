import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Calendar, ExternalLink, Bot, Zap, Building2, Globe, MapPin, Languages } from 'lucide-react';

const AINewsDashboard = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [language, setLanguage] = useState('en'); // 'en' or 'jp'
  const [translating, setTranslating] = useState(false);
  const [translationCache, setTranslationCache] = useState({});
  const [showSummary, setShowSummary] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [apiError, setApiError] = useState(null);

  const categories = [
    { 
      id: 'all', 
      name: language === 'en' ? 'All' : 'すべて', 
      icon: Globe 
    },
    { 
      id: 'llm', 
      name: 'LLM', 
      icon: Bot 
    },
    { 
      id: 'generative', 
      name: language === 'en' ? 'Generative AI' : '生成AI', 
      icon: Zap 
    },
    { 
      id: 'tech', 
      name: language === 'en' ? 'Technology' : '技術', 
      icon: Bot 
    },
    { 
      id: 'business', 
      name: language === 'en' ? 'Business' : 'ビジネス', 
      icon: Building2 
    },
    { 
      id: 'japan', 
      name: language === 'en' ? 'Japan' : '日本', 
      icon: MapPin 
    }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (language === 'en') {
      if (diffInHours < 1) return 'now';
      if (diffInHours < 24) return `${diffInHours}h ago`;
      if (diffInHours < 48) return 'yesterday';
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    } else {
      if (diffInHours < 1) return '今すぐ';
      if (diffInHours < 24) return `${diffInHours}時間前`;
      if (diffInHours < 48) return '昨日';
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}日前`;
    }
  };

  const fetchArticleContent = async (url) => {
    try {
      const response = await fetch('/api/fetch-article', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url })
      });

      if (response.ok) {
        const data = await response.json();
        return data.success ? data.content : null;
      }
    } catch (error) {
      console.warn('Article fetch failed:', error);
    }
    return null;
  };

  const translateAndSummarize = async (item, action = 'translate-and-summarize') => {
    // キャッシュチェック
    const cacheKey = `${item.url}-${action}`;
    if (translationCache[cacheKey]) {
      return translationCache[cacheKey];
    }

    try {
      // まず記事の本文を取得しようとする
      const fullContent = await fetchArticleContent(item.url);
      const textToProcess = fullContent || item.summary || item.title;
      
      console.log('Processing content length:', textToProcess.length, 'chars');
      
      const response = await fetch('/api/gemini-translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textToProcess,
          title: item.title,
          targetLang: 'ja',
          action: action
        })
      });

      if (response.ok) {
        const data = await response.json();
        const result = {
          translatedText: data.translatedText || item.summary,
          summary: data.summary || textToProcess.substring(0, 100) + '...',
          method: data.method || 'unknown',
          contentType: fullContent ? 'full-article' : 'description-only'
        };
        
        // キャッシュに保存
        setTranslationCache(prev => ({
          ...prev,
          [cacheKey]: result
        }));
        
        return result;
      }
    } catch (error) {
      console.warn('Translation failed:', error);
    }
    
    return {
      translatedText: item.summary,
      summary: item.summary.substring(0, 100) + '...',
      method: 'error',
      contentType: 'fallback'
    };
  };

  const toggleLanguage = async () => {
    if (language === 'en') {
      setTranslating(true);
      setLanguage('jp');
      
      // ニュースを翻訳&要約（本文取得して從来より高精度な要約）
      const translatedNews = await Promise.all(
        news.map(async (item) => {
          const result = await translateAndSummarize(item, 'translate-and-summarize');
          
          return {
            ...item,
            originalTitle: item.title,
            originalSummary: item.summary,
            title: result.translatedText ? result.translatedText.split('\n')[0] : item.title,
            summary: result.translatedText || item.summary,
            aiSummary: result.summary || item.summary,
            translationMethod: result.method,
            contentType: result.contentType
          };
        })
      );
      
      setNews(translatedNews);
      setTranslating(false);
    } else {
      setLanguage('en');
      // 元のテキストに戻す
      const originalNews = news.map(item => ({
        ...item,
        title: item.originalTitle || item.title,
        summary: item.originalSummary || item.summary
      }));
      setNews(originalNews);
    }
  };

  const fetchNews = async () => {
    setLoading(true);
    setApiError(null);
    
    try {
      console.log('Fetching news from API...');
      
      // 複数のAPIソースから取得を試行
      const newsAPIs = [
        { url: 'https://newsapi.org/v2/everything?q=artificial+intelligence&sortBy=publishedAt&apiKey=YOUR_API_KEY', name: 'NewsAPI' },
        { url: 'https://api.currentsapi.services/v1/search?keywords=artificial+intelligence&apiKey=YOUR_API_KEY', name: 'CurrentsAPI' },
        { url: 'https://newsdata.io/api/1/news?apikey=YOUR_API_KEY&q=artificial+intelligence', name: 'NewsData' }
      ];
      
      // HackerNewsのAI関連記事を取得
      const hackernewsResponse = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
      if (hackernewsResponse.ok) {
        const storyIds = await hackernewsResponse.json();
        const topStories = storyIds.slice(0, 10);
        
        const stories = await Promise.all(
          topStories.map(async (id) => {
            const storyResponse = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
            if (storyResponse.ok) {
              const story = await storyResponse.json();
              const content = (story.title + ' ' + (story.text || '')).toLowerCase();
              
              // AI関連のストーリーのみフィルタリング
              const aiKeywords = ['ai', 'artificial intelligence', 'machine learning', 'chatgpt', 'openai', 'llm', 'neural network', 'deep learning'];
              const isAIRelated = aiKeywords.some(keyword => content.includes(keyword));
              
              if (isAIRelated) {
                return {
                  id: story.id,
                  title: story.title,
                  summary: story.text || 'Hacker News discussion',
                  category: 'tech',
                  source: 'Hacker News',
                  url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
                  publishedAt: new Date(story.time * 1000).toISOString(),
                  image: null
                };
              }
            }
            return null;
          })
        );
        
        const validStories = stories.filter(story => story !== null);
        
        if (validStories.length > 0) {
          console.log(`Successfully fetched ${validStories.length} AI news articles from Hacker News`);
          setNews(validStories);
          setLastUpdated(new Date());
          setLoading(false);
          return;
        }
      }
      
      // Reddit r/MachineLearning の最新投稿を取得
      const redditResponse = await fetch('https://www.reddit.com/r/MachineLearning/hot.json?limit=20');
      if (redditResponse.ok) {
        const redditData = await redditResponse.json();
        const posts = redditData.data.children.map(post => ({
          id: post.data.id,
          title: post.data.title,
          summary: post.data.selftext || 'Reddit discussion in r/MachineLearning',
          category: 'tech',
          source: 'Reddit',
          url: post.data.url,
          publishedAt: new Date(post.data.created_utc * 1000).toISOString(),
          image: null
        }));
        
        if (posts.length > 0) {
          console.log(`Successfully fetched ${posts.length} AI news articles from Reddit`);
          setNews(posts);
          setLastUpdated(new Date());
          setLoading(false);
          return;
        }
      }
      
      // 公開APIからのニュース取得に失敗した場合
      throw new Error('All news sources failed to respond');
      
    } catch (error) {
      console.error('ニュースの取得に失敗しました:', error);
      setApiError(error.message);
      
      // 最後の手段として基本的なデモデータを設定
      const basicNews = [
        {
          id: 1,
          title: "AI News Dashboard - Real-time Updates",
          summary: "This dashboard is designed to fetch real-time AI news from various sources. Currently experiencing API connectivity issues.",
          category: "tech",
          source: "System",
          url: "#",
          publishedAt: new Date().toISOString(),
          image: null
        }
      ];
      
      setNews(basicNews);
      setLastUpdated(new Date());
    } finally {
      setLoading(false);
    }
  };

  const filteredNews = news.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  useEffect(() => {
    fetchNews();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                <Bot className="text-blue-600" size={40} />
                {language === 'en' ? 'AI News Dashboard' : 'AIニュースダッシュボード'}
              </h1>
              <p className="text-gray-600 text-lg">
                {language === 'en' 
                  ? 'Stay updated with the latest AI developments' 
                  : '最新のAI技術動向を毎日チェック'
                }
              </p>
            </div>
            
            {/* 言語切り替えと要約表示ボタン */}
            <div className="flex items-center gap-3">
              <button
                onClick={async () => {
                  if (!showSummary) {
                    // 要約表示をオンにする時、まだ要約がない記事に対して要約を生成
                    setSummarizing(true);
                    const needsSummary = news.filter(item => !item.aiSummary);
                    
                    if (needsSummary.length > 0) {
                      const updatedNews = await Promise.all(
                        news.map(async (item) => {
                          if (item.aiSummary) {
                            return item; // 既に要約があるものはそのまま
                          }
                          
                          const result = await translateAndSummarize(item, language === 'en' ? 'summarize' : 'translate-and-summarize');
                          
                          return {
                            ...item,
                            aiSummary: result.summary,
                            translationMethod: result.method,
                            contentType: result.contentType
                          };
                        })
                      );
                      setNews(updatedNews);
                    }
                    setSummarizing(false);
                  }
                  setShowSummary(!showSummary);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                  showSummary
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Bot size={20} />
                {summarizing ? (
                  language === 'en' ? 'Generating...' : '要約生成中...'
                ) : (
                  language === 'en' ? (showSummary ? 'Hide Summary' : 'Show Summary') : (showSummary ? '要約を隠す' : '要約を表示')
                )}
              </button>
              <button
                onClick={toggleLanguage}
                disabled={translating || summarizing}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Languages size={20} />
                {translating ? (
                  language === 'en' ? 'Translating...' : '翻訳中...'
                ) : (
                  language === 'en' ? '日本語' : 'English'
                )}
              </button>
            </div>
          </div>
        </div>

        {/* 検索とフィルター */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder={language === 'en' ? 'Search news...' : 'ニュースを検索...'}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={fetchNews}
              disabled={loading || translating || summarizing}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={loading ? 'animate-spin' : ''} size={20} />
              {loading ? 
                (language === 'en' ? 'Updating...' : '更新中...') : 
                (language === 'en' ? 'Update' : '更新')
              }
            </button>
          </div>

          {/* カテゴリーフィルター */}
          <div className="flex flex-wrap gap-2">
            {categories.map(category => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={16} />
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* 最終更新時刻 */}
        {lastUpdated && (
          <div className="mb-6 flex items-center gap-2 text-sm text-gray-500">
            <Calendar size={16} />
            {language === 'en' ? 'Last updated: ' : '最終更新: '}
            {lastUpdated.toLocaleString(language === 'en' ? 'en-US' : 'ja-JP')}
          </div>
        )}

        {/* ニュースリスト */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredNews.map(item => (
            <article
              key={item.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="relative h-48 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                {item.image && !item.image.includes('data:image/svg+xml') ? (
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover rounded-t-xl"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                  <div className="text-center">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-3 ${
                      item.category === 'llm' ? 'bg-purple-100 text-purple-600' :
                      item.category === 'generative' ? 'bg-green-100 text-green-600' :
                      item.category === 'tech' ? 'bg-blue-100 text-blue-600' :
                      item.category === 'business' ? 'bg-orange-100 text-orange-600' :
                      item.category === 'japan' ? 'bg-red-100 text-red-600' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {categories.find(c => c.id === item.category)?.icon && 
                        React.createElement(categories.find(c => c.id === item.category).icon, { size: 24 })}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      item.category === 'llm' ? 'bg-purple-100 text-purple-800' :
                      item.category === 'generative' ? 'bg-green-100 text-green-800' :
                      item.category === 'tech' ? 'bg-blue-100 text-blue-800' :
                      item.category === 'business' ? 'bg-orange-100 text-orange-800' :
                      item.category === 'japan' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {categories.find(c => c.id === item.category)?.name || 'その他'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <span className="font-medium">{item.source}</span>
                  <span>•</span>
                  <span>{formatDate(item.publishedAt)}</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                  {item.title}
                </h3>
                
                <div className="mb-4">
                  <p className="text-gray-600 mb-2 line-clamp-3">
                    {item.summary}
                  </p>
                  {showSummary && item.aiSummary && item.aiSummary !== item.summary && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-300">
                      <div className="flex items-center gap-2 mb-2">
                        <Bot size={16} className="text-blue-600" />
                        <span className="text-sm font-medium text-blue-700">
                          {language === 'en' ? 'AI Summary' : 'AI要約'}
                        </span>
                        {item.translationMethod && (
                          <span className="text-xs text-blue-500 bg-blue-100 px-2 py-1 rounded mr-2">
                            {item.translationMethod}
                          </span>
                        )}
                        {item.contentType && (
                          <span className={`text-xs px-2 py-1 rounded ${
                            item.contentType === 'full-article' 
                              ? 'text-green-600 bg-green-100' 
                              : 'text-orange-600 bg-orange-100'
                          }`}>
                            {item.contentType === 'full-article' ? '全文要約' : '概要のみ'}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-blue-800 leading-relaxed">
                        {item.aiSummary.includes('•') || item.aiSummary.includes('・') ? (
                          // 箱条書き形式の場合
                          <ul className="space-y-2 ml-4">
                            {item.aiSummary.split(/\n/).filter(line => line.trim().includes('•') || line.trim().includes('・')).map((point, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="text-blue-600 mr-2 mt-1">•</span>
                                <span>{point.replace(/[•・]/g, '').trim()}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          // 通常の文章形式の場合
                          <div className="space-y-2">
                            {item.aiSummary.split(/[\n。．]+/).filter(s => s.trim().length > 10).map((sentence, idx) => (
                              <p key={idx} className="mb-2">
                                {sentence.trim().endsWith('。') || sentence.trim().endsWith('．') ? sentence.trim() : sentence.trim() + '。'}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  {language === 'en' ? 'Read more' : '続きを読む'}
                  <ExternalLink size={16} />
                </a>
              </div>
            </article>
          ))}
        </div>

        {filteredNews.length === 0 && !loading && !translating && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {language === 'en' 
                ? 'No news found matching your criteria.' 
                : '該当するニュースが見つかりませんでした。'
              }
            </p>
          </div>
        )}

        {(translating || summarizing) && (
          <div className="text-center py-12">
            <div className="flex items-center justify-center gap-3">
              <RefreshCw className="animate-spin" size={20} />
              <p className="text-gray-500 text-lg">
                {translating 
                  ? (language === 'en' ? 'Translating articles...' : '記事を翻訳中...')
                  : (language === 'en' ? 'Generating summaries...' : '要約を生成中...')
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AINewsDashboard;