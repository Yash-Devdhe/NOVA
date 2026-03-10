# Nova No-Code Virtual Agents

A modern no-code platform for creating and deploying AI virtual agents. Build custom AI workflows without writing code.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![React](https://img.shields.io/badge/React-19-61DAFB)

## Features

- **No-Code Agent Builder** - Visual drag-and-drop interface to create AI agents
- **Authentication** - Secure user management with Clerk
- **AI Integration** - Powered by OpenAI for natural language processing
- **Real-time Chat** - Test and interact with your agents
- **Workflow Preview** - Visual representation of agent workflows
- **Payment Integration** - Razorpay integration for paid features
- **Security** - Arcjet protection for API routes

## Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Git

## Quick Start

```bash
# Navigate to the project directory
cd nova-no-code-virtual-agents

# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Environment Variables

Create a `.env.local` file in the `nova-no-code-virtual-agents` directory with the following variables:

```env
# Convex (Database & Real-time)
NEXT_PUBLIC_CONVEX_URL=your_convex_url

# OpenAI (AI Features)
OPENAI_API_KEY=sk-your_openai_key

# Clerk (Authentication)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_key
CLERK_SECRET_KEY=sk_test_your_key

# Razorpay (Payments)
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret

# Arcjet (Security)
ARCJET_KEY=your_arcjet_key
```

### Getting Your API Keys

1. **Convex**: Sign up at [convex.dev](https://convex.dev) and create a new project
2. **OpenAI**: Get your API key at [platform.openai.com](https://platform.openai.com)
3. **Clerk**: Sign up at [clerk.com](https://clerk.com) and create a new application
4. **Razorpay**: Sign up at [razorpay.com](https://razorpay.com) and get your keys
5. **Arcjet**: Sign up at [arcjet.com](https://arcjet.com) and create a new project

## Building for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm run start
```

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign up
3. Import your GitHub repository
4. Add the environment variables in the Vercel dashboard
5. Deploy

### Netlify

1. Push your code to GitHub
2. Go to [netlify.com](https://netlify.com) and sign up
3. Import your GitHub repository
4. Configure:
   - Build command: `npm run build`
   - Publish directory: `.next.nosync`
   - Node version: 20
5. Add the environment variables
6. Deploy

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- **AWS Amplify**
- **Google Cloud Run**
- **Docker** (create a Dockerfile)

## Project Structure

```
nova-no-code-virtual-agents/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── agent-builder/     # Agent builder pages & components
│   ├── api/               # API routes
│   │   ├── openai/        # OpenAI integration
│   │   ├── payments/      # Payment processing
│   │   └── arcjet/        # Security
│   └── dashboard/         # Main dashboard
├── components/            # Reusable UI components
│   └── ui/               # Shadcn UI components
├── context/              # React context providers
├── convex/               # Convex backend functions
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
└── public/               # Static assets
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Start production server |

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **Database**: Convex
- **Auth**: Clerk
- **AI**: OpenAI
- **Payments**: Razorpay
- **Security**: Arcjet

## Troubleshooting

### Build Errors

If you encounter build errors, try:

```bash
# Clear Next.js cache
rm -rf .next
rm -rf .next.nosync

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Environment Variables Not Loading

Make sure your `.env.local` file is in the correct location (`nova-no-code-virtual-agents/.env.local`) and restart the development server.

### TypeScript Errors

Run the type checker:

```bash
npx tsc --noEmit
```

## License

MIT License - feel free to use this project for any purpose.

## Support

For issues and questions, please open a GitHub issue in your repository.
