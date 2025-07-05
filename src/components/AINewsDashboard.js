import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Calendar, ExternalLink, Bot, Zap, Building2, Globe, MapPin } from 'lucide-react';

const AINewsDashboard = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // デモデータ
  const demoNews = [
    {
      id: 1,
      title: "OpenAI、GPT-4の新機能「Code Interpreter」を全ユーザーに開放",
      summary: "OpenAIが開発したコード実行機能により、データ分析やグラフ作成が可能に",
      category: "llm",
      source: "TechCrunch",
      url: "https://techcrunch.com/example",
      publishedAt: "2024-01-15T10:30:00Z",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjU3Mzg2Ij5PcGVuQUkgTmV3czwvdGV4dD4KPC9zdmc+"
    },
    {
      id: 2,
      title: "Google、Gemini Proの日本語対応を発表",
      summary: "多言語対応により、日本市場でのAI活用が加速",
      category: "japan",
      source: "日経新聞",
      url: "https://nikkei.com/example",
      publishedAt: "2024-01-14T15:45:00Z",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRUZGNkZGIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjU3Mzg2Ij5Hb29nbGUgR2VtaW5pPC90ZXh0Pgo8L3N2Zz4="
    },
    {
      id: 3,
      title: "Stability AI、新たな画像生成モデル「SDXL Turbo」をリリース",
      summary: "リアルタイム画像生成を実現、クリエイティブ業界に革命",
      category: "generative",
      source: "The Verge",
      url: "https://theverge.com/example",
      publishedAt: "2024-01-14T09:20:00Z",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjBGREY0Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjU3Mzg2Ij5TRFRMIFR1cmJvPC90ZXh0Pgo8L3N2Zz4="
    },
    {
      id: 4,
      title: "Microsoft、Azure OpenAI ServiceでのRAG機能を強化",
      summary: "企業向けAIソリューションの精度向上を図る",
      category: "business",
      source: "Microsoft Blog",
      url: "https://microsoft.com/example",
      publishedAt: "2024-01-13T14:10:00Z",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkVGNkUzIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjU3Mzg2Ij5NaWNyb3NvZnQgQXp1cmU8L3RleHQ+Cjwvc3ZnPg=="
    },
    {
      id: 5,
      title: "Meta、LLaMA 2の商用利用ライセンスを拡大",
      summary: "オープンソースAIモデルの普及により、開発者エコシステムが拡大",
      category: "tech",
      source: "Meta AI",
      url: "https://ai.meta.com/example",
      publishedAt: "2024-01-12T11:55:00Z",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkFFRkZGIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjU3Mzg2Ij5NZXRhIExMYU1BPC90ZXh0Pgo8L3N2Zz4="
    },
    {
      id: 6,
      title: "トヨタ、AI技術を活用した次世代自動運転システムを発表",
      summary: "日本の自動車メーカーがAI分野での競争力強化を図る",
      category: "japan",
      source: "日本経済新聞",
      url: "https://nikkei.com/example2",
      publishedAt: "2024-01-11T16:30:00Z",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkVGMkY0Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjU3Mzg2Ij5Ub3lvdGEgQUk8L3RleHQ+Cjwvc3ZnPg=="
    }
  ];

  const categories = [
    { id: 'all', name: 'すべて', icon: Globe },
    { id: 'llm', name: 'LLM', icon: Bot },
    { id: 'generative', name: '生成AI', icon: Zap },
    { id: 'tech', name: '技術', icon: Bot },
    { id: 'business', name: 'ビジネス', icon: Building2 },
    { id: 'japan', name: '日本', icon: MapPin }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return '今すぐ';
    if (diffInHours < 24) return `${diffInHours}時間前`;
    if (diffInHours < 48) return '昨日';
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}日前`;
  };

  const fetchNews = async () => {
    setLoading(true);
    try {
      // 実際のAPIコールはここで行う
      // const response = await fetch('/api/news');
      // const data = await response.json();
      
      // デモ用にローカルデータを使用
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNews(demoNews);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('ニュースの取得に失敗しました:', error);
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
          <h1 className="text-4xl font-bold text-gray-800 mb-4 flex items-center gap-3">
            <Bot className="text-blue-600" size={40} />
            AIニュースダッシュボード
          </h1>
          <p className="text-gray-600 text-lg">最新のAI技術動向を毎日チェック</p>
        </div>

        {/* 検索とフィルター */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="ニュースを検索..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={fetchNews}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <RefreshCw className={loading ? 'animate-spin' : ''} size={20} />
              {loading ? '更新中...' : '更新'}
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
            最終更新: {lastUpdated.toLocaleString('ja-JP')}
          </div>
        )}

        {/* ニュースリスト */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredNews.map(item => (
            <article
              key={item.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              <div className="aspect-video bg-gray-200 relative">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 right-3">
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
              
              <div className="p-6">
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                  <span className="font-medium">{item.source}</span>
                  <span>•</span>
                  <span>{formatDate(item.publishedAt)}</span>
                </div>
                
                <h3 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                  {item.title}
                </h3>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {item.summary}
                </p>
                
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
                >
                  続きを読む
                  <ExternalLink size={16} />
                </a>
              </div>
            </article>
          ))}
        </div>

        {filteredNews.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">該当するニュースが見つかりませんでした。</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AINewsDashboard;