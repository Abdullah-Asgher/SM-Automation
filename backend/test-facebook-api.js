import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const FACEBOOK_GRAPH_URL = 'https://graph.facebook.com/v18.0';
const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

async function testFacebookAPI() {
    console.log('🧪 Testing Facebook/Instagram API...\n');

    if (!accessToken) {
        console.error('❌ FACEBOOK_ACCESS_TOKEN not found in .env');
        return;
    }

    try {
        // Test 1: Get user info
        console.log('1️⃣ Testing access token validity...');
        const userResponse = await axios.get(`${FACEBOOK_GRAPH_URL}/me`, {
            params: {
                fields: 'id,name',
                access_token: accessToken,
            },
        });
        console.log('✅ Access token valid!');
        console.log('   User:', userResponse.data.name);
        console.log('   ID:', userResponse.data.id);

        // Test 2: Get Facebook Pages
        console.log('\n2️⃣ Fetching Facebook Pages...');
        const pagesResponse = await axios.get(`${FACEBOOK_GRAPH_URL}/me/accounts`, {
            params: {
                access_token: accessToken,
            },
        });

        if (pagesResponse.data.data && pagesResponse.data.data.length > 0) {
            console.log(`✅ Found ${pagesResponse.data.data.length} page(s):`);
            pagesResponse.data.data.forEach((page, idx) => {
                console.log(`   ${idx + 1}. ${page.name} (ID: ${page.id})`);
            });
        } else {
            console.log('⚠️  No Facebook Pages found!');
            console.log('   You need a Facebook Page to post videos.');
        }

        // Test 3: Check Instagram account
        console.log('\n3️⃣ Testing Instagram connection...');
        try {
            const igResponse = await axios.get(`https://graph.instagram.com/me`, {
                params: {
                    fields: 'id,username',
                    access_token: accessToken,
                },
            });
            console.log('✅ Instagram account found!');
            console.log('   Username:', igResponse.data.username);
            console.log('   ID:', igResponse.data.id);
        } catch (igError) {
            console.log('❌ Instagram not accessible with this token');
            console.log('   Error:', igError.response?.data?.error?.message || igError.message);
        }

    } catch (error) {
        console.error('\n❌ API Test Failed!');
        console.error('Error:', error.response?.data?.error?.message || error.message);
        if (error.response?.data) {
            console.error('Details:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testFacebookAPI();
