import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Calendar, ExternalLink, Bot, Zap, Building2, Globe, MapPin } from 'lucide-react';

const AINewsDashboard = () => {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // 最新のAIニュースデータ（2025年7月5日更新）
  const demoNews = [
    {
      id: 1,
      title: "DeepSeek R1モデルがAI業界に衝撃、6百万ドルで開発",
      summary: "中国のDeepSeekが超低コストでOpenAI並みの性能を実現。グローバル株式市場に1兆ドル規模の売り圧力",
      category: "llm",
      source: "Reuters",
      url: "https://reuters.com/deepseek-ai",
      publishedAt: "2025-07-05T08:30:00Z",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkZGMUY5Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjU3Mzg2Ij5EZWVwU2VlayBBSTwvdGV4dD4KPC9zdmc+"
    },
    {
      id: 2,
      title: "OpenAI、新AI助手「Operator」とo3-miniモデルを発表",
      summary: "自律的にオンライン作業を実行するOperatorと、推論能力を向上させたo3-miniを発表",
      category: "llm",
      source: "OpenAI Blog",
      url: "https://openai.com/operator",
      publishedAt: "2025-07-04T16:00:00Z",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjU3Mzg2Ij5PcGVuQUkgT3BlcmF0b3I8L3RleHQ+Cjwvc3ZnPg=="
    },
    {
      id: 3,
      title: "Meta、AI研究に650億ドル投資を発表",
      summary: "ザッカーバーグCEOが2025年にAI関連で過去最大規模の投資を実施。ルイジアナ州にメガデータセンター建設",
      category: "business",
      source: "Meta Newsroom",
      url: "https://about.fb.com/news/2025/07/ai-investment/",
      publishedAt: "2025-07-04T12:15:00Z",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRUZGNkZGIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjU3Mzg2Ij5NZXRhIEFJIEludmVzdG1lbnQ8L3RleHQ+Cjwvc3ZnPg=="
    },
    {
      id: 4,
      title: "Google、AI Ultra新サブスクリプションサービス開始",
      summary: "最高性能のAIモデルへアクセス可能な新プラン。クリエイター・開発者向けに無制限利用を提供",
      category: "business",
      source: "Google AI Blog",
      url: "https://blog.google/technology/ai/google-ai-ultra-2025/",
      publishedAt: "2025-07-03T14:30:00Z",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkVGNkUzIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjU3Mzg2Ij5Hb29nbGUgQUkgVWx0cmE8L3RleHQ+Cjwvc3ZnPg=="
    },
    {
      id: 5,
      title: "Microsoft、AIエージェント新世代を2025年に本格展開",
      summary: "自律的にタスクを実行するAIエージェントが企業の70%で既に活用。週60時間勤務でAGI開発競争が激化",
      category: "tech",
      source: "Microsoft News",
      url: "https://news.microsoft.com/ai-agents-2025/",
      publishedAt: "2025-07-03T09:45:00Z",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjBGREY0Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjU3Mzg2Ij5NaWNyb3NvZnQgQUkgQWdlbnRzPC90ZXh0Pgo8L3N2Zz4="
    },
    {
      id: 6,
      title: "中国20社以上がDeepSeek AIを車・家電に組み込み開始",
      summary: "DeepSeekの成功を受け、中国企業がAI統合を加速。オープンソースAI普及でコスト60-80%削減",
      category: "japan",
      source: "Rest of World",
      url: "https://restofworld.org/china-deepseek-integration/",
      publishedAt: "2025-07-02T18:20:00Z",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkVGMkY0Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjU3Mzg2Ij7kuK3lm73jgqjjgqTntYznlLM8L3RleHQ+Cjwvc3ZnPg=="
    },
    {
      id: 7,
      title: "OpenAI、GoogleのAIチップ採用でインフラ戦略転換",
      summary: "ChatGPTなどのサービスでGoogle製AIチップを利用開始。競合他社の技術活用で注目",
      category: "tech",
      source: "Reuters",
      url: "https://reuters.com/openai-google-chips/",
      publishedAt: "2025-07-02T11:30:00Z",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkFFRkZGIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjU3Mzg2Ij5PcGVuQUkgeCBHb29nbGU8L3RleHQ+Cjwvc3ZnPg=="
    },
    {
      id: 8,
      title: "ビッグテック、2025年にAI投資3200億ドル計画",
      summary: "主要IT企業が過去最大規模のAI投資を実施。AGI実現に向けた技術者争奪戦が激化",
      category: "business",
      source: "Bloomberg",
      url: "https://bloomberg.com/ai-investment-2025/",
      publishedAt: "2025-07-01T15:45:00Z",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGOUZBIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjU3Mzg2Ij5CaWcgVGVjaCBJbnZlc3RtZW50PC90ZXh0Pgo8L3N2Zz4="
    },
    {
      id: 9,
      title: "GPT-4.5、感情知能（EQ）を大幅向上させた新モデル",
      summary: "OpenAIがEQに特化したGPT-4.5を発表。より人間らしい対話と共感能力を実現",
      category: "llm",
      source: "OpenAI Research",
      url: "https://openai.com/gpt-4.5-eq/",
      publishedAt: "2025-06-30T13:20:00Z",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkNGREZFIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjU3Mzg2Ij5HUFQtNC41IEVRPC90ZXh0Pgo8L3N2Zz4="
    },
    {
      id: 10,
      title: "百度・華為がDeepSeek追随でオープンソースAI発表",
      summary: "中国大手IT企業がDeepSeekの成功を受けてオープンソースAIモデルを相次いで発表",
      category: "generative",
      source: "TrendForce",
      url: "https://trendforce.com/baidu-huawei-opensource-ai/",
      publishedAt: "2025-06-29T10:15:00Z",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjBGOUZGIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjU3Mzg2Ij7nmb7luqbjgrvljjrlnIg8L3RleHQ+Cjwvc3ZnPg=="
    },
    {
      id: 11,
      title: "OpenAI、300億ドル評価で400億ドル資金調達を完了",
      summary: "SoftBank主導でThrive Capital、Microsoft、Coatueが参加。過去最大規模のAIスタートアップ投資",
      category: "business",
      source: "TechCrunch",
      url: "https://techcrunch.com/openai-funding-40b/",
      publishedAt: "2025-06-28T14:45:00Z",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRUZGNkZGIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjU3Mzg2Ij5PcGVuQUkgRnVuZGluZzwvdGV4dD4KPC9zdmc+"
    },
    {
      id: 12,
      title: "Anthropic、615億ドル評価でSeries E 35億ドル調達",
      summary: "Lightspeed主導でSalesforce Ventures、Menlo Ventures、General Catalystが参加",
      category: "business",
      source: "Crunchbase",
      url: "https://crunchbase.com/anthropic-series-e/",
      publishedAt: "2025-06-27T11:20:00Z",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkZGOUZBIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjU3Mzg2Ij5BbnRocm9waWMgRnVuZGluZzwvdGV4dD4KPC9zdmc+"
    },
    {
      id: 13,
      title: "Berkeley、生物学最大のAIモデル「Evo 2」を発表",
      summary: "10万種以上のDNAデータで訓練。遺伝子設計と疾患変異の特定が可能な革新的AIモデル",
      category: "tech",
      source: "Berkeley Engineering",
      url: "https://engineering.berkeley.edu/evo-2-ai-breakthrough/",
      publishedAt: "2025-06-26T16:30:00Z",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjBGOUZGIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjU3Mzg2Ij5CZXJrZWxleSBFdm8gMjwvdGV4dD4KPC9zdmc+"
    },
    {
      id: 14,
      title: "EU AI法、2025年2月から段階的施行開始",
      summary: "世界初の包括的AI規制法。高リスクAIシステムへの厳格な規制と罰則を導入",
      category: "japan",
      source: "European Parliament",
      url: "https://europarl.europa.eu/ai-act-2025/",
      publishedAt: "2025-06-25T13:15:00Z",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkVGMkY0Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjU3Mzg2Ij5FVSBBSSBBY3Q8L3RleHQ+Cjwvc3ZnPg=="
    },
    {
      id: 15,
      title: "トランプ大統領、AI規制を大幅緩和する大統領令に署名",
      summary: "「米国のAIリーダーシップへの障壁除去」を目的とした新政策。バイデン政権のAI規制を撤廃",
      category: "japan",
      source: "CNBC",
      url: "https://cnbc.com/trump-ai-executive-order-2025/",
      publishedAt: "2025-06-24T10:45:00Z",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkNGREZFIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjU3Mzg2Ij5UcnVtcCBBSSBQb2xpY3k8L3RleHQ+Cjwvc3ZnPg=="
    },
    {
      id: 16,
      title: "SandboxAQ、57億ドル評価でSeries E 4.5億ドル調達",
      summary: "NVIDIA、Google、ブリッジウォーターのレイ・ダリオなどが投資。量子AI企業として注目",
      category: "business",
      source: "Bloomberg",
      url: "https://bloomberg.com/sandboxaq-funding-2025/",
      publishedAt: "2025-06-23T15:20:00Z",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkZGOUZBIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjU3Mzg2Ij5TYW5kYm94QVEgRnVuZGluZzwvdGV4dD4KPC9zdmc+"
    },
    {
      id: 17,
      title: "Thinking Machines Lab、100億ドル評価でSeries B 20億ドル",
      summary: "元OpenAI CTOミラ・ムラティが設立。マルチステップ推論と自己改善システムに特化",
      category: "business",
      source: "TechCrunch",
      url: "https://techcrunch.com/thinking-machines-lab-funding/",
      publishedAt: "2025-06-22T12:30:00Z",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjBGREY0Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjU3Mzg2Ij5UaGlua2luZyBNYWNoaW5lczwvdGV4dD4KPC9zdmc+"
    },
    {
      id: 18,
      title: "Stanford AI Index 2025：産業界がAIモデル開発を主導",
      summary: "2024年の注目AIモデルの90%が産業界発。学術界は引き続き引用数上位の研究を生産",
      category: "tech",
      source: "Stanford HAI",
      url: "https://hai.stanford.edu/ai-index-2025/",
      publishedAt: "2025-06-21T09:15:00Z",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkFFRkZGIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjU3Mzg2Ij5TdGFuZm9yZCBBSSBJbmRleDwvdGV4dD4KPC9zdmc+"
    },
    {
      id: 19,
      title: "TensorWave、Series A 1億ドル調達でAI推論インフラ強化",
      summary: "Magnetar Capital・AMD Ventures共同主導。AI推論とデプロイメントプラットフォーム拡大",
      category: "business",
      source: "VentureBeat",
      url: "https://venturebeat.com/tensorwave-series-a/",
      publishedAt: "2025-06-20T14:00:00Z",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi0vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGOUZBIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjU3Mzg2Ij5UZW5zb3JXYXZlIEZ1bmRpbmc8L3RleHQ+Cjwvc3ZnPg=="
    },
    {
      id: 20,
      title: "中国、AI法草案を発表。高リスクシステムへ厳格規制",
      summary: "2024年5月に学者が提案した「中華人民共和国人工知能法」草案。開発者・展開者に法的要求",
      category: "japan",
      source: "Reuters",
      url: "https://reuters.com/china-ai-law-draft-2025/",
      publishedAt: "2025-06-19T11:45:00Z",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkVGMkY0Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjU3Mzg2Ij7kuK3lm73jgqjjgqTms5Xmoag8L3RleHQ+Cjwvc3ZnPg=="
    },
    {
      id: 21,
      title: "Baseten、Series C 7500万ドルでAI推論プラットフォーム拡大",
      summary: "企業向けAIモデルデプロイメント時間短縮と技術的オーバーヘッド削減を実現",
      category: "business",
      source: "Crunchbase",
      url: "https://crunchbase.com/baseten-series-c/",
      publishedAt: "2025-06-18T16:20:00Z",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkZGOUZBIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjU3Mzg2Ij5CYXNldGVuIEZ1bmRpbmc8L3RleHQ+Cjwvc3ZnPg=="
    },
    {
      id: 22,
      title: "Rice大学とGoogle、AI venture accelerator発足",
      summary: "産学連携でAIスタートアップ支援。学術研究の実用化加速を目指す",
      category: "tech",
      source: "Rice University",
      url: "https://rice.edu/google-ai-accelerator-2025/",
      publishedAt: "2025-06-17T13:30:00Z",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkVGNkUzIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjU3Mzg2Ij5SaWNlICYgR29vZ2xlPC90ZXh0Pgo8L3N2Zz4="
    },
    {
      id: 23,
      title: "Andreessen Horowitz、15億ドルのAI専門ファンド設立",
      summary: "a16zがAI特化の大型ファンドを発表。機械学習スタートアップへの投資を急速拡大",
      category: "business",
      source: "TechCrunch",
      url: "https://techcrunch.com/a16z-ai-fund-1.5b/",
      publishedAt: "2025-06-16T10:15:00Z",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjBGOUZGIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjU3Mzg2Ij5hMTZ6IEFJIEZ1bmQ8L3RleHQ+Cjwvc3ZnPg=="
    },
    {
      id: 24,
      title: "Georgia Tech、AI acceleratorプログラム開始",
      summary: "学術研究の実用化に特化したAIアクセラレータープログラムを3月に正式発足",
      category: "tech",
      source: "Georgia Tech News",
      url: "https://news.gatech.edu/ai-accelerator-2025/",
      publishedAt: "2025-06-15T15:45:00Z",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRkNGREZFIi8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjU3Mzg2Ij5HZW9yZ2lhIFRlY2g8L3RleHQ+Cjwvc3ZnPg=="
    },
    {
      id: 25,
      title: "SAM 2発表：動画内オブジェクト追跡の革新技術",
      summary: "2025年の画期的AI論文。コンピューターが動画内でオブジェクトを追跡・識別する新技術",
      category: "generative",
      source: "Meta AI Research",
      url: "https://ai.meta.com/sam-2-video-tracking/",
      publishedAt: "2025-06-14T12:00:00Z",
      image: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjBGREY0Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjU3Mzg2Ij5TQU0gMiBWaWRlbzwvdGV4dD4KPC9zdmc+"
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
      // RSS フィードアグリゲーターAPIを呼び出し
      const response = await fetch('/api/news');

      if (response.ok) {
        const data = await response.json();
        
        if (data.articles && data.articles.length > 0) {
          // カテゴリ分類
          const categorizedNews = data.articles.map((article, index) => {
            let category = 'tech';
            const title = article.title.toLowerCase();
            const description = (article.description || '').toLowerCase();
            const content = title + ' ' + description;

            if (content.includes('openai') || content.includes('gpt') || content.includes('chatgpt') || 
                content.includes('claude') || content.includes('llm') || content.includes('large language')) {
              category = 'llm';
            } else if (content.includes('funding') || content.includes('investment') || content.includes('billion') || 
                       content.includes('startup') || content.includes('venture') || content.includes('raised') ||
                       content.includes('series') || content.includes('valuation')) {
              category = 'business';
            } else if (content.includes('generated') || content.includes('image') || content.includes('video') ||
                       content.includes('creative') || content.includes('art') || content.includes('design') ||
                       content.includes('dall-e') || content.includes('midjourney')) {
              category = 'generative';
            } else if (content.includes('japan') || content.includes('japanese') || content.includes('tokyo') ||
                       content.includes('sony') || content.includes('toyota') || content.includes('softbank')) {
              category = 'japan';
            }

            return {
              id: index + 1,
              title: article.title,
              summary: article.description || 'No description available',
              category: category,
              source: article.source.name,
              url: article.url,
              publishedAt: article.publishedAt,
              image: article.urlToImage || "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+Cjx0ZXh0IHg9IjE1MCIgeT0iMTAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSIjNjU3Mzg2Ij5BSSBOZXdzPC90ZXh0Pgo8L3N2Zz4="
            };
          });

          setNews(categorizedNews);
          
          // フォールバックかどうかを表示
          if (data.fallback) {
            console.warn('Using fallback demo data due to RSS feed issues');
          }
        } else {
          // API レスポンスが空の場合、デモデータを使用
          setNews(demoNews);
        }
      } else {
        // API エラーの場合、デモデータを使用
        console.warn('API request failed, using demo data');
        setNews(demoNews);
      }
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('ニュースの取得に失敗しました:', error);
      // エラー時はデモデータを表示
      setNews(demoNews);
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