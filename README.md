# 🤖 AutoApply AI Control Center

A high-performance, autonomous job application system that orchestrates AI agents to discover, extract, and match job opportunities in real-time.

## 🌟 Overview

This application leverages the **Gemini 2.5 & 3 series** models to automate the tedious parts of the job hunt. It doesn't just "find" jobs; it reasons through them to find the perfect fit for your specific career profile.

## 🚀 Key Features

- **Autonomous Discovery**: Background agent scans multiple sources (LinkedIn, Indeed, etc.) for relevant roles.
- **Approval Workflow**: A "Daily Discovery Digest" allows you to review and approve matches before the AI proceeds.
- **Neural Matching Engine**: Deep analysis of your profile vs. job descriptions with logic-based fit scores.
- **Smart Material Generation**: Automatically creates customized cover letters and email drafts.
- **Simulated SMTP Outbox**: Tracks every sent application with a full audit trail.

## 🛠 Tech Stack

- **React 19** + **TypeScript**
- **Vite** (Build Tool)
- **Google GenAI SDK** (Gemini AI)
- **Tailwind CSS** (Styling)
- **Recharts** (Data Visualization)
- **Lucide React** (Icons)

## 📦 Local Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/autoapply-ai.git
   cd autoapply-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment**
   Rename `.env.example` to `.env` and add your API key:
   ```env
   VITE_GEMINI_API_KEY=your_google_ai_studio_api_key
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

## 🏗 Project Structure

- `/components`: UI modules (Dashboard, JobFeed, Profile, etc.)
- `/services`: Core logic for AI interaction, currency conversion, and simulated email.
- `App.tsx`: The main orchestrator and state manager.
- `types.ts`: Centralized TypeScript definitions.

## 📄 License

MIT - Feel free to use and modify for your own job hunt automation.
