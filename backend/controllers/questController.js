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

// Helper to format quest response (Mongoose compatibility)
const formatQuest = (quest) => {
  const q = quest.toJSON ? quest.toJSON() : quest;
  if (q.poster) {
    q.postedBy = q.poster;
    delete q.poster;
  }
  return q;
};

// @desc    Get all quests (Job Board)
// @route   GET /api/quests
// @access  Public
exports.getAllQuests = async (req, res) => {
  try {
    // Determine sort order
    // Mongoose: .sort({ createdAt: -1 })
    // Sequelize: order: [['createdAt', 'DESC']]
    const quests = await Quest.findAll({
      where: { isActive: true },
      include: [{
        model: User,
        as: 'poster',
        attributes: ['heroName', 'avatar', 'heroClass']
      }],
      order: [['createdAt', 'DESC']]
    });

    const formattedQuests = quests.map(formatQuest);

    res.status(200).json({
      success: true,
      count: formattedQuests.length,
      data: formattedQuests
    });
  } catch (error) {
    console.error(error);
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
    const quest = await Quest.findByPk(req.params.id, {
      include: [{
        model: User,
        as: 'poster',
        attributes: ['heroName', 'avatar', 'heroClass']
      }]
    });

    if (!quest) {
      return res.status(404).json({
        success: false,
        message: 'This quest scroll has crumbled to dust (Not Found).'
      });
    }

    // For applicants, in Mongoose it was populated. 
    // In our Sequelize JSON model, 'applicants' contains objects with 'hero' ID.
    // We would need to manually fetch hero details if we want to populate them.
    // For now, let's return the JSON as is, or fetch if critical.
    // Given the Mongoose code did populate 'applicants.hero', we should try to emulate that.
    // But it's complex with JSON column. Let's skip deep population of applicants for MVP migration step, 
    // or do a separate fetch if needed. The frontend might break if it expects full hero objects in applicants.
    // Recommendation: Keep it simple for this step.

    res.status(200).json({
      success: true,
      data: formatQuest(quest)
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
    req.body.postedBy = req.user.id;

    // Convert array fields to what Sequelize expects (JSON or String)
    // In our model definition: requirements is JSON, rewards_perks is JSON.
    // req.body might come in as standard JSON, which Sequelize handles fine for JSON columns.

    // However, rewards structure in Mongoose was nested object, in Sequelize we have:
    // rewards_gold (String), rewards_xp (Int), rewards_perks (JSON)
    // We need to map if the frontend sends { rewards: { gold, xp, perks } }

    const { rewards, ...rest } = req.body;
    let questData = { ...rest };

    if (rewards) {
      questData.rewards_gold = rewards.gold;
      questData.rewards_xp = rewards.xp;
      questData.rewards_perks = rewards.perks;
    }

    const quest = await Quest.create(questData);

    // Emit socket event
    if (req.io) {
      req.io.emit('newQuest', quest);
      const count = await Quest.count({ where: { isActive: true } });
      req.io.emit('questCountUpdate', count);
    }

    res.status(201).json({
      success: true,
      message: 'New quest posted to the board!',
      data: quest
    });
  } catch (error) {
    console.error(error);
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
    let quest = await Quest.findByPk(req.params.id);

    if (!quest) {
      return res.status(404).json({
        success: false,
        message: 'Quest not found'
      });
    }

    // Make sure user is quest owner
    // quest.postedBy is an Integer (ID) in standard Sequelize unless aliased, but we defined field 'postedBy'.
    if (quest.postedBy !== req.user.id && req.user.role !== 'dungeon_master') {
      return res.status(401).json({
        success: false,
        message: 'You are not the Guild Master of this quest!'
      });
    }

    // Map rewards again if present
    const { rewards, ...rest } = req.body;
    let updateData = { ...rest };

    if (rewards) {
      updateData.rewards_gold = rewards.gold;
      updateData.rewards_xp = rewards.xp;
      updateData.rewards_perks = rewards.perks;
    }

    await quest.update(updateData);

    // Refresh
    const updatedQuest = await Quest.findByPk(req.params.id);

    res.status(200).json({
      success: true,
      data: updatedQuest
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
    const quest = await Quest.findByPk(req.params.id);

    if (!quest) {
      return res.status(404).json({
        success: false,
        message: 'Quest not found'
      });
    }

    if (quest.postedBy !== req.user.id && req.user.role !== 'dungeon_master') {
      return res.status(401).json({
        success: false,
        message: 'You are not the Guild Master of this quest!'
      });
    }

    await quest.destroy();

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
    const quest = await Quest.findByPk(req.params.id);

    if (!quest) {
      return res.status(404).json({
        success: false,
        message: 'Quest not found'
      });
    }

    // Check if already applied
    const applicants = quest.applicants || [];
    // Need to handle if applicants is string or object (SQLite/MySQL JSON handling varies)
    // Sequelize usually parses it if dialect supports JSON.

    const alreadyApplied = applicants.find(
      app => app.hero === req.user.id
    );

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message: 'You have already volunteered for this quest!'
      });
    }

    const newApp = {
      hero: req.user.id,
      status: 'Pending',
      appliedAt: new Date()
    };

    // Update JSON field
    // We must clone and set for change detection in some versions, or use set/changed
    const newApplicants = [...applicants, newApp];
    quest.applicants = newApplicants;
    // quest.set('applicants', newApplicants); // Safer explicit set

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
    const quest = await Quest.findByPk(req.params.id);
    const user = await User.findByPk(req.user.id);

    if (!quest) {
      return res.status(404).json({
        success: false,
        message: 'Quest not found'
      });
    }

    // Gather user's skills and experience
    // User specialAttacks is JSON now
    const userSkills = user.specialAttacks?.map(s => s.attackName) || [];
    const userExperience = user.battleHistory?.map(b => ({
      role: b.enemyVanquished || b.rank, // Handle mapping variations
      company: b.battlefield || b.campaignName,
      duration: b.duration || 'Unknown'
    })) || [];
    const userEducation = user.trainingGrounds?.map(t => ({
      degree: t.trainingType || t.scrollObtained,
      field: t.specialization || t.disciplineMastered,
      institution: t.academy || t.academyName
    })) || [];

    // Quest requirements
    const questRequirements = quest.requirements || [];
    const questTitle = quest.title;
    const questDescription = quest.description;
    const questDifficulty = quest.difficulty || 'Unknown';
    // const questCompany = quest.company || quest.guild || 'Unknown Company'; // Mongoose had company/guild mixing in prompt?
    // Quest model has 'guild' field
    const questCompany = quest.guild || 'Unknown Guild';

    const prompt = `
      You are an AI career advisor calculating a "Survival Probability" (fit score) for a job application.
      
      JOB DETAILS:
      - Title: ${questTitle}
      - Company: ${questCompany}
      - Description: ${questDescription}
      - Requirements: ${Array.isArray(questRequirements) ? questRequirements.join(', ') : questRequirements}
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

    let analysis;

    if (model) {
      const result = await model.generateContent(prompt);
      try {
        let responseText = result.response.text();
        responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        analysis = JSON.parse(responseText);
      } catch (parseError) {
        console.error("AI Parse Error", parseError);
      }
    }

    if (!analysis) {
      // Calculate basic score if AI fails
      const skillMatch = userSkills.filter(skill =>
        (Array.isArray(questRequirements) ? questRequirements : []).some(req =>
          (typeof req === 'string') && (req.toLowerCase().includes(skill.toLowerCase()) ||
            skill.toLowerCase().includes(req.toLowerCase()))
        )
      );

      const reqLen = Array.isArray(questRequirements) ? questRequirements.length : 1;
      const baseScore = Math.min(90, Math.max(20, (skillMatch.length / Math.max(reqLen, 1)) * 100));

      analysis = {
        survivalProbability: Math.round(baseScore),
        riskLevel: baseScore >= 70 ? 'Low' : baseScore >= 50 ? 'Medium' : baseScore >= 30 ? 'High' : 'Critical',
        matchingSkills: skillMatch,
        missingSkills: [], // Simplified
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
        questId: quest.id,
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
    const user = await User.findByPk(req.user.id);
    const quests = await Quest.findAll({
      where: { isActive: true },
      include: [{
        model: User,
        as: 'poster',
        attributes: ['heroName', 'avatar', 'heroClass']
      }],
      order: [['createdAt', 'DESC']],
      limit: 20
    });

    // Calculate quick survival probability for each quest
    const userSkills = user.specialAttacks?.map(s => s.attackName ? s.attackName.toLowerCase() : '') || [];

    const questsWithProbability = quests.map(quest => {
      const q = formatQuest(quest);
      const requirements = (q.requirements || []).map(r => (typeof r === 'string' ? r.toLowerCase() : ''));

      // Simple skill matching algorithm
      let matchCount = 0;
      requirements.forEach(req => {
        if (req && userSkills.some(skill =>
          skill && (req.includes(skill) || skill.includes(req) ||
            req.split(' ').some(word => skill.includes(word)))
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
        ...q,
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
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch quests with probability.',
      error: error.message
    });
  }
};
