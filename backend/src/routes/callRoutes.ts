
import express from 'express';
import { makeEmergencyCall } from '../services/twilioService';

const router = express.Router();

router.post('/emergency', async (req, res) => {
    try {
        const { to, name } = req.body;

        if (!to) {
            return res.status(400).json({ error: "Recipient phone number 'to' is required" });
        }

        const callSid = await makeEmergencyCall(to, name || 'Unknown User');
        res.json({ success: true, message: "Emergency call initiated", callSid });
    } catch (error: any) {
        console.error("Emergency call error:", error);
        res.status(500).json({ success: false, error: error.message || "Failed to initiate call" });
    }
});

export default router;
