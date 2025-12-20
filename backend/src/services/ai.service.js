import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Generate multiple description variations optimized for different platforms
export async function generateDescriptions(originalDescription, platforms = ['youtube', 'tiktok', 'instagram', 'facebook']) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `Given this video description: "${originalDescription}"

Generate 4 platform-optimized variations for social media posts. Each variation should maintain the core message but adapt tone, style, and format for the specific platform:

1. TikTok: Casual, trendy, use relevant emojis heavily
2. YouTube Shorts: SEO-friendly, informative, keyword-rich
3. Instagram Reels: Engaging storytelling style, include hashtags
4. Facebook: Conversational tone, friendly and approachable

Format your response as a JSON array of objects with 'platform' and 'description' fields. Return ONLY the JSON array.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const content = response.text();

        console.log('Gemini API Response:', content);

        // Try to parse JSON from response
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            const descriptions = JSON.parse(jsonMatch[0]);
            return descriptions;
        }

        // Fallback: return a structured response
        return [
            { platform: 'tiktok', description: content },
            { platform: 'youtube', description: originalDescription },
            { platform: 'instagram', description: content },
            { platform: 'facebook', description: originalDescription },
        ];
    } catch (error) {
        console.error('Error generating descriptions:', error.message);
        console.error('Full error:', JSON.stringify(error, null, 2));
        throw new Error(`Failed to generate AI descriptions: ${error.message}`);
    }
}

// Generate hashtags for a platform
export async function generateHashtags(content, platform) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `Generate 15-20 relevant, trending hashtags for this ${platform} post: "${content}". Return only hashtags separated by spaces, no numbering.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const hashtags = text
            .split(/\s+/)
            .filter(tag => tag.startsWith('#'));

        return hashtags;
    } catch (error) {
        console.error('Error generating hashtags:', error);
        return [];
    }
}
