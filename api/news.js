// Vercel Edge Function for RSS News Feed Aggregator
import { XMLParser } from 'fast-xml-parser';

export default async function handler(request, response) {
  // CORS headers
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method !== 'GET') {
    return response.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // RSS Feed sources for AI news - Comprehensive AI-focused sources
    const rssFeeds = [
      // 主要テック系AI専門フィード
      'https://techcrunch.com/category/artificial-intelligence/feed/',
      'https://venturebeat.com/ai/feed/',
      'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml',
      'https://feeds.ycombinator.com/news.rss',
      
      // AI研究・学術系
      'https://arxiv.org/rss/cs.AI',
      'https://arxiv.org/rss/cs.LG', 
      'https://arxiv.org/rss/cs.CL',
      'https://arxiv.org/rss/cs.CV',
      'https://www.ai-mag.com/feed/',
      'https://distill.pub/rss.xml',
      
      // 企業・ビジネス系AI
      'https://openai.com/blog/rss.xml',
      'https://blog.google/technology/ai/rss',
      'https://blogs.microsoft.com/ai/feed/',
      'https://aws.amazon.com/blogs/machine-learning/feed/',
      'https://engineering.fb.com/feed/',
      'https://developer.nvidia.com/blog/feed',
      'https://blog.research.google/feeds/posts/default',
      
      // AI業界ニュース・分析
      'https://www.artificialintelligence-news.com/feed/',
      'https://syncedreview.com/feed/',
      'https://www.unite.ai/feed/',
      'https://hai.stanford.edu/news/rss.xml',
      'https://www.deeplearning.ai/the-batch/rss/',
      'https://www.marktechpost.com/feed/',
      'https://analyticsindiamag.com/feed/',
      'https://www.kdnuggets.com/feed',
      
      // ML/DL専門
      'https://machinelearningmastery.com/feed/',
      'https://towardsdatascience.com/feed',
      'https://blog.paperspace.com/rss/',
      'https://www.fast.ai/feed.xml',
      'https://neptune.ai/blog/rss.xml',
      'https://wandb.ai/fully-connected/rss.xml',
      
      // スタートアップ・投資系
      'https://news.crunchbase.com/feed/',
      'https://pitchbook.com/news/rss',
      'https://www.cbinsights.com/feed',
      
      // 一般テック（AIコンテンツフィルタリング後）
      'https://feeds.arstechnica.com/arstechnica/index',
      'https://www.wired.com/feed/rss',
      'https://feeds.feedburner.com/oreilly/radar',
      'https://rss.cnn.com/rss/edition_technology.rss',
      'https://feeds.reuters.com/reuters/technologyNews',
      'https://feeds.bbci.co.uk/news/technology/rss.xml',
      
      // 日本のAI情報源
      'https://ledge.ai/feed/',
      'https://ainow.ai/feed/',
      'https://www.itmedia.co.jp/news/subtop/aiplus/index.rdf',
      
      // GitHub・開発者系
      'https://github.blog/feed/',
      'https://huggingface.co/blog/feed.xml',
      
      // AI倫理・政策
      'https://www.partnershiponai.org/feed/',
      'https://futureoflife.org/feed/',
      
      // 新興AI企業
      'https://blog.anthropic.com/rss',
      'https://stability.ai/blog/rss',
      'https://cohere.com/blog/rss.xml',
      
      // AI関連ポッドキャスト・メディア
      'https://lexfridman.com/feed/podcast/',
      'https://www.twimlai.com/feed/podcast/',
      'https://changelog.com/practicalai/feed'
    ];

    let allArticles = [];
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_'
    });

    // Fetch from multiple RSS feeds
    for (const feedUrl of rssFeeds) {
      try {
        const feedResponse = await fetch(feedUrl, {
          headers: {
            'User-Agent': 'AI-News-Dashboard/1.0'
          }
        });

        if (feedResponse.ok) {
          const xmlText = await feedResponse.text();
          const feedData = parser.parse(xmlText);
          
          let items = [];
          if (feedData.rss && feedData.rss.channel && feedData.rss.channel.item) {
            items = Array.isArray(feedData.rss.channel.item) 
              ? feedData.rss.channel.item 
              : [feedData.rss.channel.item];
          }

          // Convert RSS items to standard format
          const articles = items.map(item => ({
            title: item.title || 'No title',
            description: item.description || item.summary || 'No description',
            url: item.link || item.guid,
            publishedAt: item.pubDate || item.published || new Date().toISOString(),
            source: { name: new URL(feedUrl).hostname.replace('www.', '') },
            urlToImage: null // RSS feeds don't always have images
          }));

          allArticles = [...allArticles, ...articles];
        }
      } catch (feedError) {
        console.warn(`Failed to fetch ${feedUrl}:`, feedError.message);
      }
    }

    // Enhanced AI-related content filtering with comprehensive keywords
    const aiArticles = allArticles.filter(article => {
      const content = (article.title + ' ' + (article.description || '')).toLowerCase();
      const aiKeywords = [
        // Core AI terms
        'ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning', 'dl',
        'neural network', 'neural networks', 'algorithm', 'algorithms',
        
        // Popular AI models/companies
        'openai', 'chatgpt', 'gpt', 'claude', 'anthropic', 'gemini', 'bard',
        'llm', 'large language model', 'generative', 'transformer',
        'bert', 'roberta', 'gpt-4', 'gpt-3', 'dall-e', 'midjourney',
        
        // AI techniques/concepts
        'computer vision', 'natural language processing', 'nlp', 'reinforcement learning',
        'supervised learning', 'unsupervised learning', 'diffusion', 'autoregressive',
        'attention mechanism', 'backpropagation', 'gradient descent',
        
        // AI applications
        'chatbot', 'voice assistant', 'image generation', 'text generation',
        'automation', 'autonomous', 'robotics', 'recommendation system',
        'facial recognition', 'speech recognition', 'translation',
        
        // AI hardware/infrastructure
        'gpu', 'nvidia', 'tensor', 'cuda', 'tpu', 'edge computing',
        'quantum computing', 'neuromorphic',
        
        // AI companies/platforms
        'hugging face', 'stability ai', 'cohere', 'ai21', 'databricks',
        'scale ai', 'weights & biases', 'wandb', 'mlflow',
        
        // AI ethics/safety
        'ai safety', 'ai alignment', 'bias', 'fairness', 'explainable ai',
        'xai', 'responsible ai', 'ai governance',
        
        // Emerging AI terms
        'multimodal', 'foundation model', 'prompt engineering', 'few-shot',
        'zero-shot', 'in-context learning', 'emergent behavior',
        'artificial general intelligence', 'agi', 'superintelligence'
      ];
      
      return aiKeywords.some(keyword => content.includes(keyword));
    });

    // Remove duplicates and sort by date
    const uniqueArticles = aiArticles
      .filter((article, index, self) => 
        index === self.findIndex(a => a.url === article.url)
      )
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, 50); // More articles with expanded sources

    return response.status(200).json({
      status: 'ok',
      totalResults: uniqueArticles.length,
      articles: uniqueArticles
    });

  } catch (error) {
    console.error('RSS aggregator error:', error);
    
    // Fallback demo data if RSS fails
    const demoArticles = [
      {
        title: "OpenAI Announces GPT-4 Turbo with 128K Context",
        description: "OpenAI has announced GPT-4 Turbo, a more capable and cost-effective model with a 128K context window.",
        url: "https://openai.com/blog/gpt-4-turbo",
        publishedAt: new Date().toISOString(),
        source: { name: "OpenAI" },
        urlToImage: null
      },
      {
        title: "Meta AI Introduces Code Llama for Programming",
        description: "Meta has released Code Llama, a specialized version of Llama 2 designed for code generation.",
        url: "https://ai.meta.com/blog/code-llama-large-language-model-coding/",
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: { name: "Meta AI" },
        urlToImage: null
      }
    ];

    return response.status(200).json({
      status: 'ok',
      totalResults: demoArticles.length,
      articles: demoArticles,
      fallback: true
    });
  }
}