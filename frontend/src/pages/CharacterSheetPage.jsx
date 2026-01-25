import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/layout/DashboardLayout';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import { useAuth } from '../context/AuthContext';
import { getAvatarEmoji, getAvatarColor, AVATAR_MAP } from '../utils/avatarUtils';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Hero classes
const HERO_CLASSES = [
  'Code Wizard',
  'Data Sorcerer',
  'Design Enchanter',
  'Merchant Lord',
  'Word Weaver'
];

// Skill categories with fantasy names
const SKILL_TYPES = [
  { value: 'technical', label: 'Technical Spells', icon: '⚡' },
  { value: 'soft', label: 'Charisma Enchantments', icon: '✨' },
  { value: 'language', label: 'Ancient Tongues', icon: '📜' },
  { value: 'tool', label: 'Mystical Artifacts', icon: '🔮' },
  { value: 'certification', label: 'Sacred Scrolls', icon: '📋' }
];

const CharacterSheetPage = () => {
  const { user, token, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  
  // Profile edit state
  const [profileForm, setProfileForm] = useState({
    heroName: '',
    firstName: '',
    lastName: '',
    heroClass: '',
    avatar: ''
  });

  // Form states
  const [summary, setSummary] = useState('');
  const [skills, setSkills] = useState([]);
  const [experience, setExperience] = useState([]);
  const [education, setEducation] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [personalInfo, setPersonalInfo] = useState({
    phone: '',
    location: '',
    linkedIn: '',
    github: '',
    portfolio: ''
  });

  // Modal states
  const [skillModal, setSkillModal] = useState({ open: false, data: null, index: -1 });
  const [expModal, setExpModal] = useState({ open: false, data: null, index: -1 });
  const [eduModal, setEduModal] = useState({ open: false, data: null, index: -1 });
  const [projModal, setProjModal] = useState({ open: false, data: null, index: -1 });
  const [certModal, setCertModal] = useState({ open: false, data: null, index: -1 });

  // Load CV data
  useEffect(() => {
    const fetchCVData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${API_URL}/cv/data`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = response.data.data;
        
        setSummary(data.summary || '');
        setSkills(data.skills || []);
        setExperience(data.experience || []);
        setEducation(data.education || []);
        setProjects(data.projects || []);
        setCertifications(data.certifications || []);
        setPersonalInfo({
          phone: data.personalInfo?.phone || '',
          location: data.personalInfo?.location || '',
          linkedIn: data.personalInfo?.linkedIn || '',
          github: data.personalInfo?.github || '',
          portfolio: data.personalInfo?.portfolio || ''
        });
      } catch (err) {
        console.error('Failed to load CV data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchCVData();
  }, [token]);

  // Initialize profile form when user data is available
  useEffect(() => {
    if (user) {
      setProfileForm({
        heroName: user.heroName || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        heroClass: user.heroClass || 'Code Wizard',
        avatar: user.avatar || 'mage'
      });
    }
  }, [user]);

  // Handle profile update
  const handleProfileUpdate = async () => {
    setSavingProfile(true);
    try {
      const response = await axios.put(`${API_URL}/auth/profile`, profileForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Update user in context
      updateUser(response.data.data);
      setProfileEditOpen(false);
      alert('Profile updated successfully!');
    } catch (err) {
      console.error('Failed to update profile:', err);
      alert('Failed to update profile. Please try again.');
    } finally {
      setSavingProfile(false);
    }
  };

  // Save all CV data
  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put(`${API_URL}/cv/data`, {
        personalInfo,
        summary,
        skills,
        experience,
        education,
        projects,
        certifications
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Character sheet saved to the archives!');
    } catch (err) {
      console.error('Failed to save:', err);
      alert('Failed to save. The archives rejected your scroll!');
    } finally {
      setSaving(false);
    }
  };

  // Generate PDF
  const handleGeneratePDF = async () => {
    setGenerating(true);
    try {
      const response = await axios.get(`${API_URL}/cv/generate-pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const fileName = user?.lastName 
        ? `${user.firstName}_${user.lastName}_CV.pdf` 
        : `${user?.firstName || 'Hero'}_CV.pdf`;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      alert('Failed to transmute the scroll! Try again.');
    } finally {
      setGenerating(false);
    }
  };

  // Skill handlers
  const handleAddSkill = (skillData) => {
    if (skillModal.index >= 0) {
      const updated = [...skills];
      updated[skillModal.index] = skillData;
      setSkills(updated);
    } else {
      setSkills([...skills, skillData]);
    }
    setSkillModal({ open: false, data: null, index: -1 });
  };

  const handleDeleteSkill = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  // Experience handlers
  const handleAddExperience = (expData) => {
    if (expModal.index >= 0) {
      const updated = [...experience];
      updated[expModal.index] = expData;
      setExperience(updated);
    } else {
      setExperience([...experience, expData]);
    }
    setExpModal({ open: false, data: null, index: -1 });
  };

  const handleDeleteExperience = (index) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  // Education handlers
  const handleAddEducation = (eduData) => {
    if (eduModal.index >= 0) {
      const updated = [...education];
      updated[eduModal.index] = eduData;
      setEducation(updated);
    } else {
      setEducation([...education, eduData]);
    }
    setEduModal({ open: false, data: null, index: -1 });
  };

  const handleDeleteEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  // Project handlers
  const handleAddProject = (projData) => {
    if (projModal.index >= 0) {
      const updated = [...projects];
      updated[projModal.index] = projData;
      setProjects(updated);
    } else {
      setProjects([...projects, projData]);
    }
    setProjModal({ open: false, data: null, index: -1 });
  };

  const handleDeleteProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  // Certification handlers
  const handleAddCertification = (certData) => {
    if (certModal.index >= 0) {
      const updated = [...certifications];
      updated[certModal.index] = certData;
      setCertifications(updated);
    } else {
      setCertifications([...certifications, certData]);
    }
    setCertModal({ open: false, data: null, index: -1 });
  };

  const handleDeleteCertification = (index) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '👤' },
    { id: 'skills', label: 'Special Attacks', icon: '⚔️' },
    { id: 'battles', label: 'Battle History', icon: '🏆' },
    { id: 'training', label: 'Training Grounds', icon: '🎓' },
    { id: 'quests', label: 'Epic Quests', icon: '📜' },
    { id: 'enchantments', label: 'Enchantments', icon: '✨' }
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-parchment-400 text-xl">Loading character data from the archives...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-cinzel text-gold-400 mb-2">Character Sheet</h1>
          <p className="text-parchment-300">Forge your professional identity and create your CV</p>
        </div>
        <div className="flex gap-3">
          <Button variant="stone" onClick={handleSave} loading={saving}>
            💾 Save Progress
          </Button>
          <Button variant="gold" onClick={handleGeneratePDF} loading={generating}>
            📄 Generate CV (PDF)
          </Button>
        </div>
      </div>

      {/* Hero Profile Card */}
      <div className="dungeon-card mb-8 border-gold-500/30">
        <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
          <div className="text-center">
            <div className={`w-32 h-32 rounded-full border-4 border-gold-500 shadow-glow-gold overflow-hidden mx-auto flex items-center justify-center bg-gradient-to-br ${getAvatarColor(user?.avatar)}`}>
              <span className="text-5xl">{getAvatarEmoji(user?.avatar)}</span>
            </div>
            <div className="mt-3">
              <span className="px-3 py-1 bg-gold-500/20 border border-gold-500/50 rounded-full text-xs text-gold-400">
                Level {user?.level || 1}
              </span>
            </div>
          </div>
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-parchment-100">{user?.heroName || 'Unknown Hero'}</h2>
                <p className="text-gold-500 font-cinzel text-lg">{user?.heroClass || 'Unclassed'}</p>
                <p className="text-parchment-400 text-sm mt-1">
                  {user?.firstName}{user?.lastName ? ` ${user.lastName}` : ''}
                </p>
              </div>
              <button 
                onClick={() => setProfileEditOpen(true)}
                className="px-3 py-1.5 bg-dungeon-700 hover:bg-dungeon-600 border border-dungeon-500 rounded-lg text-parchment-300 text-sm transition-colors whitespace-nowrap"
              >
                ✏️ Edit
              </button>
            </div>
            <div className="flex flex-wrap gap-4 mt-4 justify-center md:justify-start text-sm">
              <span className="text-parchment-300">✉️ {user?.email}</span>
              {personalInfo.phone && <span className="text-parchment-300">📱 {personalInfo.phone}</span>}
              {personalInfo.location && <span className="text-parchment-300">📍 {personalInfo.location}</span>}
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-gold-400">{user?.experiencePoints || 0}</div>
            <div className="text-parchment-500 text-xs">Experience Points</div>
          </div>
        </div>
      </div>

      {/* Profile Edit Modal */}
      <Modal
        isOpen={profileEditOpen}
        onClose={() => setProfileEditOpen(false)}
        title="Edit Hero Profile"
      >
        <div className="space-y-4">
          {/* Avatar Selection */}
          <div>
            <label className="block text-parchment-300 text-sm font-bold mb-2">Avatar</label>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
              {Object.entries(AVATAR_MAP).map(([id, avatar]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setProfileForm({ ...profileForm, avatar: id })}
                  className={`p-2 rounded-lg transition-all ${
                    profileForm.avatar === id
                      ? `bg-gradient-to-br ${avatar.color} ring-2 ring-gold-400`
                      : 'bg-dungeon-700 hover:bg-dungeon-600'
                  }`}
                >
                  <div className="text-2xl">{avatar.emoji}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Hero Name */}
          <div>
            <label className="block text-parchment-300 text-sm font-bold mb-2">Hero Name</label>
            <input
              type="text"
              value={profileForm.heroName}
              onChange={(e) => setProfileForm({ ...profileForm, heroName: e.target.value })}
              className="w-full bg-dungeon-900 border border-dungeon-600 rounded p-2 text-parchment-100 focus:border-gold-500"
              placeholder="Your legendary title"
            />
          </div>

          {/* First Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-parchment-300 text-sm font-bold mb-2">First Name</label>
              <input
                type="text"
                value={profileForm.firstName}
                onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                className="w-full bg-dungeon-900 border border-dungeon-600 rounded p-2 text-parchment-100 focus:border-gold-500"
                placeholder="First name"
              />
            </div>
            <div>
              <label className="block text-parchment-300 text-sm font-bold mb-2">Last Name</label>
              <input
                type="text"
                value={profileForm.lastName}
                onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                className="w-full bg-dungeon-900 border border-dungeon-600 rounded p-2 text-parchment-100 focus:border-gold-500"
                placeholder="Last name (optional)"
              />
            </div>
          </div>

          {/* Hero Class */}
          <div>
            <label className="block text-parchment-300 text-sm font-bold mb-2">Hero Class</label>
            <select
              value={profileForm.heroClass}
              onChange={(e) => setProfileForm({ ...profileForm, heroClass: e.target.value })}
              className="w-full bg-dungeon-900 border border-dungeon-600 rounded p-2 text-parchment-100 focus:border-gold-500 cursor-pointer"
            >
              {HERO_CLASSES.map(cls => (
                <option key={cls} value={cls}>{cls}</option>
              ))}
            </select>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button variant="stone" onClick={() => setProfileEditOpen(false)} fullWidth>
              Cancel
            </Button>
            <Button variant="gold" onClick={handleProfileUpdate} loading={savingProfile} fullWidth>
              Save Changes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 mb-6 border-b border-dungeon-700 pb-4">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-cinzel text-sm transition-all ${
              activeTab === tab.id
                ? 'bg-gold-500/20 text-gold-400 border border-gold-500/50'
                : 'text-parchment-400 hover:bg-dungeon-800'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-2 gap-6">
            <div className="dungeon-card">
              <h3 className="text-xl font-cinzel text-gold-400 mb-4">📝 Heroic Summary</h3>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Describe your heroic journey and professional aspirations... (This becomes your professional summary on the CV)"
                className="w-full h-40 bg-dungeon-900 border border-dungeon-600 rounded p-3 text-parchment-100 resize-none focus:border-gold-500"
              />
            </div>
            <div className="dungeon-card">
              <h3 className="text-xl font-cinzel text-gold-400 mb-4">🔗 Contact Portals</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-parchment-400 text-sm">Phone</label>
                  <input
                    type="tel"
                    value={personalInfo.phone}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, phone: e.target.value })}
                    placeholder="+880 1XXX-XXXXXX"
                    className="w-full bg-dungeon-900 border border-dungeon-600 rounded p-2 text-parchment-100"
                  />
                </div>
                <div>
                  <label className="text-parchment-400 text-sm">Location</label>
                  <input
                    type="text"
                    value={personalInfo.location}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                    placeholder="Dhaka, Bangladesh"
                    className="w-full bg-dungeon-900 border border-dungeon-600 rounded p-2 text-parchment-100"
                  />
                </div>
                <div>
                  <label className="text-parchment-400 text-sm">LinkedIn</label>
                  <input
                    type="url"
                    value={personalInfo.linkedIn}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, linkedIn: e.target.value })}
                    placeholder="https://linkedin.com/in/yourname"
                    className="w-full bg-dungeon-900 border border-dungeon-600 rounded p-2 text-parchment-100"
                  />
                </div>
                <div>
                  <label className="text-parchment-400 text-sm">GitHub</label>
                  <input
                    type="url"
                    value={personalInfo.github}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, github: e.target.value })}
                    placeholder="https://github.com/yourname"
                    className="w-full bg-dungeon-900 border border-dungeon-600 rounded p-2 text-parchment-100"
                  />
                </div>
                <div>
                  <label className="text-parchment-400 text-sm">Portfolio</label>
                  <input
                    type="url"
                    value={personalInfo.portfolio}
                    onChange={(e) => setPersonalInfo({ ...personalInfo, portfolio: e.target.value })}
                    placeholder="https://yourportfolio.com"
                    className="w-full bg-dungeon-900 border border-dungeon-600 rounded p-2 text-parchment-100"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Skills Tab */}
        {activeTab === 'skills' && (
          <div className="dungeon-card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-cinzel text-gold-400">⚔️ Special Attacks (Skills)</h3>
              <Button variant="mana" size="sm" onClick={() => setSkillModal({ open: true, data: null, index: -1 })}>
                + Learn New Skill
              </Button>
            </div>
            {skills.length === 0 ? (
              <p className="text-parchment-500 text-center py-8">No skills mastered yet. Begin your training!</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                {skills.map((skill, index) => (
                  <div key={index} className="bg-dungeon-900 border border-dungeon-700 rounded-lg p-4 group hover:border-gold-500/50 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-parchment-100 font-bold">{skill.name}</h4>
                        <p className="text-parchment-500 text-xs">{skill.fantasyName || skill.name}</p>
                      </div>
                      <span className="text-gold-400 text-sm">Lvl {skill.level}</span>
                    </div>
                    <div className="w-full bg-dungeon-950 h-2 rounded-full mb-2">
                      <div 
                        className="bg-gradient-to-r from-gold-600 to-gold-400 h-full rounded-full"
                        style={{ width: `${skill.level}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-parchment-500">
                        {SKILL_TYPES.find(t => t.value === skill.type)?.icon} {SKILL_TYPES.find(t => t.value === skill.type)?.label || skill.type}
                      </span>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button 
                          onClick={() => setSkillModal({ open: true, data: skill, index })}
                          className="text-mana-400 hover:text-mana-300 text-xs"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteSkill(index)}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Experience Tab */}
        {activeTab === 'battles' && (
          <div className="dungeon-card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-cinzel text-gold-400">🏆 Battle History (Experience)</h3>
              <Button variant="mana" size="sm" onClick={() => setExpModal({ open: true, data: null, index: -1 })}>
                + Add Campaign
              </Button>
            </div>
            {experience.length === 0 ? (
              <p className="text-parchment-500 text-center py-8">No battles fought yet. Seek your first campaign!</p>
            ) : (
              <div className="space-y-4">
                {experience.map((exp, index) => (
                  <div key={index} className="bg-dungeon-900 border border-dungeon-700 rounded-lg p-4 group hover:border-gold-500/50 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-parchment-100 font-bold text-lg">{exp.role}</h4>
                        <p className="text-gold-500">{exp.company}</p>
                        <p className="text-parchment-500 text-sm">
                          {exp.startDate ? new Date(exp.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''} 
                          {' - '}
                          {exp.current ? 'Present' : (exp.endDate ? new Date(exp.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '')}
                          {exp.location && ` • ${exp.location}`}
                        </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button 
                          onClick={() => setExpModal({ open: true, data: exp, index })}
                          className="text-mana-400 hover:text-mana-300 text-sm"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteExperience(index)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    {exp.achievements && exp.achievements.length > 0 && (
                      <ul className="mt-3 space-y-1">
                        {exp.achievements.map((achievement, i) => (
                          <li key={i} className="text-parchment-300 text-sm flex items-start gap-2">
                            <span className="text-gold-500">•</span> {achievement}
                          </li>
                        ))}
                      </ul>
                    )}
                    {exp.technologies && exp.technologies.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {exp.technologies.map((tech, i) => (
                          <span key={i} className="px-2 py-1 bg-dungeon-800 rounded text-xs text-mana-400">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Education Tab */}
        {activeTab === 'training' && (
          <div className="dungeon-card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-cinzel text-gold-400">🎓 Training Grounds (Education)</h3>
              <Button variant="mana" size="sm" onClick={() => setEduModal({ open: true, data: null, index: -1 })}>
                + Add Training
              </Button>
            </div>
            {education.length === 0 ? (
              <p className="text-parchment-500 text-center py-8">No formal training recorded. Add your education!</p>
            ) : (
              <div className="space-y-4">
                {education.map((edu, index) => (
                  <div key={index} className="bg-dungeon-900 border border-dungeon-700 rounded-lg p-4 group hover:border-gold-500/50 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-parchment-100 font-bold text-lg">{edu.degree}</h4>
                        <p className="text-gold-500">{edu.field}</p>
                        <p className="text-parchment-400">{edu.institution}</p>
                        <p className="text-parchment-500 text-sm">
                          {edu.startDate ? new Date(edu.startDate).getFullYear() : ''} 
                          {' - '}
                          {edu.current ? 'Present' : (edu.endDate ? new Date(edu.endDate).getFullYear() : '')}
                          {edu.gpa && ` • GPA: ${edu.gpa}`}
                        </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button 
                          onClick={() => setEduModal({ open: true, data: edu, index })}
                          className="text-mana-400 hover:text-mana-300 text-sm"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteEducation(index)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Projects Tab */}
        {activeTab === 'quests' && (
          <div className="dungeon-card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-cinzel text-gold-400">📜 Epic Quests (Projects)</h3>
              <Button variant="mana" size="sm" onClick={() => setProjModal({ open: true, data: null, index: -1 })}>
                + Add Project
              </Button>
            </div>
            {projects.length === 0 ? (
              <p className="text-parchment-500 text-center py-8">No epic quests completed yet. Document your projects!</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {projects.map((proj, index) => (
                  <div key={index} className="bg-dungeon-900 border border-dungeon-700 rounded-lg p-4 group hover:border-gold-500/50 transition-all">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-parchment-100 font-bold">{proj.name}</h4>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button 
                          onClick={() => setProjModal({ open: true, data: proj, index })}
                          className="text-mana-400 hover:text-mana-300 text-xs"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteProject(index)}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-parchment-400 text-sm mb-3">{proj.description}</p>
                    {proj.url && (
                      <a href={proj.url} target="_blank" rel="noopener noreferrer" className="text-mana-400 text-sm hover:underline">
                        🔗 View Project
                      </a>
                    )}
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {proj.technologies.map((tech, i) => (
                          <span key={i} className="px-2 py-1 bg-dungeon-800 rounded text-xs text-gold-400">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Certifications Tab */}
        {activeTab === 'enchantments' && (
          <div className="dungeon-card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-cinzel text-gold-400">✨ Enchantments (Certifications)</h3>
              <Button variant="mana" size="sm" onClick={() => setCertModal({ open: true, data: null, index: -1 })}>
                + Add Certification
              </Button>
            </div>
            {certifications.length === 0 ? (
              <p className="text-parchment-500 text-center py-8">No enchantments acquired yet. Add your certifications!</p>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {certifications.map((cert, index) => (
                  <div key={index} className="bg-dungeon-900 border border-dungeon-700 rounded-lg p-4 group hover:border-gold-500/50 transition-all flex justify-between">
                    <div>
                      <h4 className="text-parchment-100 font-bold">{cert.name}</h4>
                      <p className="text-gold-500 text-sm">{cert.issuer}</p>
                      {cert.date && (
                        <p className="text-parchment-500 text-xs">
                          {new Date(cert.date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </p>
                      )}
                      {cert.url && (
                        <a href={cert.url} target="_blank" rel="noopener noreferrer" className="text-mana-400 text-xs hover:underline">
                          View Certificate
                        </a>
                      )}
                    </div>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 h-fit">
                      <button 
                        onClick={() => setCertModal({ open: true, data: cert, index })}
                        className="text-mana-400 hover:text-mana-300 text-xs"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteCertification(index)}
                        className="text-red-400 hover:text-red-300 text-xs"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Skill Modal */}
      <Modal
        isOpen={skillModal.open}
        onClose={() => setSkillModal({ open: false, data: null, index: -1 })}
        title={skillModal.index >= 0 ? "Edit Special Attack" : "Learn New Special Attack"}
      >
        <SkillForm 
          initialData={skillModal.data}
          onSubmit={handleAddSkill}
          onCancel={() => setSkillModal({ open: false, data: null, index: -1 })}
        />
      </Modal>

      {/* Experience Modal */}
      <Modal
        isOpen={expModal.open}
        onClose={() => setExpModal({ open: false, data: null, index: -1 })}
        title={expModal.index >= 0 ? "Edit Battle Campaign" : "Add Battle Campaign"}
      >
        <ExperienceForm 
          initialData={expModal.data}
          onSubmit={handleAddExperience}
          onCancel={() => setExpModal({ open: false, data: null, index: -1 })}
        />
      </Modal>

      {/* Education Modal */}
      <Modal
        isOpen={eduModal.open}
        onClose={() => setEduModal({ open: false, data: null, index: -1 })}
        title={eduModal.index >= 0 ? "Edit Training Record" : "Add Training Record"}
      >
        <EducationForm 
          initialData={eduModal.data}
          onSubmit={handleAddEducation}
          onCancel={() => setEduModal({ open: false, data: null, index: -1 })}
        />
      </Modal>

      {/* Project Modal */}
      <Modal
        isOpen={projModal.open}
        onClose={() => setProjModal({ open: false, data: null, index: -1 })}
        title={projModal.index >= 0 ? "Edit Epic Quest" : "Add Epic Quest"}
      >
        <ProjectForm 
          initialData={projModal.data}
          onSubmit={handleAddProject}
          onCancel={() => setProjModal({ open: false, data: null, index: -1 })}
        />
      </Modal>

      {/* Certification Modal */}
      <Modal
        isOpen={certModal.open}
        onClose={() => setCertModal({ open: false, data: null, index: -1 })}
        title={certModal.index >= 0 ? "Edit Enchantment" : "Add Enchantment"}
      >
        <CertificationForm 
          initialData={certModal.data}
          onSubmit={handleAddCertification}
          onCancel={() => setCertModal({ open: false, data: null, index: -1 })}
        />
      </Modal>
    </DashboardLayout>
  );
};

// Form Components
const SkillForm = ({ initialData, onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    name: initialData?.name || '',
    fantasyName: initialData?.fantasyName || '',
    level: initialData?.level || 50,
    type: initialData?.type || 'technical',
    years: initialData?.years || 0,
    certified: initialData?.certified || false
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-parchment-300 text-sm">Skill Name (Corporate)</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g., Python, React, Project Management"
          className="w-full bg-dungeon-900 border border-dungeon-600 rounded p-2 text-parchment-100"
          required
        />
      </div>
      <div>
        <label className="text-parchment-300 text-sm">Fantasy Name (Optional)</label>
        <input
          type="text"
          value={form.fantasyName}
          onChange={(e) => setForm({ ...form, fantasyName: e.target.value })}
          placeholder="e.g., Serpent's Tongue, Arcane Scripting"
          className="w-full bg-dungeon-900 border border-dungeon-600 rounded p-2 text-parchment-100"
        />
      </div>
      <div>
        <label className="text-parchment-300 text-sm">Power Level: {form.level}%</label>
        <input
          type="range"
          min="1"
          max="100"
          value={form.level}
          onChange={(e) => setForm({ ...form, level: parseInt(e.target.value) })}
          className="w-full"
        />
      </div>
      <div>
        <label className="text-parchment-300 text-sm">Skill Type</label>
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          className="w-full bg-dungeon-900 border border-dungeon-600 rounded p-2 text-parchment-100"
        >
          {SKILL_TYPES.map(type => (
            <option key={type.value} value={type.value}>{type.icon} {type.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="text-parchment-300 text-sm">Years of Experience</label>
        <input
          type="number"
          min="0"
          value={form.years}
          onChange={(e) => setForm({ ...form, years: parseInt(e.target.value) || 0 })}
          className="w-full bg-dungeon-900 border border-dungeon-600 rounded p-2 text-parchment-100"
        />
      </div>
      <label className="flex items-center gap-2 text-parchment-300">
        <input
          type="checkbox"
          checked={form.certified}
          onChange={(e) => setForm({ ...form, certified: e.target.checked })}
          className="rounded"
        />
        Certified / Verified
      </label>
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="gold" className="flex-1">Save Skill</Button>
      </div>
    </form>
  );
};

const ExperienceForm = ({ initialData, onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    company: initialData?.company || '',
    role: initialData?.role || '',
    department: initialData?.department || '',
    location: initialData?.location || '',
    startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
    endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
    current: initialData?.current || false,
    achievements: initialData?.achievements?.join('\n') || '',
    technologies: initialData?.technologies?.join(', ') || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      achievements: form.achievements.split('\n').filter(a => a.trim()),
      technologies: form.technologies.split(',').map(t => t.trim()).filter(t => t)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-parchment-300 text-sm">Company / Guild Name</label>
          <input
            type="text"
            value={form.company}
            onChange={(e) => setForm({ ...form, company: e.target.value })}
            className="w-full bg-dungeon-900 border border-dungeon-600 rounded p-2 text-parchment-100"
            required
          />
        </div>
        <div>
          <label className="text-parchment-300 text-sm">Role / Rank</label>
          <input
            type="text"
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            className="w-full bg-dungeon-900 border border-dungeon-600 rounded p-2 text-parchment-100"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-parchment-300 text-sm">Department</label>
          <input
            type="text"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            className="w-full bg-dungeon-900 border border-dungeon-600 rounded p-2 text-parchment-100"
          />
        </div>
        <div>
          <label className="text-parchment-300 text-sm">Location</label>
          <input
            type="text"
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
            className="w-full bg-dungeon-900 border border-dungeon-600 rounded p-2 text-parchment-100"
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-parchment-300 text-sm">Start Date</label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className="w-full bg-dungeon-900 border border-dungeon-600 rounded p-2 text-parchment-100"
            required
          />
        </div>
        <div>
          <label className="text-parchment-300 text-sm">End Date</label>
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            disabled={form.current}
            className="w-full bg-dungeon-900 border border-dungeon-600 rounded p-2 text-parchment-100 disabled:opacity-50"
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-parchment-300">
        <input
          type="checkbox"
          checked={form.current}
          onChange={(e) => setForm({ ...form, current: e.target.checked })}
          className="rounded"
        />
        Currently working here
      </label>
      <div>
        <label className="text-parchment-300 text-sm">Achievements (one per line)</label>
        <textarea
          value={form.achievements}
          onChange={(e) => setForm({ ...form, achievements: e.target.value })}
          placeholder="Led a team of 5 developers&#10;Increased sales by 20%&#10;..."
          className="w-full h-24 bg-dungeon-900 border border-dungeon-600 rounded p-2 text-parchment-100 resize-none"
        />
      </div>
      <div>
        <label className="text-parchment-300 text-sm">Technologies Used (comma separated)</label>
        <input
          type="text"
          value={form.technologies}
          onChange={(e) => setForm({ ...form, technologies: e.target.value })}
          placeholder="React, Node.js, MongoDB"
          className="w-full bg-dungeon-900 border border-dungeon-600 rounded p-2 text-parchment-100"
        />
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="gold" className="flex-1">Save Experience</Button>
      </div>
    </form>
  );
};

const EducationForm = ({ initialData, onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    institution: initialData?.institution || '',
    degree: initialData?.degree || '',
    field: initialData?.field || '',
    startDate: initialData?.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
    endDate: initialData?.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
    current: initialData?.current || false,
    gpa: initialData?.gpa || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-parchment-300 text-sm">Institution / Academy</label>
        <input
          type="text"
          value={form.institution}
          onChange={(e) => setForm({ ...form, institution: e.target.value })}
          placeholder="e.g., Islamic University of Technology"
          className="w-full bg-dungeon-900 border border-dungeon-600 rounded p-2 text-parchment-100"
          required
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-parchment-300 text-sm">Degree</label>
          <input
            type="text"
            value={form.degree}
            onChange={(e) => setForm({ ...form, degree: e.target.value })}
            placeholder="e.g., Bachelor of Science"
            className="w-full bg-dungeon-900 border border-dungeon-600 rounded p-2 text-parchment-100"
            required
          />
        </div>
        <div>
          <label className="text-parchment-300 text-sm">Field of Study</label>
          <input
            type="text"
            value={form.field}
            onChange={(e) => setForm({ ...form, field: e.target.value })}
            placeholder="e.g., Computer Science"
            className="w-full bg-dungeon-900 border border-dungeon-600 rounded p-2 text-parchment-100"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-parchment-300 text-sm">Start Year</label>
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className="w-full bg-dungeon-900 border border-dungeon-600 rounded p-2 text-parchment-100"
            required
          />
        </div>
        <div>
          <label className="text-parchment-300 text-sm">End Year</label>
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            disabled={form.current}
            className="w-full bg-dungeon-900 border border-dungeon-600 rounded p-2 text-parchment-100 disabled:opacity-50"
          />
        </div>
      </div>
      <label className="flex items-center gap-2 text-parchment-300">
        <input
          type="checkbox"
          checked={form.current}
          onChange={(e) => setForm({ ...form, current: e.target.checked })}
          className="rounded"
        />
        Currently studying here
      </label>
      <div>
        <label className="text-parchment-300 text-sm">GPA / Grade (Optional)</label>
        <input
          type="text"
          value={form.gpa}
          onChange={(e) => setForm({ ...form, gpa: e.target.value })}
          placeholder="e.g., 3.8/4.0"
          className="w-full bg-dungeon-900 border border-dungeon-600 rounded p-2 text-parchment-100"
        />
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="gold" className="flex-1">Save Education</Button>
      </div>
    </form>
  );
};

const ProjectForm = ({ initialData, onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    url: initialData?.url || '',
    technologies: initialData?.technologies?.join(', ') || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      technologies: form.technologies.split(',').map(t => t.trim()).filter(t => t)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-parchment-300 text-sm">Project Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g., E-commerce Platform"
          className="w-full bg-dungeon-900 border border-dungeon-600 rounded p-2 text-parchment-100"
          required
        />
      </div>
      <div>
        <label className="text-parchment-300 text-sm">Description</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="Describe what this project does and your role..."
          className="w-full h-24 bg-dungeon-900 border border-dungeon-600 rounded p-2 text-parchment-100 resize-none"
          required
        />
      </div>
      <div>
        <label className="text-parchment-300 text-sm">Project URL (Optional)</label>
        <input
          type="url"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          placeholder="https://github.com/..."
          className="w-full bg-dungeon-900 border border-dungeon-600 rounded p-2 text-parchment-100"
        />
      </div>
      <div>
        <label className="text-parchment-300 text-sm">Technologies (comma separated)</label>
        <input
          type="text"
          value={form.technologies}
          onChange={(e) => setForm({ ...form, technologies: e.target.value })}
          placeholder="React, Node.js, MongoDB"
          className="w-full bg-dungeon-900 border border-dungeon-600 rounded p-2 text-parchment-100"
        />
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="gold" className="flex-1">Save Project</Button>
      </div>
    </form>
  );
};

const CertificationForm = ({ initialData, onSubmit, onCancel }) => {
  const [form, setForm] = useState({
    name: initialData?.name || '',
    issuer: initialData?.issuer || '',
    date: initialData?.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
    url: initialData?.url || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-parchment-300 text-sm">Certification Name</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g., AWS Solutions Architect"
          className="w-full bg-dungeon-900 border border-dungeon-600 rounded p-2 text-parchment-100"
          required
        />
      </div>
      <div>
        <label className="text-parchment-300 text-sm">Issuing Organization</label>
        <input
          type="text"
          value={form.issuer}
          onChange={(e) => setForm({ ...form, issuer: e.target.value })}
          placeholder="e.g., Amazon Web Services"
          className="w-full bg-dungeon-900 border border-dungeon-600 rounded p-2 text-parchment-100"
          required
        />
      </div>
      <div>
        <label className="text-parchment-300 text-sm">Date Obtained</label>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="w-full bg-dungeon-900 border border-dungeon-600 rounded p-2 text-parchment-100"
        />
      </div>
      <div>
        <label className="text-parchment-300 text-sm">Certificate URL (Optional)</label>
        <input
          type="url"
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          placeholder="https://..."
          className="w-full bg-dungeon-900 border border-dungeon-600 rounded p-2 text-parchment-100"
        />
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="gold" className="flex-1">Save Certification</Button>
      </div>
    </form>
  );
};

export default CharacterSheetPage;
