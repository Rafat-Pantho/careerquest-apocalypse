const User = require('../models/User');

// @desc    Register a new hero
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { name, email, password, heroClass, avatar } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
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
        id: user._id,
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
    const user = await User.findOne({ email }).select('+password');
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
        id: user._id,
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
    const user = await User.findById(req.user.id);
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

    // Build update object with only provided fields
    const updateFields = {};
    if (heroName !== undefined) updateFields.heroName = heroName;
    if (firstName !== undefined) updateFields.firstName = firstName;
    if (lastName !== undefined) updateFields.lastName = lastName;
    if (heroClass !== undefined) updateFields.heroClass = heroClass;
    if (avatar !== undefined) updateFields.avatar = avatar;
    if (heroicSummary !== undefined) updateFields.heroicSummary = heroicSummary;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Hero not found in the realm!'
      });
    }

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
