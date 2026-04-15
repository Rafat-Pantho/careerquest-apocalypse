const { Milestone, UserProgress } = require('../models/Roadmap');
const User = require('../models/User');

// -----------------------------------------------------------------------------
// GET /api/roadmap
// -----------------------------------------------------------------------------
const getRoadmap = async (req, res) => {
    try {
        // ---------- Step 1: Fetch all milestones in order ----------
        const milestones = await Milestone.find().sort({ stepNumber: 1 });

        // ---------- Step 2: Get or initialise user progress ----------
        let progress = await UserProgress.findOneAndUpdate(
            { user: req.user._id },
            { $setOnInsert: { currentStep: 1, completedMilestones: [] } },
            { new: true, upsert: true }
        );

        // ---------- Step 3: Build the response with status flags ----------
        const roadmap = milestones.map((milestone) => {
            let status;

            if (milestone.stepNumber < progress.currentStep) {
                status = 'completed';
            } else if (milestone.stepNumber === progress.currentStep) {
                status = 'active';
            } else {
                status = 'locked';
            }

            return {
                _id: milestone._id,
                stepNumber: milestone.stepNumber,
                title: milestone.title,
                description: milestone.description,
                xpReward: milestone.xpReward,
                status,
            };
        });

        // ---------- Step 4: Respond ----------
        res.json({
            roadmap,
            progress: {
                currentStep: progress.currentStep,
                totalCompleted: progress.completedMilestones.length,
            },
        });
    } catch (err) {
        console.error('getRoadmap error:', err.message);
        res.status(500).json({ error: 'Server error while fetching roadmap' });
    }
};

// -----------------------------------------------------------------------------
// POST /api/roadmap/:id/complete
// -----------------------------------------------------------------------------
const completeMilestone = async (req, res) => {
    try {
        const milestoneId = req.params.id;

        // ---------- Fetch the milestone ----------
        const milestone = await Milestone.findById(milestoneId);

        if (!milestone) {
            return res.status(404).json({ error: 'Milestone not found' });
        }

        // ---------- Fetch user progress (must already exist) ----------
        let progress = await UserProgress.findOne({ user: req.user._id });

        // If user has never visited the roadmap, initialise progress now
        if (!progress) {
            progress = await UserProgress.create({
                user: req.user._id,
                currentStep: 1,
                completedMilestones: [],
            });
        }

        // ---------- Validation: strict linear order ----------
        if (milestone.stepNumber !== progress.currentStep) {
            const reason =
                milestone.stepNumber < progress.currentStep
                    ? 'This milestone has already been completed'
                    : 'You must complete the previous milestones first';

            return res.status(400).json({
                error: reason,
                expected: progress.currentStep,
                received: milestone.stepNumber,
            });
        }

        // ---------- Update UserProgress atomically ----------
        progress.completedMilestones.push(milestone._id);
        progress.currentStep += 1;
        await progress.save();

        // ---------- Award XP to the User document ----------
        if (milestone.xpReward > 0) {
            await User.findByIdAndUpdate(req.user._id, {
                $inc: { xp: milestone.xpReward },
            });
        }

        // ---------- Respond with updated state ----------
        res.json({
            message: `Milestone "${milestone.title}" completed!`,
            xpEarned: milestone.xpReward,
            progress: {
                currentStep: progress.currentStep,
                totalCompleted: progress.completedMilestones.length,
            },
        });
    } catch (err) {
        console.error('completeMilestone error:', err.message);
        res.status(500).json({ error: 'Server error while completing milestone' });
    }
};

module.exports = { getRoadmap, completeMilestone };