import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import axios from 'axios';
import FormData from 'form-data';
import CryLog from '../models/CryLog';

const router = Router();

// Configure Multer for temp file storage
const upload = multer({
    dest: path.join(__dirname, '../../uploads'),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Analyze Cry Endpoint (Microservice)
router.post(
    '/analyze',
    upload.single('audio'),
    async (req: Request, res: Response) => {
        try {
            if (!req.file) {
                res.status(400).json({ error: 'No audio file uploaded' });
                return;
            }

            const filePath = req.file.path;

            try {
                // Prepare FormData for Microservice
                const formData = new FormData();
                formData.append('file', fs.createReadStream(filePath));

                // Call Microservice
                const serviceUrl = process.env.CRY_ANALYSIS_SERVICE_URL || 'http://localhost:8000';
                const response = await axios.post(`${serviceUrl}/analyze`, formData, {
                    headers: {
                        ...formData.getHeaders()
                    },
                    timeout: 25000 // 25s timeout for ML processing
                });

                const { pattern, confidence } = response.data;

                // Add User-Friendly Messages (Logic maintained in Backend)
                let message = "Cry pattern is mixed. Please observe feeding, sleep, and comfort.";

                if (pattern === "Hunger-related") {
                    message = "This sound may be associated with hunger. You may try checking if baby needs feeding.";
                } else if (pattern === "Sleep-related") {
                    message = "This sound may be associated with tiredness. You may try soothing the baby for sleep.";
                } else if (pattern === "Discomfort-related") {
                    message = "This sound may be associated with discomfort (gas, burping). You may try burping or changing position.";
                }

                // Persist the cry log if userId is available
                const userId = (req as any).user?.uid;
                if (userId) {
                    try {
                        const newLog = new CryLog({
                            userId,
                            pattern,
                            confidence: confidence || 0,
                            timestamp: new Date()
                        });
                        await newLog.save();
                    } catch (logError) {
                        console.error("Failed to save cry log:", logError);
                    }
                }

                res.json({
                    pattern,
                    confidence,
                    message
                });

            } catch (serviceError) {
                console.error("Cry Analysis Service Error:", serviceError);
                res.status(503).json({
                    pattern: "Unavailable",
                    message: "Cry analysis service is currently unavailable. Please try again later."
                });
            } finally {
                // Delete file immediately
                fs.unlink(filePath, (err) => {
                    if (err) console.error('Error deleting temp file:', err);
                });
            }

        } catch (error) {
            console.error('Error in cry analysis route:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
);

export default router;
