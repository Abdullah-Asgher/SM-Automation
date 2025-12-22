import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

async function showTargetPage() {
    console.log('📋 Checking which Facebook page will receive uploads...\n');

    try {
        const response = await axios.get('https://graph.facebook.com/v18.0/me/accounts', {
            params: {
                access_token: accessToken,
            },
        });

        const pages = response.data.data;

        if (pages.length === 0) {
            console.log('❌ No pages found!');
            return;
        }

        console.log(`Found ${pages.length} page(s) total:\n`);

        pages.forEach((page, index) => {
            if (index === 0) {
                console.log('✅✅✅ THIS PAGE WILL RECEIVE UPLOADS ✅✅✅');
                console.log(`   📌 Name: ${page.name}`);
                console.log(`   📌 ID: ${page.id}`);
                console.log(`   📌 Category: ${page.category || 'N/A'}`);
                console.log('✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅✅\n');
            } else {
                console.log(`   ${index + 1}. ${page.name} (will NOT receive uploads)`);
            }
        });

        console.log('\n⚠️  IMPORTANT:');
        console.log('Videos will ONLY upload to the first page listed above.');
        console.log('If this is NOT the correct page, let me know and I\'ll help you configure it.');

    } catch (error) {
        console.error('❌ Error:', error.response?.data?.error?.message || error.message);
    }
}

showTargetPage();
