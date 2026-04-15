const Application = require('../models/Application');
const { Bounty } = require('../models/Bounty');

// =============================================================================
// APPLICANT-SIDE ENDPOINTS
// =============================================================================

// -----------------------------------------------------------------------------
// POST /api/applications — Apply for a Bounty
// -----------------------------------------------------------------------------
const applyForBounty = async (req, res) => {
    try {
        const { bountyId, coverMessage, resume } = req.body;

        // ---------- Validate input ----------
        if (!bountyId) {
            return res.status(400).json({ error: 'bountyId is required' });
        }

        // ---------- Check if Bounty exists ----------
        const bounty = await Bounty.findById(bountyId);

        if (!bounty) {
            return res.status(404).json({ error: 'Bounty not found' });
        }

        // ---------- Guard: bounty must be open ----------
        if (bounty.status === 'Closed') {
            return res.status(400).json({
                error: 'This bounty is closed and no longer accepting applications',
            });
        }

        // ---------- Guard: cannot apply to own post ----------
        if (bounty.postedBy.toString() === req.user._id.toString()) {
            return res.status(400).json({
                error: 'You cannot apply to your own post',
            });
        }

        // ---------- Create Application ----------
        const application = await Application.create({
            applicant: req.user._id,
            bounty: bounty._id,
            coverMessage: coverMessage || '',
            resume: resume || '',
        });

        // ---------- Sync: push into bounty.applicants for quick access ----------
        if (!bounty.applicants.includes(req.user._id)) {
            bounty.applicants.push(req.user._id);
            await bounty.save();
        }

        res.status(201).json({
            message: `Successfully applied to "${bounty.title}"`,
            application: {
                _id: application._id,
                bounty: application.bounty,
                status: application.status,
                appliedAt: application.appliedAt,
            },
        });
    } catch (err) {
        // Handle the unique compound index violation gracefully
        if (err.code === 11000) {
            return res.status(409).json({
                error: 'You have already applied to this bounty',
            });
        }
        console.error('applyForBounty error:', err.message);
        res.status(500).json({ error: 'Server error while submitting application' });
    }
};

// -----------------------------------------------------------------------------
// GET /api/applications/my-applications — Get all applications by current user
// -----------------------------------------------------------------------------
const getMyApplications = async (req, res) => {
    try {
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

        const filter = { applicant: req.user._id };

        // Optional status filter
        if (req.query.status && ['pending', 'shortlisted', 'rejected', 'accepted'].includes(req.query.status)) {
            filter.status = req.query.status;
        }

        const [applications, totalResults] = await Promise.all([
            Application.find(filter)
                .sort({ appliedAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('bounty', 'title type reward difficulty status postedBy'),
            Application.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(totalResults / limit);

        res.json({
            applications,
            totalPages,
            currentPage: page,
            totalResults,
        });
    } catch (err) {
        console.error('getMyApplications error:', err.message);
        res.status(500).json({ error: 'Server error while fetching your applications' });
    }
};

// =============================================================================
// RECRUITER / POSTER-SIDE ENDPOINTS
// =============================================================================

// -----------------------------------------------------------------------------
// GET /api/applications/bounty/:bountyId — Get all applications for a bounty
// -----------------------------------------------------------------------------
const getApplicationsForBounty = async (req, res) => {
    try {
        const { bountyId } = req.params;

        // ---------- Find the bounty ----------
        const bounty = await Bounty.findById(bountyId);

        if (!bounty) {
            return res.status(404).json({ error: 'Bounty not found' });
        }

        // ---------- Security: only the poster can view applicants ----------
        if (bounty.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                error: 'Access denied. Only the poster of this bounty can view its applicants.',
            });
        }

        // ---------- Pagination ----------
        const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
        const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

        const filter = { bounty: bountyId };

        // Optional status filter
        if (req.query.status && ['pending', 'shortlisted', 'rejected', 'accepted'].includes(req.query.status)) {
            filter.status = req.query.status;
        }

        const [applications, totalResults] = await Promise.all([
            Application.find(filter)
                .sort({ appliedAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .populate('applicant', 'name email skills title location summary avatarUrl'),
            Application.countDocuments(filter),
        ]);

        const totalPages = Math.ceil(totalResults / limit);

        res.json({
            bountyTitle: bounty.title,
            applications,
            totalPages,
            currentPage: page,
            totalResults,
        });
    } catch (err) {
        console.error('getApplicationsForBounty error:', err.message);
        res.status(500).json({ error: 'Server error while fetching applications' });
    }
};

// -----------------------------------------------------------------------------
// PATCH /api/applications/:id/status — Update application status
// -----------------------------------------------------------------------------
const updateApplicationStatus = async (req, res) => {
    try {
        const { status } = req.body;

        // ---------- Validate status ----------
        const validStatuses = ['pending', 'shortlisted', 'rejected', 'accepted'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
            });
        }

        // ---------- Find the application and populate bounty ----------
        const application = await Application.findById(req.params.id).populate('bounty');

        if (!application) {
            return res.status(404).json({ error: 'Application not found' });
        }

        // ---------- Security: only the bounty poster can change status ----------
        if (application.bounty.postedBy.toString() !== req.user._id.toString()) {
            return res.status(403).json({
                error: 'Access denied. Only the poster of this bounty can update application status.',
            });
        }

        // ---------- Update ----------
        application.status = status;
        await application.save();

        res.json({
            message: `Application status updated to '${status}'`,
            application: {
                _id: application._id,
                applicant: application.applicant,
                bounty: application.bounty._id,
                status: application.status,
                updatedAt: application.updatedAt,
            },
        });
    } catch (err) {
        console.error('updateApplicationStatus error:', err.message);
        res.status(500).json({ error: 'Server error while updating application status' });
    }
};

module.exports = {
    applyForBounty,
    getMyApplications,
    getApplicationsForBounty,
    updateApplicationStatus,
};