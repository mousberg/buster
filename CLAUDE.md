# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Langflow Hackathon project that integrates ElevenLabs Conversational AI with Twilio to create interactive voice agents for handling inbound and outbound phone calls. The main implementation is in the `inbound/` directory.

## Architecture

- **Fastify Server**: Main web server with WebSocket support for real-time communication
- **WebSocket Integration**: Bidirectional audio streaming between Twilio and ElevenLabs
- **ElevenLabs Conversational AI**: Handles natural language processing and voice synthesis
- **Twilio Integration**: Manages phone call routing and media streaming

Key files:
- `inbound/index.js`: Main server implementation with Twilio/ElevenLabs integration
- `inbound/package.json`: Node.js dependencies (Fastify, WebSocket, Twilio SDK)
- `inbound/cloudbuild.yaml`: Google Cloud Build configuration for deployment

## Development Commands

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

## Environment Configuration

Copy `inbound/env.yaml.example` to `inbound/env.yaml` and configure:
- `ELEVENLABS_API_KEY`: ElevenLabs API key
- `ELEVENLABS_AGENT_ID`: ElevenLabs agent identifier
- `TWILIO_ACCOUNT_SID`: Twilio account SID
- `TWILIO_AUTH_TOKEN`: Twilio authentication token
- `TWILIO_PHONE_NUMBER`: Twilio phone number

## Deployment

Deploy to Google Cloud Run:
```bash
gcloud config set project $PROJECT_ID
gcloud builds submit --config cloudbuild.yaml
```

## Testing

1. Configure Twilio webhook to `{ngrok-url}/twilio/inbound_call`
2. Call the Twilio phone number to test inbound calls
3. Use POST request to `/outbound-call` endpoint for outbound calls

## Key Integration Points

- **Twilio WebSocket Stream**: `/media-stream` endpoint handles real-time audio
- **ElevenLabs Signed URL**: Authentication for conversational AI connection
- **Audio Processing**: Base64 encoding/decoding for audio chunk transmission
- **Event Handling**: Manages conversation flow, interruptions, and transcriptions