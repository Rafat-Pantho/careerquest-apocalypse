const express = require('express');
const router = express.Router();

// Middleware
const { protect } = require('../middleware/auth');

// Controller
const {
    applyForBounty,
    getMyApplications,
    getApplicationsForBounty,
    updateApplicationStatus,
} = require('../controllers/applicationController');

// All routes require authentication
router.use(protect);

// -----------------------------------------------------------------------------
// Applicant Routes
// -----------------------------------------------------------------------------

// POST   /api/applications           — Submit an application
router.post('/', applyForBounty);

// GET    /api/applications/my-applications — View my submitted applications
router.get('/my-applications', getMyApplications);

// -----------------------------------------------------------------------------
// Recruiter / Poster Routes
// -----------------------------------------------------------------------------

// GET    /api/applications/bounty/:bountyId — View applicants for a specific bounty
router.get('/bounty/:bountyId', getApplicationsForBounty);

// PATCH  /api/applications/:id/status — Update an application's status
router.patch('/:id/status', updateApplicationStatus);

module.exports = router;