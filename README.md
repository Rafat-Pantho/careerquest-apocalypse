# CareerQuest: The Apocalypse 🏰⚔️

> *"Where job hunting meets fantasy adventure!"*

A professional career development platform that reimagines the soul-crushing reality of job hunting and academic pressure as a high-stakes Fantasy RPG mixed with Anime aesthetics.

## 🎮 The Concept

| Real World | CareerQuest Realm |
| ------------ | ------------------- |
| Users | Heroes |
| Recruiters/Admins | Dungeon Masters |
| Unemployment | The Final Boss |
| Internships | Tutorial Levels |
| Full-time Jobs | Raid Bosses |
| Networking | Summoning Rituals |
| Skills | Special Attacks |
| Experience | Battle History |
| AI Career Coach | The Oracle of Judgment |

## 🛠️ Tech Stack

### Frontend (The Visual Realm)

- **Framework:** React.js 19 + Vite 5
- **Styling:** Tailwind CSS 3 (Custom RPG Theme)
- **Animations:** Framer Motion (Particle effects, floating elements)
- **Routing:** React Router DOM
- **Icons:** Custom SVG Assets

### Backend (The Core Logic)

- **Runtime:** Node.js + Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT + Google OAuth 2.0
- **Real-time:** Socket.io (Live updates)
- **AI:** Google Gemini API (Generative AI)
- **File Handling:** Multer

## 📁 Project Structure

```md
CareerQuest - The Apocalypse/
├── backend/              # Server & API
│   ├── config/           # Configuration files (DB, Passport)
│   ├── controllers/      # Route controllers (Auth, Oracle, Quests)
│   ├── models/           # Mongoose schemas (Hero, Quest, etc.)
│   ├── routes/           # API routes
│   ├── server.js         # Entry point
│   └── ...
│
└── frontend/             # Client Application
|    ├── src/
|    │   ├── assets/       # Images, SVGs (Logos, Icons)
|    │   ├── components/   # Reusable UI (Buttons, Cards, Modals)
|    │   ├── context/      # Global State (Auth, Game)
|    │   ├── pages/        # Route Views (Oracle, Dashboard, Quests)
|    │   ├── App.jsx       # Main Component
|    │   └── main.jsx      # Entry Point
|    ├── tailwind.config.js # RPG Theme Configuration
|    └── vite.config.js    # Build Configuration
|-- readme.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB (local or Atlas)
- Google Cloud Console Project (for OAuth & Gemini API)

### 1. Backend Setup (The Server)

```bash

# Navigate to backend
cd backend

# Install dependencies
npm install

# Configure environment 
# Create a .env file with the following: 
# NODE_ENV=development
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/CareerQuest
# JWT_SECRET=your_secret
# GOOGLE_CLIENT_ID=your_google_client_id
# GOOGLE_CLIENT_SECRET=your_google_client_secret
# GEMINI_API_KEY=your_gemini_api_key

# Start the server
npm run dev
```

### 2. Frontend Setup (The Client)

```bash
# Open a new terminal and navigate to frontend
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at:

- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000`

## 📜 API Endpoints

| Endpoint | Description |
| ---------- | ------------- |
| POST /api/auth/register | Create new hero |
| POST /api/auth/login | Hero login |
| GET /api/users/profile | Get hero profile |
| GET /api/quests | Browse job listings |
| POST /api/quests/:id/apply | Apply to quest |
| POST /api/oracle/consult | Ask the AI Oracle for career advice |

## 🎯 Features Status

### Implemented ✅

- [x] **Backend Architecture**: Express server with error handling.
- [x] **Hero Schema**: Dual data structure (Real World vs Fantasy Stats).
- [x] **Authentication**: JWT Login/Register & Google OAuth.
- [x] **Design System**: Custom Tailwind config with RPG colors (Parchment, Gold, Mana, Dungeon).
- [x] **UI Components**: Magical Buttons, Cards, Badges, Modals.
- [x] **Landing Page**: Dynamic animated entry point with particle effects.
- [x] **Dashboard**: The central hub for the Hero's stats and progress.
- [x] **Quest Board**: Job listing portal with filtering.
- [x] **Oracle of Judgment**: AI-powered career advice with a "grumpy medieval fortune teller" persona (Powered by Gemini).
- [x] **Mercenary Guild**: Networking and connections page.
- [x] **Skill Tavern**: Skill development tracking.
- [x] **Boss Battles**: Live coding challenges gamified as monster fights.
- [x] **Real-time Updates**: Live "Heroes Online" count and Quest Board updates via Socket.io.
- [x] **Guild Chat**: Real-time global chat ("The Tavern") for all heroes to communicate.

### Coming Soon 🔜

- [ ] CV Builder (Character Sheet Generator)

## 🎨 Hero Classes

| Class | Real World Equivalent |
| ------- | ---------------------- |
| Code Wizard | Software Engineering |
| Data Sorcerer | Data Science |
| Design Enchanter | UI/UX Design |
| Merchant Lord | Business/Finance |
| Word Weaver | Content Writing |
| Circuit Shaman | Hardware Engineering |

## 📊 XP System

Actions that award XP:

- Daily login: 10 XP
- Application submitted: 25 XP
- Interview completed: 50 XP
- CV generated: 15 XP
- Skill added: 20 XP

## 👤 Author

CareerQuest Dev Team

## 📄 License

ISC License

---

*"May your code be bug-free and your servers ever responsive!"* ⚔️
