const express = require('express');
const router = express.Router();
const { generateInterviewQuestion, evaluateAnswer } = require('../services/aiService');
const { protect } = require('../middleware/auth'); // Ensure user is logged in
const { PDFParse } = require('pdf-parse');
const { uploadResume } = require('../middleware/fileUpload');
const fs = require('fs');

// POST /api/gemini/question - Generate a new question
router.post('/question', protect, async (req, res) => {
    try {
        const { role } = req.body;
        // Default to 'Software Engineer' if no role provided or if user role is vague
        const targetRole = role || req.user.title || 'Software Engineer';

        const question = await generateInterviewQuestion(targetRole);
        res.json({ question });
    } catch (err) {
        console.error("Gemini Error:", err);
        res.status(500).json({ error: "Failed to generate question" });
    }
});

// POST /api/gemini/evaluate - Evaluate an answer
router.post('/evaluate', protect, async (req, res) => {
    try {
        const { question, answer } = req.body;
        if (!question || !answer) {
            return res.status(400).json({ error: "Question and answer are required" });
        }

        const evaluation = await evaluateAnswer(question, answer);
        res.json(evaluation);
    } catch (err) {
        console.error("Gemini Error:", err);
        res.status(500).json({ error: "Failed to evaluate answer" });
    }
});

// POST /api/gemini/parse-resume - Parse uploaded resume
router.post('/parse-resume', protect, uploadResume, async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const dataBuffer = fs.readFileSync(req.file.path);
        const { PDFParse } = require('pdf-parse');
        const parser = new PDFParse({ data: dataBuffer });
        const data = await parser.getText();
        if (parser.destroy) await parser.destroy();


        // Could integrate with Gemini here to structure the parsed text better
        // For now, return the raw text or basic metrics
        res.json({
            text: data.text,
            pageCount: data.numpages,
            info: data.info
        });

    } catch (err) {
        console.error("Parse Error:", err);
        res.status(500).json({ error: "Failed to parse resume" });
    }
});

module.exports = router;