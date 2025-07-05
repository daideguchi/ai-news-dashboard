// Vercel Edge Function for fetching full article content
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
    const { url } = request.body;
    
    if (!url) {
      return response.status(400).json({ error: 'URL parameter is required' });
    }

    // Fetch the full article
    try {
      const articleResponse = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });

      if (!articleResponse.ok) {
        throw new Error(`HTTP ${articleResponse.status}`);
      }

      const html = await articleResponse.text();
      
      // Simple text extraction from HTML
      // Remove scripts, styles, and other non-content elements
      let content = html
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
        .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
        .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
        .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
        .replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
        .replace(/<[^>]+>/g, ' ') // Remove all HTML tags
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim();

      // Extract main content (usually the longest paragraphs)
      const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 50);
      const mainContent = sentences.slice(0, 20).join('. '); // Take first 20 substantial sentences

      // If content is too short, try to extract more
      if (mainContent.length < 300) {
        const words = content.split(' ').filter(w => w.length > 2);
        const extractedContent = words.slice(0, 500).join(' '); // Take first 500 words
        
        return response.status(200).json({
          success: true,
          content: extractedContent.length > 300 ? extractedContent : content.substring(0, 1000),
          method: 'basic-extraction'
        });
      }

      return response.status(200).json({
        success: true,
        content: mainContent,
        method: 'sentence-extraction'
      });

    } catch (fetchError) {
      console.warn('Article fetch failed:', fetchError.message);
      
      // Fallback: return error but allow summarization of description
      return response.status(200).json({
        success: false,
        content: null,
        error: 'Could not fetch article content',
        method: 'fetch-failed'
      });
    }

  } catch (error) {
    console.error('Article fetch API error:', error);
    return response.status(500).json({ 
      success: false,
      error: 'Article fetch failed',
      content: null
    });
  }
}