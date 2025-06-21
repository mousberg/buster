# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Langflow Hackathon project that integrates ElevenLabs Conversational AI with Twilio to create interactive voice agents for handling inbound and outbound phone calls. The project consists of both backend (inbound/) and frontend (frontend/) components, with GitHub Actions for automated CI/CD and code review.

## Architecture

### Backend (`inbound/`)
- **Fastify Server**: Main web server with WebSocket support for real-time communication
- **WebSocket Integration**: Bidirectional audio streaming between Twilio and ElevenLabs
- **ElevenLabs Conversational AI**: Handles natural language processing and voice synthesis
- **Twilio Integration**: Manages phone call routing and media streaming

### Frontend (`frontend/`)
- **Next.js Application**: React-based frontend with TypeScript
- **UI Components**: Built with Radix UI and Tailwind CSS
- **State Management**: Zustand for call management and state
- **Services**: API integration for backend communication and WhatsApp integration

### CI/CD & Automation
- **GitHub Actions**: Automated workflows for Claude Code integration
- **Code Review**: Automated PR reviews with Claude Code Review workflow
- **Issue Management**: Claude bot integration for issue handling

## Key Files Structure

### Backend
- `inbound/index.js`: Main server implementation with Twilio/ElevenLabs integration
- `inbound/package.json`: Node.js dependencies (Fastify, WebSocket, Twilio SDK)
- `inbound/cloudbuild.yaml`: Google Cloud Build configuration for deployment
- `inbound/Dockerfile`: Container configuration for deployment

### Frontend
- `frontend/src/app/`: Next.js app directory structure
- `frontend/src/components/`: React components (CallButton, CallHistory, CallTranscript, etc.)
- `frontend/src/services/`: API and WhatsApp service integrations
- `frontend/src/store/`: Zustand store for state management
- `frontend/package.json`: Frontend dependencies (Next.js, React, TypeScript, Tailwind)

### Automation
- `.github/workflows/claude.yml`: Claude Code bot integration for issues and PRs
- `.github/workflows/claude-code-review.yml`: Automated code review workflow

## Development Commands

### Backend Development
```bash
# Navigate to the inbound directory
cd inbound

# Install dependencies
npm install

# Start the development server
node index.js

# Start ngrok tunnel for local development
ngrok http --url=<your-static-url> 8000
```

### Frontend Development
```bash
# Navigate to the frontend directory
cd frontend

# Install dependencies
npm install

# Start development server with Turbopack
npm run dev

# Build for production
npm run build

# Run linter
npm run lint
```

## Environment Configuration

### Backend (`inbound/env.yaml`)
Copy `inbound/env.yaml.example` to `inbound/env.yaml` and configure:
- `ELEVENLABS_API_KEY`: ElevenLabs API key
- `ELEVENLABS_AGENT_ID`: ElevenLabs agent identifier
- `TWILIO_ACCOUNT_SID`: Twilio account SID
- `TWILIO_AUTH_TOKEN`: Twilio authentication token
- `TWILIO_PHONE_NUMBER`: Twilio phone number

### GitHub Actions
Set up repository secrets:
- `ANTHROPIC_API_KEY`: Required for Claude Code integration

## Deployment

### Backend Deployment
Deploy to Google Cloud Run:
```bash
cd inbound
gcloud config set project $PROJECT_ID
gcloud builds submit --config cloudbuild.yaml
```

### Frontend Deployment
The frontend can be deployed to Vercel, Netlify, or similar platforms supporting Next.js.

## Testing

### Backend Testing
1. Configure Twilio webhook to `{ngrok-url}/twilio/inbound_call`
2. Call the Twilio phone number to test inbound calls
3. Use POST request to `/outbound-call` endpoint for outbound calls

### Frontend Testing
1. Start the frontend development server
2. Use the UI components to test call functionality
3. Verify API integration with backend services

## Key Integration Points

### Backend
- **Twilio WebSocket Stream**: `/media-stream` endpoint handles real-time audio
- **ElevenLabs Signed URL**: Authentication for conversational AI connection
- **Audio Processing**: Base64 encoding/decoding for audio chunk transmission
- **Event Handling**: Manages conversation flow, interruptions, and transcriptions

### Frontend
- **API Service**: `frontend/src/services/api.ts` for backend communication
- **WhatsApp Integration**: `frontend/src/services/whatsapp.ts` for messaging
- **Call Management**: Zustand store handles call state and history
- **UI Components**: Modular components for call interface and controls

### Automation
- **Code Review**: Automatic PR reviews with configurable prompts
- **Issue Handling**: @claude mentions trigger automated assistance
- **Workflow Triggers**: Pull requests, issues, and comments activate Claude Code