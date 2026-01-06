import express from 'express';

const router = express.Router();

// Webhook verification token (set this in .env)
const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'shortsync_webhook_2024';

// GET endpoint for webhook verification
router.get('/facebook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    console.log('Webhook verification request:', { mode, token });

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        console.log('Webhook verified successfully!');
        res.status(200).send(challenge);
    } else {
        console.error('Webhook verification failed!');
        res.sendStatus(403);
    }
});

// POST endpoint to receive webhook events
router.post('/facebook', (req, res) => {
    const body = req.body;

    console.log('Webhook event received:', JSON.stringify(body, null, 2));

    // Check if this is a page subscription
    if (body.object === 'page') {
        // Iterate over each entry
        body.entry.forEach((entry) => {
            // Get the webhook event
            const webhookEvent = entry.messaging ? entry.messaging[0] : entry.changes[0];

            console.log('Webhook event details:', webhookEvent);

            // Handle the event (you can expand this later)
            // For now, just log it
        });

        res.status(200).send('EVENT_RECEIVED');
    } else if (body.object === 'instagram') {
        // Handle Instagram webhooks
        body.entry.forEach((entry) => {
            console.log('Instagram webhook:', entry);
        });

        res.status(200).send('EVENT_RECEIVED');
    } else {
        res.sendStatus(404);
    }
});

export default router;
