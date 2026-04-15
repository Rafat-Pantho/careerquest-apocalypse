const User = require('../models/User');

// POST /api/profile — Update Profile (Protected)
const updateProfile = async (req, res) => {
    // req.user is populated by the 'protect' middleware
    if (!req.user || !req.user._id) {
        return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    const userId = req.user._id;

    const {
        full_name, role_title, phone, location,
        summary, skills, experience, education, photo
    } = req.body;

    try {
        // Map frontend fields to Mongoose schema fields
        const updateData = {};
        if (full_name) updateData.name = full_name;
        if (role_title) updateData.title = role_title;
        if (phone) updateData.phone = phone;
        if (location) updateData.location = location;
        if (summary) updateData.summary = summary;
        if (photo) updateData.avatarUrl = photo;

        // Handle arrays: ensure they are arrays (frontend might send them as such)
        if (skills) updateData.skills = Array.isArray(skills) ? skills : [];
        if (experience) updateData.experience = Array.isArray(experience) ? experience : [];
        if (education) updateData.education = Array.isArray(education) ? education : [];

        // Find user by ID and update
        const user = await User.findByIdAndUpdate(
            userId,
            { $set: updateData },
            { new: true, runValidators: true }
        );

        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        res.json({ success: true, message: 'Profile saved successfully', user });
    } catch (err) {
        console.error("Profile Update Error:", err);
        res.status(500).json({ success: false, error: err.message });
    }
};

const getMyProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        if (!user) return res.status(404).json({ success: false, error: 'User not found' });
        res.json({
            success: true,
            data: {
                full_name: user.name,
                role_title: user.title || '',
                email: user.email,
                phone: user.phone || '',
                location: user.location || '',
                summary: user.summary || '',
                skills: user.skills || [],
                experience: user.experience || [],
                education: user.education || [],
                photo: user.avatarUrl || null,
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, error: 'Server error' });
    }
};

// GET /api/profile/:email
const getProfile = async (req, res) => {
    const { email } = req.params;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ success: false, error: "User not found" });
        }

        // Map schema fields back to frontend expected format
        const profile = {
            full_name: user.name,
            email: user.email,
            role_title: user.title,
            phone: user.phone,
            location: user.location,
            summary: user.summary,
            photo: user.avatarUrl,
            skills: user.skills,
            experience: user.experience,
            education: user.education
        };

        res.json({ success: true, data: profile });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: err.message });
    }
};


module.exports = { updateProfile, getProfile, getMyProfile };