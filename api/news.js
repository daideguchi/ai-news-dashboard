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
      'https://www.deepmind.com/blog/rss.xml',
      'https://blog.cohere.com/rss.xml',
      'https://www.ai21.com/blog/rss',
      'https://blog.mistral.ai/rss.xml',
      'https://blog.perplexity.ai/rss.xml',
      
      // 主要AI業界メディア
      'https://techcrunch.com/category/artificial-intelligence/feed/',
      'https://venturebeat.com/ai/feed/',
      'https://www.artificialintelligence-news.com/feed/',
      'https://www.unite.ai/feed/',
      'https://www.marktechpost.com/feed/',
      'https://blog.langchain.dev/rss.xml',
      'https://towardsdatascience.com/feed',
      'https://www.kdnuggets.com/feed',
      
      // AI研究機関・学術
      'https://hai.stanford.edu/news/rss.xml',
      'https://www.deeplearning.ai/the-batch/rss/',
      'https://blog.research.google/feeds/posts/default',
      'https://openai.com/research/rss.xml',
      'https://arxiv.org/rss/cs.AI',
      'https://arxiv.org/rss/cs.LG',
      'https://arxiv.org/rss/cs.CL',
      
      // 日本のAI専門メディア
      'https://ledge.ai/feed/',
      'https://ainow.ai/feed/',
      'https://www.itmedia.co.jp/news/subtop/aiplus/index.rdf'
    ];

    // 追加フィード（時間に余裕があれば取得）
    const secondaryFeeds = [
      'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml',
      'https://developer.nvidia.com/blog/feed',
      'https://aws.amazon.com/blogs/machine-learning/feed/',
      'https://github.blog/feed/',
      'https://syncedreview.com/feed/',
      'https://feeds.ycombinator.com/news.rss',
      'https://www.wired.com/feed/tag/ai/latest/rss',
      'https://www.technologyreview.com/feed/',
      'https://spectrum.ieee.org/rss/fulltext',
      'https://blog.paperspace.com/rss/',
      'https://www.nextplatform.com/feed/',
      'https://www.nature.com/natmachintell.rss',
      'https://blog.tensorflow.org/feeds/posts/default',
      'https://pytorch.org/blog/feed.xml'
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
          // Handle different RSS formats
          if (feedData.rss && feedData.rss.channel && feedData.rss.channel.item) {
            items = Array.isArray(feedData.rss.channel.item) 
              ? feedData.rss.channel.item 
              : [feedData.rss.channel.item];
          } else if (feedData.feed && feedData.feed.entry) {
            // Atom feed format
            items = Array.isArray(feedData.feed.entry) 
              ? feedData.feed.entry 
              : [feedData.feed.entry];
          }

          // Convert RSS items to standard format with better text cleaning
          return items.map(item => ({
            title: cleanText(item.title || 'No title'),
            description: cleanText(item.description || item.summary || item.content || 'No description'),
            url: item.link || item.id || item.guid,
            publishedAt: item.pubDate || item.published || item.updated || new Date().toISOString(),
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
      // Handle different text formats
      if (typeof text === 'object' && text['#text']) {
        text = text['#text'];
      }
      return text.toString()
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

    // Enhanced AI content filtering - prioritize cutting-edge AI news
    const aiArticles = allArticles.filter(article => {
      const content = (article.title + ' ' + (article.description || '')).toLowerCase();
      
      // Exclude low-quality content
      const excludeKeywords = [
        'interview', 'job', 'career', 'hiring', 'resume', 'salary',
        'course', 'tutorial', 'beginner', 'learn', 'guide', 'how to',
        'data science interview', 'python tutorial', 'certification',
        'book review', 'podcast', 'webinar', 'conference registration'
      ];
      
      const hasExcluded = excludeKeywords.some(keyword => content.includes(keyword));
      if (hasExcluded) return false;
      
      // Ultra high-priority AI keywords (2024-2025 trends)
      const ultraHighPriorityKeywords = [
        'agi', 'artificial general intelligence', 'deepseek', 'o1', 'o3',
        'reasoning model', 'claude sonnet', 'gpt-5', 'multi-modal',
        'ai agents', 'autonomous agents', 'ai safety', 'alignment',
        'transformer architecture', 'mixture of experts', 'moe',
        'diffusion model', 'vision-language model', 'multimodal ai'
      ];
      
      const hasUltraHighPriority = ultraHighPriorityKeywords.some(keyword => content.includes(keyword));
      if (hasUltraHighPriority) return true;
      
      // High-priority AI keywords (more specific and newsworthy)
      const highPriorityKeywords = [
        'openai', 'chatgpt', 'gpt-4', 'claude', 'anthropic', 'gemini',
        'artificial intelligence breakthrough', 'ai breakthrough', 'new ai model',
        'llm', 'large language model', 'generative ai', 'ai startup',
        'ai funding', 'ai investment', 'ai acquisition', 'ai partnership',
        'nvidia ai', 'google ai', 'microsoft ai', 'meta ai',
        'dall-e', 'midjourney', 'stable diffusion', 'hugging face',
        'ai regulation', 'langchain', 'vector database', 'embeddings',
        'fine-tuning', 'llama', 'mistral', 'cohere', 'perplexity'
      ];
      
      const hasHighPriority = highPriorityKeywords.some(keyword => content.includes(keyword));
      if (hasHighPriority) return true;
      
      // Standard AI keywords
      const standardKeywords = [
        'artificial intelligence', 'machine learning', 'deep learning',
        'neural network', 'computer vision', 'natural language processing',
        'robotics', 'automation', 'ai', ' ml ', 'nlp', 'reinforcement learning',
        'transformer', 'attention mechanism', 'gpt', 'bert', 'model training'
      ];
      
      return standardKeywords.some(keyword => content.includes(keyword));
    });

    // Remove duplicates and sort by date
    const uniqueArticles = aiArticles
      .filter((article, index, self) => 
        index === self.findIndex(a => a.url === article.url)
      )
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, 50); // Increased limit for more comprehensive coverage

    return response.status(200).json({
      status: 'ok',
      totalResults: uniqueArticles.length,
      articles: uniqueArticles
    });

  } catch (error) {
    console.error('RSS aggregator error:', error);
    
    // Enhanced fallback demo data if RSS fails
    const demoArticles = [
      {
        title: "DeepSeek R1 Challenges OpenAI with $6M Development Cost",
        description: "Chinese AI startup DeepSeek has released R1, a reasoning model that rivals OpenAI's o1 while costing only $6 million to develop, sparking discussions about AI development efficiency.",
        url: "https://deepseek.com/r1-model-release",
        publishedAt: new Date().toISOString(),
        source: { name: "DeepSeek" },
        urlToImage: null
      },
      {
        title: "OpenAI Launches Operator AI Agent for Autonomous Tasks",
        description: "OpenAI has unveiled Operator, an AI agent capable of performing autonomous tasks on computers, marking a significant step toward artificial general intelligence.",
        url: "https://openai.com/blog/operator-ai-agent",
        publishedAt: new Date(Date.now() - 3600000).toISOString(),
        source: { name: "OpenAI" },
        urlToImage: null
      },
      {
        title: "Meta Invests $65 Billion in AI Infrastructure for 2025",
        description: "Meta CEO Mark Zuckerberg announces the company's largest-ever AI investment, including the construction of a massive data center in Louisiana.",
        url: "https://about.fb.com/news/2025/ai-investment",
        publishedAt: new Date(Date.now() - 7200000).toISOString(),
        source: { name: "Meta" },
        urlToImage: null
      },
      {
        title: "Google Introduces AI Ultra Subscription Service",
        description: "Google launches its premium AI subscription service, offering unlimited access to its most advanced AI models for creators and developers.",
        url: "https://blog.google/technology/ai/google-ai-ultra-2025",
        publishedAt: new Date(Date.now() - 10800000).toISOString(),
        source: { name: "Google" },
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