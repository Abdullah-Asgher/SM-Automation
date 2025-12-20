import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyAFd4XiNEaSipNQZihHdFKpSJVwb39Qhz8');

async function testGemini() {
    try {
        console.log('Testing Gemini API...');
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const result = await model.generateContent('Say hello in one sentence.');
        const response = await result.response;
        const text = response.text();

        console.log('SUCCESS! Gemini API works!');
        console.log('Response:', text);

        return text;
    } catch (error) {
        console.error('FAIL! Gemini API error:');
        console.error('Error message:', error.message);
        console.error('Error details:', error);
        throw error;
    }
}

testGemini()
    .then(result => {
        console.log('\\nTest completed successfully!');
        process.exit(0);
    })
    .catch(error => {
        console.log('\\nTest failed!');
        process.exit(1);
    });
