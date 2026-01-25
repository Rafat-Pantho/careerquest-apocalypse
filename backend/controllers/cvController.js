/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * CareerQuest: The Apocalypse
 * CV Controller - The Character Sheet Transmutation Chamber
 * ═══════════════════════════════════════════════════════════════════════════════
 */

const { User } = require('../models');
const PDFDocument = require('pdfkit');
const path = require('path');
const fs = require('fs');

const translateToCorporate = {
  heroClass: {
    'Code Wizard': 'Software Developer',
    'Data Sorcerer': 'Data Scientist',
    'Design Enchanter': 'UI/UX Designer',
    'Merchant Lord': 'Business Analyst',
    'Word Weaver': 'Content Writer',
    'Circuit Shaman': 'Hardware Engineer',
    'Bio Alchemist': 'Biotech Specialist',
    'Law Paladin': 'Legal Professional',
    'Mind Healer': 'Psychology Professional',
    'Number Necromancer': 'Mathematician/Statistician',
    'Unclassed': 'Professional'
  },
  attackType: {
    'technical': 'Technical Skills',
    'soft': 'Soft Skills',
    'language': 'Languages',
    'tool': 'Tools & Software',
    'certification': 'Certifications'
  }
};

// @desc    Get user CV data
// @route   GET /api/cv/data
// @access  Private
exports.getCVData = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Hero not found in the archives.'
      });
    }

    const socialLinks = user.socialLinks || {};
    const location = user.location || {};

    const cvData = {
      personalInfo: {
        name: `${user.firstName} ${user.lastName}`,
        heroName: user.heroName,
        email: user.email,
        phone: user.phone || '',
        location: location.city ? `${location.city}, ${location.country}` : '',
        linkedIn: socialLinks.linkedIn || '',
        github: socialLinks.github || '',
        portfolio: socialLinks.portfolio || ''
      },
      summary: user.heroicSummary || '',
      professionalTitle: translateToCorporate.heroClass[user.heroClass] || user.heroClass,
      skills: (user.specialAttacks || []).map(skill => ({
        name: skill.realSkillName || skill.name,
        fantasyName: skill.name,
        level: skill.powerLevel,
        type: skill.attackType,
        years: skill.yearsWielded,
        certified: skill.isEnchanted
      })),
      experience: (user.battleHistory || []).map(exp => ({
        company: exp.campaignName,
        role: exp.rank,
        department: exp.battalion,
        location: exp.battleground,
        startDate: exp.campaignStart,
        endDate: exp.campaignEnd,
        current: exp.stillFighting,
        achievements: exp.warStories || [],
        technologies: exp.weaponsUsed || []
      })),
      education: (user.trainingGrounds || []).map(edu => ({
        institution: edu.academyName,
        degree: edu.scrollObtained,
        field: edu.disciplineMastered,
        startDate: edu.trainingStart,
        endDate: edu.trainingEnd,
        current: edu.stillTraining,
        gpa: edu.honorScore,
        achievements: edu.achievements || []
      })),
      projects: (user.epicQuests || []).map(proj => ({
        name: proj.questName,
        description: proj.questDescription,
        url: proj.proofOfVictory,
        technologies: proj.weaponsForged || []
      })),
      certifications: (user.enchantments || []).map(cert => ({
        name: cert.enchantmentName,
        issuer: cert.grantedBy,
        date: cert.dateGranted,
        url: cert.proofLink
      }))
    };

    res.status(200).json({
      success: true,
      message: 'Character sheet retrieved from the archives.',
      data: cvData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'The archives are sealed (Server Error).',
      error: error.message
    });
  }
};

// @desc    Update CV data
// @route   PUT /api/cv/data
// @access  Private
exports.updateCVData = async (req, res) => {
  try {
    const {
      personalInfo,
      summary,
      skills,
      experience,
      education,
      projects,
      certifications
    } = req.body;

    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Hero not found.'
      });
    }

    // Update personal info
    if (personalInfo) {
      if (personalInfo.phone) user.phone = personalInfo.phone;

      if (personalInfo.location) {
        const locationParts = personalInfo.location.split(',').map(s => s.trim());
        const currentLoc = user.location || {};
        user.location = {
          ...currentLoc,
          city: locationParts[0] || '',
          country: locationParts[1] || ''
        };
      }

      const currentLinks = user.socialLinks || {};
      const newLinks = { ...currentLinks };

      if (personalInfo.linkedIn) newLinks.linkedIn = personalInfo.linkedIn;
      if (personalInfo.github) newLinks.github = personalInfo.github;
      if (personalInfo.portfolio) newLinks.portfolio = personalInfo.portfolio;

      user.socialLinks = newLinks;
    }

    // Update summary
    if (summary !== undefined) {
      user.heroicSummary = summary;
    }

    // Update skills (Special Attacks)
    if (skills) {
      user.specialAttacks = skills.map(skill => ({
        name: skill.fantasyName || skill.name,
        realSkillName: skill.name,
        powerLevel: skill.level || 50,
        attackType: skill.type || 'technical',
        yearsWielded: skill.years || 0,
        isEnchanted: skill.certified || false
      }));
    }

    // Update experience (Battle History)
    if (experience) {
      user.battleHistory = experience.map(exp => ({
        campaignName: exp.company,
        rank: exp.role,
        battalion: exp.department,
        battleground: exp.location,
        campaignStart: exp.startDate,
        campaignEnd: exp.endDate,
        stillFighting: exp.current || false,
        warStories: exp.achievements || [],
        weaponsUsed: exp.technologies || []
      }));
    }

    // Update education (Training Grounds)
    if (education) {
      user.trainingGrounds = education.map(edu => ({
        academyName: edu.institution,
        scrollObtained: edu.degree,
        disciplineMastered: edu.field,
        trainingStart: edu.startDate,
        trainingEnd: edu.endDate,
        stillTraining: edu.current || false,
        honorScore: edu.gpa,
        achievements: edu.achievements || []
      }));
    }

    // Update projects (Epic Quests)
    if (projects) {
      user.epicQuests = projects.map(proj => ({
        questName: proj.name,
        questDescription: proj.description,
        proofOfVictory: proj.url,
        weaponsForged: proj.technologies || []
      }));
    }

    // Update certifications (Enchantments)
    if (certifications) {
      user.enchantments = certifications.map(cert => ({
        enchantmentName: cert.name,
        grantedBy: cert.issuer,
        dateGranted: cert.date,
        proofLink: cert.url
      }));
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Character sheet updated successfully!',
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to update the character sheet.',
      error: error.message
    });
  }
};

// @desc    Generate PDF CV
// @route   GET /api/cv/generate-pdf
// @access  Private
exports.generatePDF = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Hero not found.'
      });
    }

    // Create PDF document
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=${user.firstName}_${user.lastName}_CV.pdf`);

    // Pipe to response
    doc.pipe(res);

    // Colors
    const primaryColor = '#2563eb';
    const textColor = '#1f2937';
    const lightGray = '#6b7280';

    // Header with name
    doc.fontSize(28)
      .fillColor(primaryColor)
      .text(`${user.firstName} ${user.lastName}`, { align: 'center' });

    // Professional title
    const title = translateToCorporate.heroClass[user.heroClass] || user.heroClass;
    doc.fontSize(14)
      .fillColor(lightGray)
      .text(title, { align: 'center' });

    doc.moveDown(0.5);

    // Contact info line
    const location = user.location || {};
    const contactParts = [];
    if (user.email) contactParts.push(user.email);
    if (user.phone) contactParts.push(user.phone);
    if (location.city) contactParts.push(`${location.city}, ${location.country || ''}`);

    doc.fontSize(10)
      .fillColor(textColor)
      .text(contactParts.join(' • '), { align: 'center' });

    // Social links
    const socialLinks = user.socialLinks || {};
    const socialParts = [];
    if (socialLinks.linkedIn) socialParts.push(`LinkedIn: ${socialLinks.linkedIn}`);
    if (socialLinks.github) socialParts.push(`GitHub: ${socialLinks.github}`);
    if (socialLinks.portfolio) socialParts.push(`Portfolio: ${socialLinks.portfolio}`);

    if (socialParts.length > 0) {
      doc.fontSize(9)
        .fillColor(lightGray)
        .text(socialParts.join(' | '), { align: 'center' });
    }

    doc.moveDown();

    // Horizontal line
    doc.moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor(primaryColor)
      .lineWidth(2)
      .stroke();

    doc.moveDown();

    // Helper function for section headers
    const addSectionHeader = (title) => {
      doc.fontSize(14)
        .fillColor(primaryColor)
        .text(title.toUpperCase(), { underline: false });
      doc.moveTo(50, doc.y + 2)
        .lineTo(545, doc.y + 2)
        .strokeColor('#e5e7eb')
        .lineWidth(1)
        .stroke();
      doc.moveDown(0.5);
    };

    // Professional Summary
    if (user.heroicSummary) {
      addSectionHeader('Professional Summary');
      doc.fontSize(10)
        .fillColor(textColor)
        .text(user.heroicSummary, { align: 'justify' });
      doc.moveDown();
    }

    // Skills
    const specialAttacks = user.specialAttacks || [];
    if (specialAttacks.length > 0) {
      addSectionHeader('Skills');

      // Group skills by type
      const skillsByType = {};
      specialAttacks.forEach(skill => {
        const type = translateToCorporate.attackType[skill.attackType] || 'Other';
        if (!skillsByType[type]) skillsByType[type] = [];
        skillsByType[type].push(skill.realSkillName || skill.name);
      });

      Object.keys(skillsByType).forEach(type => {
        doc.fontSize(10)
          .fillColor(textColor)
          .text(`${type}: `, { continued: true })
          .fillColor(lightGray)
          .text(skillsByType[type].join(', '));
      });
      doc.moveDown();
    }

    // Experience
    const battleHistory = user.battleHistory || [];
    if (battleHistory.length > 0) {
      addSectionHeader('Professional Experience');

      battleHistory.forEach((exp, index) => {
        doc.fontSize(11)
          .fillColor(textColor)
          .text(exp.rank, { continued: true })
          .fillColor(lightGray)
          .text(` at ${exp.campaignName}`);

        const startDate = exp.campaignStart ? new Date(exp.campaignStart).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
        const endDate = exp.stillFighting ? 'Present' : (exp.campaignEnd ? new Date(exp.campaignEnd).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '');

        doc.fontSize(9)
          .fillColor(lightGray)
          .text(`${startDate} - ${endDate}${exp.battleground ? ' | ' + exp.battleground : ''}`);

        if (exp.warStories && exp.warStories.length > 0) {
          exp.warStories.forEach(story => {
            doc.fontSize(10)
              .fillColor(textColor)
              .text(`• ${story}`, { indent: 15 });
          });
        }

        if (index < battleHistory.length - 1) doc.moveDown(0.5);
      });
      doc.moveDown();
    }

    // Education
    const trainingGrounds = user.trainingGrounds || [];
    if (trainingGrounds.length > 0) {
      addSectionHeader('Education');

      trainingGrounds.forEach((edu, index) => {
        doc.fontSize(11)
          .fillColor(textColor)
          .text(edu.scrollObtained, { continued: true })
          .text(` in ${edu.disciplineMastered}`);

        doc.fontSize(10)
          .fillColor(lightGray)
          .text(edu.academyName);

        const startDate = edu.trainingStart ? new Date(edu.trainingStart).getFullYear() : '';
        const endDate = edu.stillTraining ? 'Present' : (edu.trainingEnd ? new Date(edu.trainingEnd).getFullYear() : '');

        doc.fontSize(9)
          .fillColor(lightGray)
          .text(`${startDate} - ${endDate}${edu.honorScore ? ' | GPA: ' + edu.honorScore : ''}`);

        if (index < trainingGrounds.length - 1) doc.moveDown(0.5);
      });
      doc.moveDown();
    }

    // Projects
    const epicQuests = user.epicQuests || [];
    if (epicQuests.length > 0) {
      addSectionHeader('Projects');

      epicQuests.forEach((proj, index) => {
        doc.fontSize(11)
          .fillColor(textColor)
          .text(proj.questName);

        if (proj.questDescription) {
          doc.fontSize(10)
            .fillColor(lightGray)
            .text(proj.questDescription);
        }

        if (proj.weaponsForged && proj.weaponsForged.length > 0) {
          doc.fontSize(9)
            .fillColor(primaryColor)
            .text(`Technologies: ${proj.weaponsForged.join(', ')}`);
        }

        if (proj.proofOfVictory) {
          doc.fontSize(9)
            .fillColor(primaryColor)
            .text(proj.proofOfVictory, { link: proj.proofOfVictory });
        }

        if (index < epicQuests.length - 1) doc.moveDown(0.5);
      });
      doc.moveDown();
    }

    // Certifications
    const enchantments = user.enchantments || [];
    if (enchantments.length > 0) {
      addSectionHeader('Certifications');

      enchantments.forEach(cert => {
        const dateStr = cert.dateGranted ? new Date(cert.dateGranted).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
        doc.fontSize(10)
          .fillColor(textColor)
          .text(`• ${cert.enchantmentName}`, { continued: true })
          .fillColor(lightGray)
          .text(` - ${cert.grantedBy}${dateStr ? ', ' + dateStr : ''}`);
      });
    }

    doc.end();

  } catch (error) {
    console.error('PDF Generation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate the sacred scroll (PDF).',
      error: error.message
    });
  }
};

// @desc    Get CV preview as HTML
// @route   GET /api/cv/preview
// @access  Private
exports.getCVPreview = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Hero not found.'
      });
    }

    const title = translateToCorporate.heroClass[user.heroClass] || user.heroClass;
    const location = user.location || {};
    const socialLinks = user.socialLinks || {};

    res.status(200).json({
      success: true,
      data: {
        name: `${user.firstName} ${user.lastName}`,
        title,
        email: user.email,
        phone: user.phone,
        location: location.city ? `${location.city}, ${location.country}` : '',
        summary: user.heroicSummary,
        skills: user.specialAttacks,
        experience: user.battleHistory,
        education: user.trainingGrounds,
        projects: user.epicQuests,
        certifications: user.enchantments,
        socialLinks: socialLinks
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
