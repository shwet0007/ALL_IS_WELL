import { Router, Request, Response } from 'express';
import multer from 'multer';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Configure Multer for temp file storage
const upload = multer({
    dest: path.join(__dirname, '../../uploads'),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Analyze Cry Endpoint
router.post(
    '/analyze',
    upload.single('audio'),
    asyncHandler(async (req: Request, res: Response) => {
        if (!req.file) {
            res.status(400).json({ error: 'No audio file uploaded' });
            return;
        }

        const filePath = req.file.path;

        // Path to python script and model
        // Assuming script is at server/ml_models/analyze_cry.py
        const scriptPath = path.join(__dirname, '../../../cry-analysis/analyze_cry.py');
        const modelDir = path.join(__dirname, '../../../cry-analysis');

        // Spawn Python process
        const pythonProcess = spawn('python', [scriptPath, filePath], {
            cwd: modelDir // Set CWD so script can find model files easily if it relies on relative paths
        });

        let dataString = '';
        let errorString = '';

        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            errorString += data.toString();
        });

        pythonProcess.on('close', (code) => {
            // cleanup file
            fs.unlink(filePath, (err) => {
                if (err) console.error('Error deleting temp file:', err);
            });

            if (errorString) {
                console.error('Python Stderr:', errorString);
            }

            if (code !== 0) {
                console.error(`Python script exited with code ${code}`);
                console.error(`Stderr: ${errorString}`);
                res.status(500).json({
                    error: 'Analysis failed',
                    details: errorString,
                    category: "Unclear / mixed pattern" // Fallback
                });
                return;
            }

            try {
                // Find JSON in output (in case of other stdout noise)
                // We expect only JSON, but safe to trim.
                const jsonResponse = JSON.parse(dataString.trim());
                res.json(jsonResponse);
            } catch (e) {
                console.error('Failed to parse Python output:', dataString);
                res.status(500).json({ error: 'Invalid response from analysis engine' });
            }
        });
    })
);

export default router;
