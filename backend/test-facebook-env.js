// Quick test to verify environment variables are loaded correctly
console.log('=== Facebook Environment Variables ===');
console.log('FACEBOOK_APP_ID:', process.env.FACEBOOK_APP_ID);
console.log('FACEBOOK_APP_SECRET:', process.env.FACEBOOK_APP_SECRET ? '****' + process.env.FACEBOOK_APP_SECRET.slice(-4) : 'NOT SET');
console.log('FACEBOOK_REDIRECT_URI:', process.env.FACEBOOK_REDIRECT_URI);
console.log('=====================================');
