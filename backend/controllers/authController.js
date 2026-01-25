const { User } = require('../models');

// @desc    Register a new hero
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, heroClass, avatar } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'A hero with this email scroll already exists!'
      });
    }

    // Split name into first and last name
    const nameParts = name ? name.trim().split(' ') : ['Unknown'];
    const firstName = nameParts[0];
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      heroName: name,
      email,
      password,
      heroClass,
      avatar: avatar || 'mage' // Default avatar if not provided
    });

    // Generate token
    const token = user.generateAccessToken();

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.heroName,
        email: user.email,
        heroClass: user.heroClass,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error: The spell backfired!',
      error: error.message
    });
  }
};

// @desc    Login hero
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email scroll and secret rune!'
      });
    }

    // Check for user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. The gates remain closed.'
      });
    }

    // Check if password matches
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials. The gates remain closed.'
      });
    }

    // Generate token
    const token = user.generateAccessToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.heroName,
        email: user.email,
        heroClass: user.heroClass,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error: The spell backfired!',
      error: error.message
    });
  }
};

// @desc    Get current hero
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error: The spell backfired!',
      error: error.message
    });
  }
};

// @desc    Update hero profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { heroName, firstName, lastName, heroClass, avatar, heroicSummary } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Hero not found in the realm!'
      });
    }

    // Update fields
    if (heroName !== undefined) user.heroName = heroName;
    if (firstName !== undefined) user.firstName = firstName;
    if (lastName !== undefined) user.lastName = lastName;
    if (heroClass !== undefined) user.heroClass = heroClass;
    if (avatar !== undefined) user.avatar = avatar;
    if (heroicSummary !== undefined) user.heroicSummary = heroicSummary;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      data: user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server Error: The spell backfired!',
      error: error.message
    });
  }
};
