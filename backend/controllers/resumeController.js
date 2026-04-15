const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const { generateDramaticResume, generateCareerProphecy } = require('../services/aiService');

// POST /api/resume/dramatize
const dramatizeResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: 'No file uploaded. Please attach a PDF resume.',
                hint: 'Use form field name "resume" in your multipart request.',
            });
        }

        const filePath = req.file.path; 
        const pdfBuffer = fs.readFileSync(filePath);

        // Extract text from PDF
        const { PDFParse } = require('pdf-parse');
        const parser = new PDFParse({ data: pdfBuffer });
        const pdfData = await parser.getText();
        const resumeText = pdfData.text;
        if (parser.destroy) await parser.destroy();


        if (!resumeText || resumeText.trim().length === 0) {
            return res.status(400).json({
                error: 'Could not extract text from the PDF. It may be image-based or empty.',
            });
        }

        //  Send to Gemini AI
        let dramaticText;
        try {
            dramaticText = await generateDramaticResume(resumeText);
        } catch (aiError) {
            console.error('Gemini AI error:', aiError.message);
            return res.status(500).json({
                error: 'AI transformation failed',
                detail: aiError.message,
            });
        }

        // Step 5: Save to User document
        // Store a relative path (portable across environments) instead of
        // the absolute path that multer gives us.
        const relativePath = path.relative(
            path.join(__dirname, '..'),
            filePath
        );

        await User.findByIdAndUpdate(
            req.user._id,
            {
                originalResumePath: relativePath,
                dramaticResume: dramaticText,
            },
            { new: true } 
        ).select('-password');

        //Step 6: Respond
        res.json({
            message: 'Resume dramatized successfully!',
            originalFile: relativePath,
            dramaticResume: dramaticText,
            extractedLength: resumeText.length,
        });
    } catch (err) {
        console.error('dramatizeResume error:', err.message);
        res.status(500).json({ error: 'Server error during resume processing' });
    }
};


// GET /api/resume/view

const viewResume = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select(
            'dramaticResume originalResumePath'
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.dramaticResume) {
            return res.status(404).json({
                error: 'No dramatic resume found. Upload and dramatize one first.',
            });
        }

        res.json({
            dramaticResume: user.dramaticResume,
            originalFile: user.originalResumePath,
        });
    } catch (err) {
        console.error('viewResume error:', err.message);
        res.status(500).json({ error: 'Server error while fetching resume' });
    }
};

const prophecyResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No resume provided.' });
        }

        const pdfBuffer = fs.readFileSync(req.file.path);
        const { PDFParse } = require('pdf-parse');
        const parser = new PDFParse({ data: pdfBuffer });
        const pdfData = await parser.getText();
        const resumeText = pdfData.text;
        if (parser.destroy) await parser.destroy();


        if (!resumeText || resumeText.trim().length === 0) {
            return res.status(400).json({ error: 'Could not extract text from PDF.' });
        }

        const prophecy = await generateCareerProphecy(resumeText);

        // Clean up uploads
        // fs.unlinkSync(req.file.path);

        res.json({
            success: true,
            prophecy: prophecy.trim()
        });
    } catch (err) {
        console.error('prophecyResume error:', err.message);
        res.status(500).json({ error: 'Oracle unavailable.' });
    }
};

module.exports = { dramatizeResume, viewResume, prophecyResume };