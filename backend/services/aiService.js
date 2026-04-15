const { GoogleGenerativeAI } = require('@google/generative-ai');

// ---------- Initialise the Gemini client ----------
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// =============================================================================
// Helper — Strip markdown code fences from Gemini output before JSON.parse
// =============================================================================
const cleanJsonResponse = (text) => {
    return text
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();
};

// =============================================================================
// RESUME FEATURES
// =============================================================================

// -----------------------------------------------------------------------------
// generateDramaticResume(resumeText)
// -----------------------------------------------------------------------------
const generateDramaticResume = async (resumeText) => {
    const prompt = `
Rewrite the following resume text to make it sound like an ancient epic legend 
or a superhero origin story. Keep the facts (skills, names, dates, companies) 
but drastically exaggerate the tone. Use dramatic language, metaphors, and 
heroic phrasing. Return only the text, no markdown formatting.

--- RESUME TEXT START ---
${resumeText}
--- RESUME TEXT END ---
    `.trim();

    const result = await model.generateContent(prompt);
    return result.response.text();
};

// -----------------------------------------------------------------------------
// generateInterviewQuestion(role)
// -----------------------------------------------------------------------------
const generateInterviewQuestion = async (role) => {
    const prompt = `
Act as a strict and professional technical interviewer for a ${role} position.
Generate a single, challenging behavioral or technical interview question suitable for this role.
Do not provide the answer, just the question.
    `.trim();

    const result = await model.generateContent(prompt);
    return result.response.text();
};

// -----------------------------------------------------------------------------
// evaluateAnswer(question, answer)
// -----------------------------------------------------------------------------
const evaluateAnswer = async (question, answer) => {
    const prompt = `
You are a technical interviewer. 
Question: "${question}"
Candidate's Answer: "${answer}"

Evaluate the answer. Provide a JSON response with the following structure:
{
    "score": (number between 0-100),
    "feedback": (string, constructive feedback),
    "followUp": (string, a follow-up question)
}
Return only the JSON string, no markdown formatting.
    `.trim();

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Clean up potential markdown code blocks if Gemini mimics them
    const jsonStr = cleanJsonResponse(text);
    return JSON.parse(jsonStr);
};

// =============================================================================
// INTERVIEW SESSION FEATURES
// =============================================================================

// -----------------------------------------------------------------------------
// generateQuestions(role) — Generate 5-7 interview questions for a role
// -----------------------------------------------------------------------------
const generateQuestions = async (role) => {
    const prompt = `
Generate 5 interview questions for a ${role} position.
Include a mix of technical, behavioral, and situational questions appropriate for this role.
Return ONLY a raw JSON array of strings. No markdown formatting, no explanation.
Example format: ["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]
    `.trim();

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonStr = cleanJsonResponse(text);
    const questions = JSON.parse(jsonStr);

    // Safety: ensure we got an array of strings
    if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('Gemini returned an invalid questions format');
    }

    return questions;
};

// -----------------------------------------------------------------------------
// evaluateSession(conversationHistory) — Evaluate a full interview transcript
// -----------------------------------------------------------------------------
const evaluateSession = async (conversationHistory) => {
    const transcript = conversationHistory
        .map((entry, i) => `Q${i + 1}: ${entry.question}\nA${i + 1}: ${entry.userAnswer}`)
        .join('\n\n');

    const prompt = `
Act as a strict and experienced interviewer. Evaluate the following interview transcript.

--- TRANSCRIPT START ---
${transcript}
--- TRANSCRIPT END ---

Return a JSON object with EXACTLY this structure:
{
  "score": <number between 0 and 100>,
  "feedback": "<general summary of the candidate's performance>",
  "detailedAnalysis": [
    {
      "question": "<the question text>",
      "critique": "<what was wrong or missing in the answer>",
      "improvement": "<how the candidate could have answered better>"
    }
  ]
}

The "detailedAnalysis" array must have one entry for each question in the transcript.
Return ONLY the raw JSON object. No markdown formatting, no extra text.
    `.trim();

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonStr = cleanJsonResponse(text);
    const evaluation = JSON.parse(jsonStr);

    // Safety: validate essential fields exist
    if (typeof evaluation.score !== 'number' || !evaluation.feedback || !Array.isArray(evaluation.detailedAnalysis)) {
        throw new Error('Gemini returned an invalid evaluation format');
    }

    return evaluation;
};

// -----------------------------------------------------------------------------
// generateCareerProphecy(resumeText)
// -----------------------------------------------------------------------------
const generateCareerProphecy = async (resumeText) => {
    const prompt = `
You are a mystical Career Oracle. 
Read the following resume text and give a cryptic but inspiring prophecy about this person's future career path.
Keep it under 2 sentences. Use mystical, slightly archaic language but remain practical in advice.

--- RESUME START ---
${resumeText}
--- RESUME END ---
    `.trim();

    const result = await model.generateContent(prompt);
    return result.response.text();
};

// -----------------------------------------------------------------------------
// generateDoomScope(userTitle)
// -----------------------------------------------------------------------------
const generateDoomScope = async (userTitle) => {
    const prompt = `
You are a dark, sarcastic Career Oracle for the year 2026. 
User's current title/role: ${userTitle || 'Struggling Student'}

Generate a short, brutally honest, and slightly mystical "Daily Doom-Scope" (like a horoscope but for career/jobs).
Use dark humor, mention current market "doom", and provide a "Lucky Skill" and a "Cursed Company Type".
Format the response as a valid JSON object:
{
  "prophecy": "Your direct prophecy...",
  "luckySkill": "Skill name",
  "cursedCompany": "Description of company to avoid"
}
Return only the JSON string, no markdown.
    `.trim();

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const jsonStr = cleanJsonResponse(text);
    return JSON.parse(jsonStr);
};

// -----------------------------------------------------------------------------
// generateRoast(tier, applicationData)
// -----------------------------------------------------------------------------
const generateRoast = async (tier, applicationData) => {
//     const roastLevels = {
//         1: "Gentle sarcasm, like a disappointment but not a surprise. Use dry humor.",
//         2: "Sharp and ironic. They were shortlisted then rejected? Ouch. Twist the knife on their hopes.",
//         3: "Legendary tough love. Absolute destruction. This user has failed 3+ times. Be brutal."
//     };

//     const prompt = `
// You are the CareerQuest Roast-Bot 5000. 
// User just got rejected for the bounty: "${applicationData.title}"
// Roast Level: ${roastLevels[tier] || "Savage"}

// Generate a quick, hilarious, and brutally honest roast about their rejection. 
// Mention the role they failed to get.
// Be creative with insults but keep it about their career "failures".
// Return ONLY the text of the roast.
//     `.trim();

//     const result = await model.generateContent(prompt);
//     return result.response.text();
    return `Oh, you got rejected from the "${applicationData.title}" role? I'm shocked. Truly. With a resume that looks like it was written in crayon, I thought they'd make you the CEO instantly. Put the keyboard down and go touch some grass.`;
};

module.exports = {
    generateDramaticResume,
    generateInterviewQuestion,
    evaluateAnswer,
    generateQuestions,
    evaluateSession,
    generateCareerProphecy,
    generateDoomScope,
    generateRoast,
};