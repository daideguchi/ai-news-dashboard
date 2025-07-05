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
    // High-quality AI-focused RSS feeds (optimized for speed and relevance)
    const priorityFeeds = [
      // 最優先: AI専門企業ブログ（高品質・高関連性）
      'https://openai.com/blog/rss.xml',
      'https://blog.google/technology/ai/rss',
      'https://blogs.microsoft.com/ai/feed/',
      'https://blog.anthropic.com/rss',
      'https://huggingface.co/blog/feed.xml',
      'https://stability.ai/blog/rss',
      
      // 主要AI業界メディア
      'https://techcrunch.com/category/artificial-intelligence/feed/',
      'https://venturebeat.com/ai/feed/',
      'https://www.artificialintelligence-news.com/feed/',
      'https://www.unite.ai/feed/',
      'https://www.marktechpost.com/feed/',
      
      // AI研究機関
      'https://hai.stanford.edu/news/rss.xml',
      'https://www.deeplearning.ai/the-batch/rss/',
      'https://blog.research.google/feeds/posts/default',
      
      // 日本のAI専門メディア
      'https://ledge.ai/feed/',
      'https://ainow.ai/feed/'
    ];

    // 追加フィード（時間に余裕があれば取得）
    const secondaryFeeds = [
      'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml',
      'https://developer.nvidia.com/blog/feed',
      'https://aws.amazon.com/blogs/machine-learning/feed/',
      'https://github.blog/feed/',
      'https://syncedreview.com/feed/',
      'https://feeds.ycombinator.com/news.rss'
    ];

    const rssFeeds = [...priorityFeeds, ...secondaryFeeds];

    let allArticles = [];
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_'
    });

    // Helper function to fetch and parse a single feed
    const fetchFeed = async (feedUrl, timeout = 5000) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        
        const feedResponse = await fetch(feedUrl, {
          headers: {
            'User-Agent': 'AI-News-Dashboard/1.0'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (feedResponse.ok) {
          const xmlText = await feedResponse.text();
          const feedData = parser.parse(xmlText);
          
          let items = [];
          if (feedData.rss && feedData.rss.channel && feedData.rss.channel.item) {
            items = Array.isArray(feedData.rss.channel.item) 
              ? feedData.rss.channel.item 
              : [feedData.rss.channel.item];
          }

          // Convert RSS items to standard format with better text cleaning
          return items.map(item => ({
            title: cleanText(item.title || 'No title'),
            description: cleanText(item.description || item.summary || 'No description'),
            url: item.link || item.guid,
            publishedAt: item.pubDate || item.published || new Date().toISOString(),
            source: { name: new URL(feedUrl).hostname.replace('www.', '') },
            urlToImage: null
          }));
        }
      } catch (feedError) {
        console.warn(`Failed to fetch ${feedUrl}:`, feedError.message);
        return [];
      }
      return [];
    };

    // Helper function to clean HTML and format text
    const cleanText = (text) => {
      if (!text) return '';
      return text
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&nbsp;/g, ' ')
        .replace(/\s+/g, ' ') // Replace multiple spaces
        .trim();
    };

    // Fetch priority feeds first (faster response)
    const priorityResults = await Promise.allSettled(
      priorityFeeds.map(url => fetchFeed(url, 4000))
    );
    
    // Add priority results
    priorityResults.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        allArticles = [...allArticles, ...result.value];
      }
    });

    // Fetch secondary feeds with shorter timeout
    const secondaryResults = await Promise.allSettled(
      secondaryFeeds.map(url => fetchFeed(url, 3000))
    );
    
    // Add secondary results
    secondaryResults.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        allArticles = [...allArticles, ...result.value];
      }
    });

    // Smart AI content filtering - prioritize high-quality AI news
    const aiArticles = allArticles.filter(article => {
      const content = (article.title + ' ' + (article.description || '')).toLowerCase();
      
      // Exclude low-quality content
      const excludeKeywords = [
        'interview', 'job', 'career', 'hiring', 'resume', 'salary',
        'course', 'tutorial', 'beginner', 'learn', 'guide', 'how to',
        'data science interview', 'python tutorial', 'certification'
      ];
      
      const hasExcluded = excludeKeywords.some(keyword => content.includes(keyword));
      if (hasExcluded) return false;
      
      // High-priority AI keywords (more specific and newsworthy)
      const highPriorityKeywords = [
        'openai', 'chatgpt', 'gpt-4', 'claude', 'anthropic', 'gemini',
        'artificial intelligence breakthrough', 'ai breakthrough', 'new ai model',
        'llm', 'large language model', 'generative ai', 'ai startup',
        'ai funding', 'ai investment', 'ai acquisition', 'ai partnership',
        'nvidia ai', 'google ai', 'microsoft ai', 'meta ai',
        'dall-e', 'midjourney', 'stable diffusion', 'hugging face',
        'ai regulation', 'ai safety', 'agi', 'artificial general intelligence'
      ];
      
      const hasHighPriority = highPriorityKeywords.some(keyword => content.includes(keyword));
      if (hasHighPriority) return true;
      
      // Standard AI keywords
      const standardKeywords = [
        'artificial intelligence', 'machine learning', 'deep learning',
        'neural network', 'computer vision', 'natural language processing',
        'robotics', 'automation', 'ai', ' ml ', 'nlp'
      ];
      
      return standardKeywords.some(keyword => content.includes(keyword));
    });

    // Remove duplicates and sort by date
    const uniqueArticles = aiArticles
      .filter((article, index, self) => 
        index === self.findIndex(a => a.url === article.url)
      )
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, 30); // Optimized for quality over quantity

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