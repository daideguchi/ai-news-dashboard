// Vercel Edge Function for News API Proxy
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
    const { query, domains } = request.query;
    
    if (!query) {
      return response.status(400).json({ error: 'Query parameter is required' });
    }

    // NewsAPIキーを環境変数から取得
    const apiKey = process.env.NEWS_API_KEY;
    if (!apiKey) {
      return response.status(500).json({ error: 'News API key not configured' });
    }

    const newsApiUrl = `https://newsapi.org/v2/everything?` +
      `q=${encodeURIComponent(query)}&` +
      `domains=${domains || 'techcrunch.com,venturebeat.com,theverge.com'}&` +
      `sortBy=publishedAt&` +
      `pageSize=10&` +
      `language=en&` +
      `apiKey=${apiKey}`;

    const newsResponse = await fetch(newsApiUrl);
    
    if (!newsResponse.ok) {
      throw new Error(`News API error: ${newsResponse.status}`);
    }

    const data = await newsResponse.json();
    
    // AI関連記事をフィルタリング
    const aiArticles = data.articles.filter(article => {
      const content = (article.title + ' ' + (article.description || '')).toLowerCase();
      return content.includes('ai') || 
             content.includes('artificial intelligence') || 
             content.includes('machine learning') ||
             content.includes('neural network') ||
             content.includes('deep learning') ||
             content.includes('openai') ||
             content.includes('chatgpt') ||
             content.includes('llm');
    });

    return response.status(200).json({
      status: 'ok',
      totalResults: aiArticles.length,
      articles: aiArticles
    });

  } catch (error) {
    console.error('News API proxy error:', error);
    return response.status(500).json({ 
      error: 'Failed to fetch news',
      message: error.message 
    });
  }
}