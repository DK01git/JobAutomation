# AutoApply AI Control Center

An autonomous job application system that orchestrates discovery, extraction, and matching agents using Gemini AI.

## 🚀 Key Features

- **Autonomous Discovery**: Background agent scans multiple sources (LinkedIn, Indeed, etc.) for relevant roles.
- **Daily Digest Review**: Receive a curated briefing of new matches requiring your approval before processing.
- **Neural Matching**: Deep reasoning engine compares your profile against job requirements.
- **Automated Submission**: Generates personalized cover letters and email bodies for verified applications.
- **Persistent Scheduler**: Runs daily heartbeats to ensure you never miss a new listing.

## 🛠 Tech Stack

- **React 19**
- **TypeScript**
- **Gemini AI SDK** (`@google/genai`)
- **Tailwind CSS**
- **Vite**
- **Recharts** (Visual Analytics)
- **Lucide React** (Iconography)

## 📦 Installation & Setup

1. **Clone the repo**
   ```bash
   git clone https://github.com/YOUR_USERNAME/autoapply-ai.git
   cd autoapply-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Create a `.env` file in the root directory:
   ```env
   VITE_GEMINI_API_KEY=your_google_ai_studio_api_key
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

## 🤖 Agent Workflow

1. **SCHEDULER**: Every 24 hours, initiates the sync sequence.
2. **DISCOVERY**: Scours job boards for roles matching your profile.
3. **ORCHESTRATOR**: Notifies you via the "Daily Discovery Digest" for approval.
4. **EXTRACTION**: Parses technical requirements and salary metadata.
5. **MATCHING**: Provides a fit score and reasoning.
6. **SUBMISSION**: Generates and archives application packets.

## 📄 License
MIT
