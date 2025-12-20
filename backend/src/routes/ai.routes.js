import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { generateDescriptions } from '../services/ai.service.js';

const router = Router();

// Generate AI descriptions
router.post('/generate-descriptions', authenticate, async (req, res, next) => {
    try {
        const { originalDescription, platforms } = req.body;

        if (!originalDescription) {
            return res.status(400).json({ error: 'Original description is required' });
        }

        const descriptions = await generateDescriptions(originalDescription, platforms);

        res.json(descriptions);
    } catch (error) {
        next(error);
    }
});

export default router;
