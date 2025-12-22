import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

const APP_ID = process.env.FACEBOOK_APP_ID;
const APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const SHORT_TOKEN = process.env.FACEBOOK_ACCESS_TOKEN;

async function extendToken() {
    console.log('🔄 Extending Facebook Access Token...\n');

    if (!APP_ID || !APP_SECRET) {
        console.error('❌ Missing FACEBOOK_APP_ID or FACEBOOK_APP_SECRET in .env');
        return;
    }

    if (!SHORT_TOKEN) {
        console.error('❌ Missing FACEBOOK_ACCESS_TOKEN in .env');
        return;
    }

    try {
        // Exchange short-lived token for long-lived token
        const response = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
            params: {
                grant_type: 'fb_exchange_token',
                client_id: APP_ID,
                client_secret: APP_SECRET,
                fb_exchange_token: SHORT_TOKEN,
            },
        });

        const longLivedToken = response.data.access_token;
        const expiresIn = response.data.expires_in;

        console.log('✅ Long-lived token generated!');
        console.log(`   Expires in: ${expiresIn} seconds (${Math.floor(expiresIn / 86400)} days)`);
        console.log(`   Token: ${longLivedToken.substring(0, 50)}...`);

        // Update .env file
        const envPath = '.env';
        let envContent = fs.readFileSync(envPath, 'utf8');

        if (envContent.includes('FACEBOOK_ACCESS_TOKEN=')) {
            envContent = envContent.replace(
                /FACEBOOK_ACCESS_TOKEN=.*/,
                `FACEBOOK_ACCESS_TOKEN=${longLivedToken}`
            );
        } else {
            envContent += `\nFACEBOOK_ACCESS_TOKEN=${longLivedToken}\n`;
        }

        fs.writeFileSync(envPath, envContent);

        console.log('\n✅ Updated .env file with long-lived token!');
        console.log('   Restart the backend server to use the new token.');

    } catch (error) {
        console.error('\n❌ Failed to extend token');
        console.error('Error:', error.response?.data?.error?.message || error.message);

        if (error.response?.data?.error?.code === 190) {
            console.log('\n💡 Your current token may already be expired.');
            console.log('   Get a fresh token from: https://developers.facebook.com/tools/explorer/');
        }
    }
}

extendToken();
