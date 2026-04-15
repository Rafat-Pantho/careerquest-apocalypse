import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Download, UploadCloud, Cpu, User, Briefcase,
    Mail, Phone, MapPin, Plus, Trash2, ArrowLeft,
    Camera, RefreshCw, FileText, Share2, Save
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const Profile = () => {
    const navigate = useNavigate();
    const resumeRef = useRef(null);

    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    
    // State for Profile Data
    const [profile, setProfile] = useState({
        photo: storedUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${storedUser.name || 'user'}`,
        full_name: storedUser.name || '',
        role_title: storedUser.title || '',
        email: storedUser.email || '',
        phone: storedUser.phone || '',
        location: storedUser.location || '',
        summary: storedUser.summary || '',
        skills: storedUser.skills || [],
        experience: storedUser.experience?.map((exp, i) => ({ ...exp, id: exp.id || i + 1 })) || [],
        education: storedUser.education?.map((edu, i) => ({ ...edu, id: edu.id || i + 1 })) || [],
    });

    const [isParsing, setIsParsing] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [activeTab, setActiveTab] = useState('edit'); // 'edit' | 'preview'

    // Handle Photo Upload
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfile({ ...profile, photo: reader.result });
            };
            reader.readAsDataURL(file);
        }
    };

    // Handle Resume Parsing (Auto-Fill)
    const handleResumeParse = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsParsing(true);
        const formData = new FormData();
        formData.append('resume', file);

        try {
            const response = await fetch('http://localhost:8000/api/resume/parse', {
                method: 'POST', body: formData
            });
            const result = await response.json();

            if (result.success) {
                const data = result.data;
                setProfile(prev => ({
                    ...prev,
                    full_name: data.full_name || prev.full_name,
                    email: data.email || prev.email,
                    phone: data.phone || prev.phone,
                    summary: data.summary || prev.summary,
                    skills: data.skills || prev.skills,
                    experience: data.experience?.map((exp, i) => ({ ...exp, id: i + 10 })) || prev.experience,
                    education: data.education?.map((edu, i) => ({ ...edu, id: i + 10 })) || prev.education,
                }));
                alert('Profile updated from Resume!');
            } else {
                alert('Failed to parse: ' + (result.details || result.error));
            }
        } catch (err) {
            console.error(err);
            alert('Connection failed.');
        } finally {
            setIsParsing(false);
        }
    };

    // Fetch user profile on load
    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem('token');
            if (!token) return;
            try {
                const response = await fetch('http://localhost:8000/api/profile/me', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const result = await response.json();
                if (result.success && result.data) {
                    const data = result.data;
                    setProfile(prev => ({
                        ...prev,
                        photo: data.photo || prev.photo,
                        full_name: data.full_name || prev.full_name,
                        role_title: data.role_title || prev.role_title,
                        email: data.email || prev.email,
                        phone: data.phone || prev.phone,
                        location: data.location || prev.location,
                        summary: data.summary || prev.summary,
                        skills: data.skills?.length ? data.skills : prev.skills,
                        experience: data.experience?.map((e, i) => ({ ...e, id: e.id || i + 1 })) || prev.experience,
                        education: data.education?.map((e, i) => ({ ...e, id: e.id || i + 1 })) || prev.education,
                    }));
                }
            } catch (err) {
                console.error('Failed to load profile:', err);
            }
        };
        fetchProfile();
    }, []);

    // Save Profile
    const handleSaveProfile = async () => {
        const token = localStorage.getItem('token');
        if (!token) { alert('You must be logged in to save.'); return; }
        try {
            const response = await fetch('http://localhost:8000/api/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(profile)
            });
            const result = await response.json();
            if (result.success) {
                // Also update localStorage so navbar reflects changes immediately
                const stored = JSON.parse(localStorage.getItem('user') || '{}');
                localStorage.setItem('user', JSON.stringify({
                    ...stored,
                    name: profile.full_name,
                    title: profile.role_title,
                    email: profile.email,
                    phone: profile.phone,
                    location: profile.location,
                    summary: profile.summary,
                    skills: profile.skills,
                    avatarUrl: profile.photo,
                }));
                alert('Profile saved!');
            } else {
                alert('Save failed: ' + (result.error || 'Unknown error'));
            }
        } catch (err) {
            console.error('Save failed:', err);
            alert('Connection error while saving.');
        }
    };

    // Generate PDF (Robust Clone Method)
    const generatePDF = async () => {
        if (!resumeRef.current || isExporting) return;

        try {
            setIsExporting(true);
            console.log("Starting PDF generation...");
            const element = resumeRef.current;
            
            // 1. Configuration for html2canvas
            const options = {
                scale: 2,
                useCORS: true,
                allowTaint: true,
                logging: false, // Set to true if still failing
                backgroundColor: '#ffffff',
                imageTimeout: 15000, // Wait up to 15s for images
                onclone: (clonedDoc) => {
                    const clonedElement = clonedDoc.getElementById('resume-preview');
                    if (clonedElement) {
                        // Critical: Reset transforms and ensure visibility in the clone
                        clonedElement.style.transform = 'none';
                        clonedElement.style.margin = '0';
                        clonedElement.style.padding = '0';
                        clonedElement.style.left = '0';
                        clonedElement.style.top = '0';
                    }
                }
            };

            // 2. Capture Canvas
            const canvas = await html2canvas(element, options);
            
            // 3. Create PDF
            const imgData = canvas.toDataURL('image/png', 1.0);
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            // Handle multi-page if necessary (basic logic)
            let heightLeft = pdfHeight;
            let position = 0;
            const pageHeight = pdf.internal.pageSize.getHeight();

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
            heightLeft -= pageHeight;

            // Basic multi-page support
            while (heightLeft >= 0) {
                position = heightLeft - pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight, undefined, 'FAST');
                heightLeft -= pageHeight;
            }
            
            const fileName = `${profile.full_name.replace(/\s+/g, '_')}_Resume.pdf`;
            pdf.save(fileName);
            console.log("PDF saved successfully");

        } catch (err) {
            console.error("PDF Export Failed:", err);
            alert(`Failed to generate PDF: ${err.message}. This usually happens due to browser memory limits or CORS issues with images.`);
        } finally {
            setIsExporting(false);
        }
    };



    return (
        <div className="min-h-screen bg-navy-950 text-white font-sans pb-20 overflow-x-hidden">
            {/* Navbar */}
            <nav className="fixed w-full bg-navy-950/80 backdrop-blur-xl z-50 border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/student-dashboard')}>
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-cyan-500/20">CQ</div>
                        <span className="text-xl font-bold tracking-tight text-white font-display">Career<span className="text-cyan-400">Hub</span></span>
                    </div>
                    <button onClick={() => navigate('/student-dashboard')} className="text-slate-400 hover:text-white transition flex items-center gap-2 text-sm font-medium">
                        <ArrowLeft size={16} /> Dashboard
                    </button>
                </div>
            </nav>

            <main className="pt-28 px-6 max-w-7xl mx-auto">
                {/* 1. HERO PROFILE SECTION */}
                <div className="mb-12 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-purple-500/10 blur-3xl rounded-full -z-10"></div>

                    <div className="flex flex-col md:flex-row items-center gap-8 glass-card p-8 rounded-3xl border border-white/10">
                        {/* Photo Section */}
                        <div className="relative group">
                            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-navy-800 shadow-2xl relative">
                                <img src={profile.photo} alt="Profile" className="w-full h-full object-cover" />
                            </div>
                            <label className="absolute bottom-2 right-2 p-2 bg-cyan-500 hover:bg-cyan-400 text-navy-950 rounded-full cursor-pointer shadow-lg transition transform group-hover:scale-110">
                                <Camera size={20} />
                                <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                            </label>
                        </div>

                        {/* Info & Stats */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-4xl font-bold text-white mb-2">{profile.full_name}</h1>
                            <p className="text-xl text-cyan-400 mb-4">{profile.role_title}</p>

                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-400 text-sm mb-6">
                                {profile.email && <span className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full"><Mail size={14} /> {profile.email}</span>}
                                {profile.phone && <span className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full"><Phone size={14} /> {profile.phone}</span>}
                                {profile.location && <span className="flex items-center gap-1 bg-white/5 px-3 py-1 rounded-full"><MapPin size={14} /> {profile.location}</span>}
                            </div>
                        </div>

                        {/* Helper Actions */}
                        <div className="flex flex-col gap-3 min-w-[200px]">
                            <label className="btn-secondary w-full cursor-pointer flex items-center justify-center gap-2">
                                {isParsing ? <RefreshCw className="animate-spin" size={18} /> : <UploadCloud size={18} />}
                                <span>{isParsing ? 'Extracting...' : 'Import Resume'}</span>
                                <input type="file" accept=".pdf" onChange={handleResumeParse} className="hidden" />
                            </label>

                            <button onClick={handleSaveProfile} className="btn-secondary w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 border-emerald-500/20 text-white">
                                <Save size={18} /> Save Changes
                            </button>

                            <button 
                                onClick={generatePDF} 
                                disabled={isExporting}
                                className={`btn-primary w-full flex items-center justify-center gap-2 ${isExporting ? 'opacity-70 cursor-not-allowed' : ''}`}
                            >
                                {isExporting ? (
                                    <>
                                        <RefreshCw className="animate-spin" size={18} />
                                        <span>Exporting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Download size={18} />
                                        <span>Export CV</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* 2. MAIN WORKSPACE (Split View) */}
                <div className="grid lg:grid-cols-12 gap-8">

                    {/* LEFT: EDIT PROFILE (The "Source") */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2"><User size={20} className="text-cyan-400" /> Education & Experience</h2>
                        </div>

                        {/* Personal Details Editor */}
                        <div className="glass-card p-6 rounded-2xl space-y-4">
                            <h3 className="text-sm font-bold text-slate-500 uppercase">Basics</h3>
                            <input
                                value={profile.full_name}
                                onChange={e => setProfile({ ...profile, full_name: e.target.value })}
                                className="input-field" placeholder="Full Name"
                            />
                            <input
                                value={profile.role_title}
                                onChange={e => setProfile({ ...profile, role_title: e.target.value })}
                                className="input-field" placeholder="Job Title / Role"
                            />
                            <input
                                value={profile.email}
                                onChange={e => setProfile({ ...profile, email: e.target.value })}
                                className="input-field" placeholder="Email Address" type="email"
                            />
                            <input
                                value={profile.phone}
                                onChange={e => setProfile({ ...profile, phone: e.target.value })}
                                className="input-field" placeholder="Phone Number"
                            />
                            <input
                                value={profile.location}
                                onChange={e => setProfile({ ...profile, location: e.target.value })}
                                className="input-field" placeholder="Location (e.g. Dhaka, BD)"
                            />
                            <textarea
                                value={profile.summary}
                                onChange={e => setProfile({ ...profile, summary: e.target.value })}
                                className="input-field h-32" placeholder="Professional Summary"
                            />
                            {/* Skills editor */}
                            <div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="text-xs text-slate-500 uppercase font-bold">Skills</label>
                                    <button
                                        onClick={() => {
                                            const skill = prompt('Add a skill:');
                                            if (skill?.trim()) setProfile({ ...profile, skills: [...profile.skills, skill.trim()] });
                                        }}
                                        className="text-cyan-400 hover:text-white text-xs"
                                    >+ Add</button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {profile.skills.map((s, i) => (
                                        <span
                                            key={i}
                                            onClick={() => {
                                                const n = [...profile.skills]; n.splice(i, 1);
                                                setProfile({ ...profile, skills: n });
                                            }}
                                            className="px-2 py-1 bg-white/5 border border-white/10 text-slate-300 rounded text-xs cursor-pointer hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 transition"
                                            title="Click to remove"
                                        >{s} ×</span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Experience */}
                        <div className="glass-card p-6 rounded-2xl space-y-4">
                            <div className="flex justify-between items-center">
                                <h3 className="text-sm font-bold text-slate-500 uppercase">Experience</h3>
                                <button onClick={() => setProfile({ ...profile, experience: [...profile.experience, { id: Date.now(), role: "Role", company: "Company", dates: "Dates" }] })} className="text-cyan-400 hover:text-white"><Plus size={18} /></button>
                            </div>
                            {profile.experience.map((exp, i) => (
                                <div key={exp.id} className="p-4 bg-navy-900/50 rounded-xl border border-white/5 space-y-2 group relative">
                                    <button onClick={() => { const n = [...profile.experience]; n.splice(i, 1); setProfile({ ...profile, experience: n }) }} className="absolute top-2 right-2 text-red-400 opacity-0 group-hover:opacity-100"><Trash2 size={14} /></button>
                                    <input value={exp.role} onChange={e => { const n = [...profile.experience]; n[i].role = e.target.value; setProfile({ ...profile, experience: n }) }} className="bg-transparent font-bold text-white w-full focus:outline-none" placeholder="Role" />
                                    <input value={exp.company} onChange={e => { const n = [...profile.experience]; n[i].company = e.target.value; setProfile({ ...profile, experience: n }) }} className="bg-transparent text-sm text-cyan-400 w-full focus:outline-none" placeholder="Company" />
                                    <textarea value={exp.description} onChange={e => { const n = [...profile.experience]; n[i].description = e.target.value; setProfile({ ...profile, experience: n }) }} className="bg-transparent text-sm text-slate-400 w-full focus:outline-none resize-none" placeholder="Description" rows={3} />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* RIGHT: LIVE CV PREVIEW (The "Result") */}
                    <div className="lg:col-span-7">
                        <div className="sticky top-32">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-white flex items-center gap-2"><FileText size={20} className="text-cyan-400" /> Live CV Preview</h2>
                                <span className="text-xs text-slate-500 bg-white/5 px-2 py-1 rounded">Real-time A4 View</span>
                            </div>

                            <div className="bg-navy-900/40 p-8 rounded-3xl border border-white/10 flex justify-center overflow-hidden">
                                <div
                                    id="resume-preview"
                                    ref={resumeRef}
                                    className="w-[210mm] min-h-[297mm] shadow-2xl origin-top transform scale-[0.55] sm:scale-[0.65] lg:scale-[0.75] xl:scale-[0.85]"
                                    style={{ backgroundColor: '#ffffff', color: '#0f172a' }}
                                >
                                    {/* CV HEADER with PHOTO */}
                                    <div className="p-10 flex gap-8 items-center" style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
                                        <div className="w-32 h-32 rounded-full overflow-hidden border-4 flex-shrink-0" style={{ borderColor: '#334155', backgroundColor: '#1e293b' }}>
                                            {profile.photo && <img src={profile.photo} className="w-full h-full object-cover" alt="Avatar" />}
                                        </div>
                                        <div>
                                            <h1 className="text-4xl font-bold tracking-tight mb-2 uppercase" style={{ color: '#ffffff' }}>{profile.full_name}</h1>
                                            <p className="text-xl font-medium tracking-wide mb-4" style={{ color: '#22d3ee' }}>{profile.role_title}</p>
                                        </div>
                                    </div>

                                    {/* CV BODY */}
                                    <div className="p-10 grid grid-cols-3 gap-10">
                                        {/* LEFT COLUMN (Contacts & Skills) */}
                                        <div className="col-span-1 space-y-8 pr-6" style={{ borderRight: '1px solid #f1f5f9' }}>
                                            <section>
                                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Contact</h3>
                                                <div className="space-y-3 text-sm" style={{ color: '#475569' }}>
                                                    {profile.email && <div className="flex items-center gap-2 break-all">{profile.email}</div>}
                                                    {profile.phone && <div className="flex items-center gap-2">{profile.phone}</div>}
                                                    {profile.location && <div className="flex items-center gap-2">{profile.location}</div>}
                                                </div>
                                            </section>

                                            <section>
                                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Skills</h3>
                                                <div className="flex flex-wrap gap-2">
                                                    {profile.skills.map((s, i) => (
                                                        <span key={i} className="px-2 py-1 rounded text-xs font-medium" style={{ backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0' }}>{s}</span>
                                                    ))}
                                                </div>
                                            </section>

                                            <section>
                                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Education</h3>
                                                {profile.education.map((edu, i) => (
                                                    <div key={i} className="mb-4">
                                                        <div className="font-bold" style={{ color: '#1e293b' }}>{edu.school}</div>
                                                        <div className="text-xs mb-1" style={{ color: '#64748b' }}>{edu.year}</div>
                                                        <div className="text-sm" style={{ color: '#0e7490' }}>{edu.degree}</div>
                                                    </div>
                                                ))}
                                            </section>
                                        </div>

                                        {/* RIGHT COLUMN (Summary & Work) */}
                                        <div className="col-span-2 space-y-8">
                                            <section>
                                                <h3 className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#94a3b8' }}>Professional Profile</h3>
                                                <p className="text-sm leading-relaxed" style={{ color: '#334155' }}>{profile.summary}</p>
                                            </section>

                                            <section>
                                                <h3 className="text-xs font-bold uppercase tracking-widest mb-6" style={{ color: '#94a3b8' }}>Work History</h3>
                                                <div className="space-y-6">
                                                    {profile.experience.map((exp, i) => (
                                                        <div key={i} className="relative pl-6" style={{ borderLeft: '2px solid #e2e8f0' }}>
                                                            <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#cbd5e1' }}></div>
                                                            <div className="flex justify-between items-baseline mb-1">
                                                                <h4 className="font-bold text-lg" style={{ color: '#0f172a' }}>{exp.role}</h4>
                                                                <span className="text-xs font-bold" style={{ color: '#64748b' }}>{exp.dates}</span>
                                                            </div>
                                                            <div className="text-sm font-semibold mb-2" style={{ color: '#0e7490' }}>{exp.company}</div>
                                                            <p className="text-sm leading-relaxed" style={{ color: '#475569' }}>{exp.description}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            </section>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Global Styles */}
            <style>{`
                .input-field {
                    @apply w-full bg-navy-950/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-cyan-500/50 transition;
                }
                .btn-primary {
                    @apply bg-cyan-500 hover:bg-cyan-400 text-navy-950 px-6 py-3 rounded-xl font-bold transition shadow-lg shadow-cyan-500/20;
                }
                .btn-secondary {
                    @apply bg-navy-800 hover:bg-navy-700 text-white border border-white/10 px-6 py-3 rounded-xl font-medium transition;
                }
            `}</style>
        </div>
    );
};

export default Profile;