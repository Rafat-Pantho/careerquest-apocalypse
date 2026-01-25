const Quest = require('../models/Quest');
const User = require('../models/User');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini for AI-powered survival probability
let genAI = null;
let model = null;

if (process.env.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  } catch (err) {
    console.error('Quest AI initialization failed:', err.message);
  }
}

// @desc    Get all quests (Job Board)
// @route   GET /api/quests
// @access  Public
exports.getAllQuests = async (req, res) => {
  try {
    const quests = await Quest.find({ isActive: true })
      .populate('postedBy', 'heroName avatar heroClass')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: quests.length,
      data: quests
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'The Quest Board is dusty and unreadable.',
      error: error.message
    });
  }
};

// @desc    Get single quest
// @route   GET /api/quests/:id
// @access  Public
exports.getQuestById = async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id)
      .populate('postedBy', 'heroName avatar heroClass')
      .populate('applicants.hero', 'heroName avatar heroClass');

    if (!quest) {
      return res.status(404).json({
        success: false,
        message: 'This quest scroll has crumbled to dust (Not Found).'
      });
    }

    res.status(200).json({
      success: true,
      data: quest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Create a new quest
// @route   POST /api/quests
// @access  Private (Guild Masters/Recruiters)
exports.createQuest = async (req, res) => {
  try {
    // Add user to req.body
    req.body.postedBy = req.user.id;

    const quest = await Quest.create(req.body);

    // Emit socket event
    if (req.io) {
      req.io.emit('newQuest', quest);
      
      // Also emit updated count
      const count = await Quest.countDocuments({ isActive: true });
      req.io.emit('questCountUpdate', count);
    }

    res.status(201).json({
      success: true,
      message: 'New quest posted to the board!',
      data: quest
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to scribe the quest.',
      error: error.message
    });
  }
};

// @desc    Update quest
// @route   PUT /api/quests/:id
// @access  Private
exports.updateQuest = async (req, res) => {
  try {
    let quest = await Quest.findById(req.params.id);

    if (!quest) {
      return res.status(404).json({
        success: false,
        message: 'Quest not found'
      });
    }

    // Make sure user is quest owner
    if (quest.postedBy.toString() !== req.user.id && req.user.role !== 'dungeon_master') {
      return res.status(401).json({
        success: false,
        message: 'You are not the Guild Master of this quest!'
      });
    }

    quest = await Quest.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: quest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Delete quest
// @route   DELETE /api/quests/:id
// @access  Private
exports.deleteQuest = async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id);

    if (!quest) {
      return res.status(404).json({
        success: false,
        message: 'Quest not found'
      });
    }

    // Make sure user is quest owner
    if (quest.postedBy.toString() !== req.user.id && req.user.role !== 'dungeon_master') {
      return res.status(401).json({
        success: false,
        message: 'You are not the Guild Master of this quest!'
      });
    }

    await quest.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Quest scroll burned successfully.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Apply for a quest
// @route   POST /api/quests/:id/apply
// @access  Private
exports.applyForQuest = async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id);

    if (!quest) {
      return res.status(404).json({
        success: false,
        message: 'Quest not found'
      });
    }

    // Check if already applied
    const alreadyApplied = quest.applicants.find(
      app => app.hero.toString() === req.user.id
    );

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: 'You have already volunteered for this quest!'
      });
    }

    quest.applicants.push({
      hero: req.user.id,
      status: 'Pending'
    });

    await quest.save();

    res.status(200).json({
      success: true,
      message: 'Your application scroll has been sent via raven!',
      data: quest
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Calculate Survival Probability (AI-powered fit score)
// @route   POST /api/quests/:id/survival-probability
// @access  Private
exports.calculateSurvivalProbability = async (req, res) => {
  try {
    const quest = await Quest.findById(req.params.id);
    const user = await User.findById(req.user.id);

    if (!quest) {
      return res.status(404).json({
        success: false,
        message: 'Quest not found'
      });
    }

    // Gather user's skills and experience
    const userSkills = user.specialAttacks?.map(s => s.attackName) || [];
    const userExperience = user.battleHistory?.map(b => ({
      role: b.enemyVanquished,
      company: b.battlefield,
      duration: b.duration
    })) || [];
    const userEducation = user.trainingGrounds?.map(t => ({
      degree: t.trainingType,
      field: t.specialization,
      institution: t.academy
    })) || [];

    // Quest requirements
    const questRequirements = quest.requirements || [];
    const questTitle = quest.title;
    const questDescription = quest.description;
    const questDifficulty = quest.difficulty || 'Unknown';
    const questCompany = quest.company || 'Unknown Company';

    const prompt = `
      You are an AI career advisor calculating a "Survival Probability" (fit score) for a job application.
      
      JOB DETAILS:
      - Title: ${questTitle}
      - Company: ${questCompany}
      - Description: ${questDescription}
      - Requirements: ${questRequirements.join(', ')}
      - Difficulty Level: ${questDifficulty}
      
      CANDIDATE PROFILE:
      - Skills: ${userSkills.join(', ') || 'None listed'}
      - Experience: ${JSON.stringify(userExperience)}
      - Education: ${JSON.stringify(userEducation)}
      
      Calculate a realistic fit score and provide feedback.
      
      Respond in this EXACT JSON format (no markdown, just JSON):
      {
        "survivalProbability": <number 0-100>,
        "riskLevel": "<Low|Medium|High|Critical>",
        "matchingSkills": ["<skill that matches>", "<another skill>"],
        "missingSkills": ["<skill they need>", "<another needed skill>"],
        "strengths": ["<strength 1>", "<strength 2>"],
        "concerns": ["<concern 1>", "<concern 2>"],
        "recommendation": "<brief strategic advice>",
        "improvementTips": ["<tip 1>", "<tip 2>"]
      }
    `;

    const result = await model.generateContent(prompt);
    let analysis;

    try {
      let responseText = result.response.text();
      responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      analysis = JSON.parse(responseText);
    } catch (parseError) {
      // Calculate basic score if AI fails
      const skillMatch = userSkills.filter(skill => 
        questRequirements.some(req => 
          req.toLowerCase().includes(skill.toLowerCase()) || 
          skill.toLowerCase().includes(req.toLowerCase())
        )
      );
      
      const baseScore = Math.min(90, Math.max(20, (skillMatch.length / Math.max(questRequirements.length, 1)) * 100));
      
      analysis = {
        survivalProbability: Math.round(baseScore),
        riskLevel: baseScore >= 70 ? 'Low' : baseScore >= 50 ? 'Medium' : baseScore >= 30 ? 'High' : 'Critical',
        matchingSkills: skillMatch,
        missingSkills: questRequirements.filter(r => !skillMatch.includes(r)),
        strengths: ['Has relevant experience'],
        concerns: ['Could strengthen skill match'],
        recommendation: 'Consider highlighting transferable skills in your application.',
        improvementTips: ['Research the company', 'Prepare specific examples']
      };
    }

    res.status(200).json({
      success: true,
      message: 'Survival probability calculated.',
      data: {
        questId: quest._id,
        questTitle: quest.title,
        analysis
      }
    });
  } catch (error) {
    console.error('Survival Probability Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to calculate survival probability.',
      error: error.message
    });
  }
};

// @desc    Get quests with survival probability for current user
// @route   GET /api/quests/with-probability
// @access  Private
exports.getQuestsWithProbability = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const quests = await Quest.find({ isActive: true })
      .populate('postedBy', 'heroName avatar heroClass')
      .sort({ createdAt: -1 })
      .limit(20);

    // Calculate quick survival probability for each quest
    const userSkills = user.specialAttacks?.map(s => s.attackName.toLowerCase()) || [];
    
    const questsWithProbability = quests.map(quest => {
      const requirements = quest.requirements?.map(r => r.toLowerCase()) || [];
      
      // Simple skill matching algorithm
      let matchCount = 0;
      requirements.forEach(req => {
        if (userSkills.some(skill => 
          req.includes(skill) || skill.includes(req) ||
          req.split(' ').some(word => skill.includes(word))
        )) {
          matchCount++;
        }
      });

      const baseScore = requirements.length > 0 
        ? Math.round((matchCount / requirements.length) * 100) 
        : 50;
      
      // Adjust based on experience
      const experienceBonus = Math.min(20, (user.battleHistory?.length || 0) * 5);
      const educationBonus = Math.min(10, (user.trainingGrounds?.length || 0) * 3);
      
      const survivalProbability = Math.min(95, Math.max(10, baseScore + experienceBonus + educationBonus));
      
      return {
        ...quest.toObject(),
        survivalProbability,
        riskLevel: survivalProbability >= 70 ? 'Low' : survivalProbability >= 50 ? 'Medium' : survivalProbability >= 30 ? 'High' : 'Critical'
      };
    });

    res.status(200).json({
      success: true,
      count: questsWithProbability.length,
      data: questsWithProbability
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quests with probability.',
      error: error.message
    });
  }
};
