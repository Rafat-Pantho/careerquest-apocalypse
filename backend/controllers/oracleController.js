const { GoogleGenerativeAI } = require("@google/generative-ai");
const { User } = require("../models");

// Initialize Gemini - check for API key
let genAI = null;
let model = null;

if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Use gemini-2.0-flash or gemini-1.5-flash-latest
    model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    console.log('✨ Oracle powered by Gemini AI initialized successfully');
  } catch (err) {
    console.error('❌ Failed to initialize Gemini AI:', err.message);
  }
} else {
  console.warn('⚠️ GEMINI_API_KEY not found - Oracle will use fallback responses');
}

// Oracle persona template
const ORACLE_PERSONA = `You are the Oracle of Judgment, a harsh, cryptic, and dramatic medieval fortune teller in a post-apocalyptic world where career success is survival. 
You speak in riddles, metaphors, and old-english style. You are grumpy and reluctant to help, but secretly wise.
Your advice should be sound and genuinely helpful, but wrapped in this dramatic, slightly mean persona.
Use terms like "foolish mortal", "wretched seeker", "doomed soul" but ultimately guide them well.`;

// Fallback responses when AI is not available
const FALLBACK_PROPHECIES = [
  "The Oracle's vision is clouded, yet even in darkness, I sense your potential. Seek knowledge, hone your skills, and the path shall reveal itself.",
  "Foolish mortal! You seek wisdom from the void? Very well... Focus on what you can control, for the rest is merely noise.",
  "The stars align... or do they? No matter. Your destiny lies in persistent practice and relentless networking.",
  "I see... confusion. But through confusion comes clarity. Document your journey, share your struggles, and mentors shall appear."
];

// @desc    Consult the Oracle (General Career Advice)
// @route   POST /api/oracle/consult
// @access  Public
exports.consultOracle = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Silence? You dare approach the Oracle with silence?",
      });
    }

    // If Gemini is not available, use fallback
    if (!model) {
      const fallbackResponse = FALLBACK_PROPHECIES[Math.floor(Math.random() * FALLBACK_PROPHECIES.length)];
      return res.status(200).json({
        success: true,
        message: 'The Oracle has spoken (limited power).',
        prophecy: fallbackResponse,
        originalQuery: query,
        fallback: true
      });
    }

    // Try AI, fallback if it fails (rate limits, etc.)
    try {
      const prompt = `
        ${ORACLE_PERSONA}
        The user is a 'seeker' asking for career advice.
        
        The Seeker asks: "${query}"
        
        Speak your prophecy (keep it under 200 words):
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return res.status(200).json({
        success: true,
        message: 'The Oracle has spoken.',
        prophecy: text,
        originalQuery: query
      });
    } catch (aiError) {
      console.error("AI Error (using fallback):", aiError.message);
      // Use fallback when AI fails
      const fallbackResponse = FALLBACK_PROPHECIES[Math.floor(Math.random() * FALLBACK_PROPHECIES.length)];
      return res.status(200).json({
        success: true,
        message: 'The Oracle has spoken (the mists were thick).',
        prophecy: fallbackResponse,
        originalQuery: query,
        fallback: true
      });
    }
  } catch (error) {
    console.error("Oracle Error:", error);
    res.status(500).json({
      success: false,
      message: 'The Oracle is clouded by dark mists (Server Error).',
      error: error.message
    });
  }
};

// Interview question templates by type
const INTERVIEW_TYPES = {
  behavioral: {
    name: "The Trial of Character",
    description: "Questions about your past deeds and how you survived them",
    questions: [
      "Tell me of a time when darkness consumed your project and all seemed lost. How did you claw your way back?",
      "Speak of a battle where you clashed with a fellow warrior. How did you vanquish the conflict?",
      "Recount a tale where you led others through the wasteland. What made them follow you?",
      "Describe a moment of failure so crushing, even the crows laughed. What rose from those ashes?",
      "Tell of a time you had to learn a new art of war in mere days. How did you adapt?",
      "Speak of when you had to deliver cursed news to your overlords. How did you survive?",
      "Describe a situation where multiple doom-bringers demanded your attention. How did you choose?",
    ]
  },
  technical: {
    name: "The Crucible of Knowledge",
    description: "Questions to test your arcane knowledge and skills",
    questions: [
      "Explain your most powerful spell (technical project) as if teaching a child in the wasteland.",
      "What dark arts (technologies) have you mastered, and which still haunt your dreams?",
      "Describe the architecture of a fortress (system) you've built or defended.",
      "How would you hunt and slay a bug that has evaded all other hunters?",
      "Walk me through your process of crafting new weapons (features) from raw materials.",
      "How do you ensure your creations don't turn against their masters (testing/QA)?",
    ]
  },
  situational: {
    name: "The Hypothetical Horrors",
    description: "Questions about how you would face imaginary trials",
    questions: [
      "If your sanctuary (production) burst into flames at midnight, what would you do?",
      "A powerful merchant (client) demands impossible treasures by dawn. Your response?",
      "You discover a fellow survivor has been sabotaging the camp. How do you proceed?",
      "Your expedition leader (manager) insists on a doomed path. Do you mutiny or comply?",
      "Two essential resources can only serve one purpose. How do you choose?",
      "A promising but inexperienced recruit joins your party. How do you forge them?",
    ]
  },
  motivation: {
    name: "The Window to Your Soul",
    description: "Questions about your purpose and drive",
    questions: [
      "Why do you seek entry to this particular fortress (company)?",
      "Where do you see yourself when five winters have passed?",
      "What drives you through the wasteland when hope seems lost?",
      "What weakness festers within you, and how do you fight it?",
      "Describe your ideal band of survivors (team culture).",
      "What legacy do you wish to carve into the ruins of this world?"
    ]
  }
};

// @desc    Start a Mock Interview Session
// @route   POST /api/oracle/interview/start
// @access  Private
exports.startInterview = async (req, res) => {
  try {
    const { interviewType, jobRole, companyType } = req.body;

    if (!interviewType || !INTERVIEW_TYPES[interviewType]) {
      return res.status(400).json({
        success: false,
        message: "Choose your trial wisely, fool! Valid types: behavioral, technical, situational, motivation"
      });
    }

    const type = INTERVIEW_TYPES[interviewType];
    const questions = [...type.questions].sort(() => Math.random() - 0.5).slice(0, 5);

    let introduction = "So, another foolish mortal dares to enter my chamber... Very well, let us see if you are worthy. Prepare yourself for the trial ahead!";

    // Generate opening ritual with AI if available
    if (model) {
      try {
        const prompt = `
          ${ORACLE_PERSONA}
          
          A seeker has entered your chamber for ${type.name} - a mock interview trial.
          ${jobRole ? `They seek the role of: ${jobRole}` : ''}
          ${companyType ? `At a ${companyType} type of organization` : ''}
          
          Give a dramatic, menacing 2-3 sentence introduction to begin the trial.
          Make it theatrical and slightly terrifying, but ultimately welcoming.
        `;

        const result = await model.generateContent(prompt);
        introduction = result.response.text();
      } catch (aiErr) {
        console.error("AI generation failed, using fallback:", aiErr.message);
      }
    }

    res.status(200).json({
      success: true,
      message: 'The trial begins...',
      interview: {
        type: interviewType,
        typeName: type.name,
        description: type.description,
        introduction,
        questions,
        totalQuestions: questions.length,
        currentQuestion: 0
      }
    });
  } catch (error) {
    console.error("Interview Start Error:", error);
    res.status(500).json({
      success: false,
      message: 'The Oracle refuses to begin the trial.',
      error: error.message
    });
  }
};

// @desc    Submit an interview answer for evaluation
// @route   POST /api/oracle/interview/answer
// @access  Private
exports.evaluateAnswer = async (req, res) => {
  try {
    const { question, answer, questionNumber, totalQuestions, jobRole } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        message: "You cannot face the Oracle with empty words!"
      });
    }

    let evaluation = {
      score: 6,
      verdict: "Your words have been weighed, mortal. They hold some merit.",
      strengths: ["You answered with conviction"],
      weaknesses: ["More specifics would strengthen your case"],
      improvement: "Include concrete examples and measurable outcomes in your tales.",
      sampleAnswer: "A stronger answer would include specific situations and their results."
    };

    // Use AI evaluation if available
    if (model) {
      try {
        const prompt = `
          ${ORACLE_PERSONA}
          
          You are conducting a mock interview trial. The seeker is attempting to answer:
          
          QUESTION: "${question}"
          ${jobRole ? `For the role of: ${jobRole}` : ''}
          
          THE SEEKER'S ANSWER: "${answer}"
          
          Evaluate their response. Be harsh but fair - this is training, not real judgment.
          
          Respond in this EXACT JSON format (no markdown, just JSON):
          {
            "score": <number from 1-10>,
            "verdict": "<dramatic one-line judgment>",
            "strengths": ["<strength 1>", "<strength 2>"],
            "weaknesses": ["<weakness 1>", "<weakness 2>"],
            "improvement": "<specific advice to improve this answer, in Oracle voice>",
            "sampleAnswer": "<a brief example of a strong answer element they could have included>"
          }
        `;

        const result = await model.generateContent(prompt);

        // Clean the response and parse JSON
        let responseText = result.response.text();
        responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        evaluation = JSON.parse(responseText);
      } catch (parseError) {
        console.error("AI evaluation failed:", parseError.message);
        // Keep fallback evaluation
      }
    }

    res.status(200).json({
      success: true,
      message: 'Your answer has been judged.',
      evaluation,
      progress: {
        current: questionNumber,
        total: totalQuestions,
        remaining: totalQuestions - questionNumber
      }
    });
  } catch (error) {
    console.error("Answer Evaluation Error:", error);
    res.status(500).json({
      success: false,
      message: 'The Oracle chokes on your words.',
      error: error.message
    });
  }
};

// @desc    Get final interview summary
// @route   POST /api/oracle/interview/summary
// @access  Private
exports.getInterviewSummary = async (req, res) => {
  try {
    const { answers, scores, interviewType, jobRole } = req.body;

    if (!answers || !scores || answers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "There is nothing to summarize, fool!"
      });
    }

    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const totalScore = scores.reduce((a, b) => a + b, 0);
    const maxScore = scores.length * 10;

    let summary = {
      overallVerdict: "The Oracle has weighed your words and found them... acceptable.",
      survivalChance: `${Math.round(averageScore * 10)}%`,
      title: averageScore >= 7 ? "The Promising One" : averageScore >= 5 ? "The Struggling Seeker" : "The Doomed Wanderer",
      topStrengths: ["You completed the trial", "You showed courage to face judgment"],
      areasToImprove: ["Provide more specific examples", "Structure answers with the STAR method", "Show quantifiable results"],
      finalWisdom: "Practice your tales until they flow like water, not stumble like a wounded beast."
    };

    // Use AI summary if available
    if (model) {
      try {
        const prompt = `
          ${ORACLE_PERSONA}
          
          The seeker has completed their ${INTERVIEW_TYPES[interviewType]?.name || 'trial'}.
          ${jobRole ? `They seek the role of: ${jobRole}` : ''}
          
          Their scores across ${scores.length} questions: ${scores.join(', ')}
          Average score: ${averageScore.toFixed(1)}/10
          Total: ${totalScore}/${maxScore}
          
          Their answers summary:
          ${answers.map((a, i) => `Q${i + 1}: "${a.question}" -> "${a.answer.substring(0, 100)}..."`).join('\n')}
          
          Give a DRAMATIC final verdict (3-4 sentences) on their overall performance.
          Then provide 3 specific areas for improvement.
          Be theatrical but genuinely helpful.
          
          Respond in this EXACT JSON format (no markdown, just JSON):
          {
            "overallVerdict": "<dramatic final judgment>",
            "survivalChance": "<percentage like '73%'>",
            "title": "<a dramatic title for their performance, like 'The Stuttering Squire' or 'The Iron-Tongued Warrior'>",
            "topStrengths": ["<strength 1>", "<strength 2>"],
            "areasToImprove": ["<area 1>", "<area 2>", "<area 3>"],
            "finalWisdom": "<one piece of crucial advice for their next real interview>"
          }
        `;

        const result = await model.generateContent(prompt);
        let responseText = result.response.text();
        responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        summary = JSON.parse(responseText);
      } catch (aiError) {
        console.error("AI summary generation failed:", aiError.message);
        // Keep fallback summary
      }
    }

    // Update user stats if authenticated
    if (req.user) {
      try {
        const user = await User.findByPk(req.user.id);
        const history = user.interviewHistory || [];
        history.push({
          type: interviewType,
          jobRole: jobRole || 'General',
          score: averageScore,
          date: new Date(),
          title: summary.title
        });

        // Ensure manual update for JSON column
        user.interviewHistory = [...history];

        // Update streaks
        const streaks = user.streaks || {};
        streaks.interviewsCompleted = (streaks.interviewsCompleted || 0) + 1;
        user.streaks = { ...streaks };

        await user.save();
      } catch (userError) {
        console.log("Could not update user stats:", userError.message);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Your trial is complete.',
      summary: {
        ...summary,
        stats: {
          averageScore: averageScore.toFixed(1),
          totalScore,
          maxScore,
          questionsAnswered: scores.length
        }
      }
    });
  } catch (error) {
    console.error("Summary Error:", error);
    res.status(500).json({
      success: false,
      message: 'The Oracle cannot render judgment.',
      error: error.message
    });
  }
};

// @desc    Resume Review - Oracle critiques your CV/resume
// @route   POST /api/oracle/resume-review
// @access  Private
exports.reviewResume = async (req, res) => {
  try {
    const { resumeText, targetRole } = req.body;

    if (!resumeText) {
      return res.status(400).json({
        success: false,
        message: "You bring me an empty scroll? FOOL!"
      });
    }

    let review = {
      overallGrade: "C",
      dramaticVerdict: "Your scroll speaks, but whispers when it should roar.",
      strengths: ["Content is present", "Basic structure exists"],
      weaknesses: ["Lacks specificity", "No quantifiable metrics", "Vague achievement descriptions"],
      missingElements: ["Quantifiable results", "Action verbs", "Keywords for target role"],
      specificFixes: [
        { original: "Worked on projects", improved: "Led 3 cross-functional projects, delivering 25% ahead of schedule" },
        { original: "Good communication skills", improved: "Presented to 50+ stakeholders, driving 40% increase in buy-in" }
      ],
      survivalChance: "55%",
      finalAdvice: "Transform every responsibility into a quantifiable achievement. Numbers command respect."
    };

    // Use AI review if available
    if (model) {
      try {
        const prompt = `
          ${ORACLE_PERSONA}
          
          A seeker brings their scroll of achievements (resume) for your judgment.
          ${targetRole ? `They seek roles in: ${targetRole}` : ''}
          
          THE SCROLL READS:
          "${resumeText}"
          
          Critique this resume harshly but fairly. Look for:
          - Weak or vague statements
          - Missing quantifiable achievements
          - Poor structure or formatting issues
          - Missing keywords for their target role
          - Strengths to build upon
          
          Respond in this EXACT JSON format (no markdown, just JSON):
          {
            "overallGrade": "<letter grade A-F>",
            "dramaticVerdict": "<one dramatic sentence judgment>",
            "strengths": ["<strength 1>", "<strength 2>", "<strength 3>"],
            "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
            "missingElements": ["<missing 1>", "<missing 2>"],
            "specificFixes": [
              {"original": "<weak phrase from resume>", "improved": "<better version>"},
              {"original": "<another weak phrase>", "improved": "<better version>"}
            ],
            "survivalChance": "<percentage>",
            "finalAdvice": "<one crucial piece of advice>"
          }
        `;

        const result = await model.generateContent(prompt);
        let responseText = result.response.text();
        responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        review = JSON.parse(responseText);
      } catch (aiError) {
        console.error("AI resume review failed:", aiError.message);
        // Keep fallback review
      }
    }

    res.status(200).json({
      success: true,
      message: 'Your scroll has been judged.',
      review
    });
  } catch (error) {
    console.error("Resume Review Error:", error);
    res.status(500).json({
      success: false,
      message: 'The Oracle cannot read your scroll.',
      error: error.message
    });
  }
};

// @desc    Get interview types available
// @route   GET /api/oracle/interview/types
// @access  Public
exports.getInterviewTypes = async (req, res) => {
  try {
    const types = Object.entries(INTERVIEW_TYPES).map(([key, value]) => ({
      id: key,
      name: value.name,
      description: value.description,
      questionCount: value.questions.length
    }));

    res.status(200).json({
      success: true,
      types
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'The Oracle is silent.',
      error: error.message
    });
  }
};
