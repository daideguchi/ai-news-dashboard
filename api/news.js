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
    // RSS Feed sources for AI news
    const rssFeeds = [
      'https://techcrunch.com/category/artificial-intelligence/feed/',
      'https://venturebeat.com/ai/feed/',
      'https://www.theverge.com/ai-artificial-intelligence/rss/index.xml',
      'https://feeds.ycombinator.com/news.rss',
      'https://rss.cnn.com/rss/edition.rss'
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

    // Filter for AI-related content
    const aiArticles = allArticles.filter(article => {
      const content = (article.title + ' ' + (article.description || '')).toLowerCase();
      return content.includes('ai') || 
             content.includes('artificial intelligence') || 
             content.includes('machine learning') ||
             content.includes('neural network') ||
             content.includes('deep learning') ||
             content.includes('openai') ||
             content.includes('chatgpt') ||
             content.includes('claude') ||
             content.includes('llm') ||
             content.includes('gpt') ||
             content.includes('generative') ||
             content.includes('algorithm');
    });

    // Remove duplicates and sort by date
    const uniqueArticles = aiArticles
      .filter((article, index, self) => 
        index === self.findIndex(a => a.url === article.url)
      )
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, 25);

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