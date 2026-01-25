const BossBattle = require('../models/BossBattle');
const User = require('../models/User');

// @desc    Get all boss battles
// @route   GET /api/boss-battles
// @access  Public
exports.getBattles = async (req, res) => {
  try {
    // Seed some battles if none exist (for demo purposes)
    const count = await BossBattle.count();
    if (count === 0) {
      await seedBattles();
    }

    const battles = await BossBattle.findAll({
      attributes: { exclude: ['validationCriteria'] }
    });

    res.status(200).json({
      success: true,
      count: battles.length,
      data: battles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'The Dungeon Master is asleep.',
      error: error.message
    });
  }
};

// @desc    Get single boss battle
// @route   GET /api/boss-battles/:id
// @access  Public
exports.getBattle = async (req, res) => {
  try {
    const battle = await BossBattle.findByPk(req.params.id, {
      attributes: { exclude: ['validationCriteria'] }
    });

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: 'This Boss does not exist in this realm.'
      });
    }
    res.status(200).json({
      success: true,
      data: battle
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// @desc    Attack the Boss (Submit Code)
// @route   POST /api/boss-battles/:id/attack
// @access  Private (Protected)
exports.attackBoss = async (req, res) => {
  try {
    const { code } = req.body;
    const battle = await BossBattle.findByPk(req.params.id);
    const user = await User.findByPk(req.user.id);

    if (!battle) {
      return res.status(404).json({ success: false, message: 'Boss not found' });
    }

    // ---------------------------------------------------------
    // MOCK CODE EXECUTION / VALIDATION LOGIC
    // ---------------------------------------------------------

    let damageDealt = 0;
    let isVictory = false;
    let message = "";

    const { requiredKeywords, forbiddenKeywords } = battle.validationCriteria || { requiredKeywords: [], forbiddenKeywords: [] };

    // Check for required keywords
    const missingKeywords = requiredKeywords.filter(kw => !code.includes(kw));

    if (missingKeywords.length > 0) {
      message = `Your spell fizzled! You forgot to use: ${missingKeywords.join(', ')}`;
      damageDealt = 5; // Small damage for trying
    } else {
      // Check for forbidden keywords
      const usedForbidden = forbiddenKeywords.filter(kw => code.includes(kw));
      if (usedForbidden.length > 0) {
        message = `The Boss absorbs your attack! You used forbidden magic: ${usedForbidden.join(', ')}`;
        damageDealt = 0;
      } else {
        // Victory!
        isVictory = true;
        damageDealt = 100; // Critical Hit
        message = "CRITICAL HIT! The code compiles perfectly. The Boss is defeated!";
      }
    }

    // Update User Stats if Victory
    if (isVictory) {
      // Check if already won
      // bossBattlesWon is defined as JSON in User model step 316
      const bossBattlesWon = user.bossBattlesWon || [];

      // Check as string or int depending on ID type, usually Int in Sequelize id
      if (!bossBattlesWon.includes(battle.id)) {
        const newWins = [...bossBattlesWon, battle.id];
        user.bossBattlesWon = newWins;
        // Also update XP. Sequelize user instance typically tracks changes.
        // We need to implement awardXP logic if it was an instance method on Sequelize model?
        // In User.js step 199, I commented out instance methods or didn't add them all.
        // Let's manually add XP for now.
        user.experiencePoints = (user.experiencePoints || 0) + battle.xpReward;

        await user.save();
        message += ` You gained ${battle.xpReward} XP!`;
      } else {
        message += " (You have already defeated this boss, no new XP gained)";
      }
    }

    res.status(200).json({
      success: true,
      isVictory,
      damageDealt,
      message,
      userXP: user.experiencePoints
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Your spell caused a server runtime error!',
      error: error.message
    });
  }
};

// Helper to seed initial battles
const seedBattles = async () => {
  const battles = [
    {
      title: "The Loop of Infinity",
      description: "A giant Ouroboros snake that eats its own tail. It traps adventurers in endless cycles.",
      difficulty: "Easy",
      levelRequirement: 1,
      xpReward: 100,
      problemStatement: "Write a function `breakLoop` that returns the string 'Loop Broken' to escape the cycle.",
      starterCode: "function breakLoop() {\n  // Your code here\n}",
      validationCriteria: {
        requiredKeywords: ["return", "'Loop Broken'"],
        forbiddenKeywords: ["while(true)", "for(;;)"]
      }
    },
    {
      title: "The Null Pointer Wraith",
      description: "A ghostly figure that vanishes when you try to touch it, leaving only 'undefined' in its wake.",
      difficulty: "Medium",
      levelRequirement: 5,
      xpReward: 250,
      problemStatement: "Write a function `checkExistence` that takes a variable `obj`. If `obj` is null or undefined, return 'Ghost Found'. Otherwise return 'Solid'.",
      starterCode: "function checkExistence(obj) {\n  // Your code here\n}",
      validationCriteria: {
        requiredKeywords: ["if", "null", "undefined", "return"],
        forbiddenKeywords: []
      }
    },
    {
      title: "The Callback Hydra",
      description: "A multi-headed beast. Cut off one head, and two nested callbacks take its place!",
      difficulty: "Hard",
      levelRequirement: 10,
      xpReward: 500,
      problemStatement: "Defeat the Hydra by converting this callback hell into a Promise. Write a function `slayHydra` that returns a Promise that resolves to 'Victory'.",
      starterCode: "function slayHydra() {\n  // Return a Promise\n}",
      validationCriteria: {
        requiredKeywords: ["new Promise", "resolve", "Victory"],
        forbiddenKeywords: ["callback"]
      }
    }
  ];

  await BossBattle.bulkCreate(battles);
  console.log('Boss Battles Seeded!');
};
