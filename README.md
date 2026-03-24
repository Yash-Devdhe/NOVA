# NOVA - No-Code Virtual Agents Platform

<p align="center">
  <img src="/public/logo.svg" alt="NOVA Logo" width="200" />
</p>

<p align="center">
  <a href="https://github.com/yourusername/NOVA">
    <img src="https://img.shields.io/badge/GitHub-NOVA-blue?style=for-the-badge&logo=github" alt="GitHub">
  </a>
  <a href="https://vercel.com">
    <img src="https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel" alt="Vercel">
  </a>
  <a href="https://nextjs.org">
    <img src="https://img.shields.io/badge/Built-Next.js-black?style=for-the-badge&logo=next.js" alt="Next.js">
  </a>
</p>

## 🚀 Features

NOVA is a powerful no-code platform for creating AI virtual agents with real-time capabilities:

### Core Features
- **Visual Agent Builder** - Drag-and-drop interface to create agent workflows
- **Multiple Node Types** - Start, End, LLM, API, If/Else, While Loop, User Approval
- **Real-time Preview** - Test your agents instantly in an interactive chat interface

### API Integrations
- **Weather API** - Real-time weather data (OpenWeatherMap or Open-Meteo for free)
- **Google Maps API** - Directions, geocoding, places search
- **Custom API Support** - Connect to any REST API with your own API keys

### Media Generation
- **Image Generation** - DALL-E 3 integration with usage limits
- **Video Generation** - Like Gemini's 2-3 video limit per day
- **Audio/TTS Generation** - Text-to-speech with OpenAI TTS

### Developer Features
- **Code Generation** - Generate JavaScript, Python, or TypeScript code from your agent flow
- **Copy & Download** - Easy copy-paste or download generated code
- **API Key Management** - Per-agent API keys stored locally in browser

## 📸 Screenshots

![Agent Builder](https://via.placeholder.com/800x400?text=Agent+Builder)
![Preview Modal](https://via.placeholder.com/800x400?text=Agent+Preview)
![API Keys Settings](https://via.placeholder.com/800x400?text=API+Keys+Settings)

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **Backend**: Convex (Serverless functions & database)
- **Authentication**: Clerk
- **Payments**: Razorpay
- **Hosting**: Vercel

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/NOVA.git
cd NOVA
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:
```env
# OpenAI
OPENAI_API_KEY=sk-...

# Convex
NEXT_PUBLIC_CONVEX_DEPLOYMENT_URL=your_convex_url
CONVEX_DEPLOY_KEY=your_convex_key

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Razorpay Payments
RAZORPAY_KEY_ID=your_razorpay_id
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your NOVA instance.

## 📖 Usage Guide

### Creating Your First Agent

1. Go to the dashboard and click "Create New Agent"
2. Give your agent a name (e.g., "Weather Assistant")
3. Add API keys in the Settings tab if needed
4. Build your workflow using the visual builder:
   - Add nodes from the left sidebar
   - Configure each node in the right panel
   - Connect nodes to define the flow

### Configuring API Keys

1. Open your agent in the builder
2. Go to the "API Keys" tab in the right panel
3. Add your API keys for the services you want to use:
   - **OpenWeatherMap** - Free weather data (or use Open-Meteo for free)
   - **Google Maps** - Directions, geocoding, places
   - **OpenAI** - GPT, DALL-E, TTS
   - **Replicate** - Video generation AI

4. Click "Save API Keys"

### Testing Your Agent

1. Click the "Preview" button in the top right
2. Chat with your agent in the preview modal
3. Try commands like:
   - "What's the weather in New York?"
   - "Create an image of a sunset"
   - "Make a video of a flying bird"
   - Any other custom queries

### Generating Code

1. Click "Custom Code" in the top right of the builder
2. Select your preferred language (JavaScript, Python, TypeScript)
3. Click "Generate" to generate code from your agent flow
4. Copy or download the generated code

## 🔧 API Endpoints

NOVA provides the following API endpoints:

| Endpoint | Description |
|----------|-------------|
| `/api/weather` | Get real-time weather data |
| `/api/maps` | Google Maps (directions, geocoding) |
| `/api/video` | Generate videos (with limits) |
| `/api/audio` | Generate audio/TTS (with limits) |
| `/api/custom-api` | Call any REST API |
| `/api/openai` | OpenAI GPT & DALL-E |

## 📝 Example Agents

### Weather Agent
```json
{
  "name": "Weather Assistant",
  "nodes": [
    { "type": "start" },
    { "type": "llm", "config": { "prompt": "Extract the city from user input" } },
    { "type": "api", "config": { "apiUrl": "/api/weather" } },
    { "type": "end" }
  ]
}
```

### Trip Planner Agent
```json
{
  "name": "Trip Planner",
  "nodes": [
    { "type": "start" },
    { "type": "llm", "config": { "prompt": "Extract origin and destination" } },
    { "type": "api", "config": { "apiUrl": "/api/maps", "action": "directions" } },
    { "type": "end" }
  ]
}
```

## 🚢 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables
4. Deploy!

### Docker

```bash
docker build -t nova-app .
docker run -p 3000:3000 nova-app
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org)
- [Convex](https://convex.dev)
- [Clerk](https://clerk.com)
- [Shadcn UI](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com)

---

<p align="center">Made with ❤️ using NOVA</p>

