import Fastify from "fastify";
import WebSocket from "ws";
import dotenv from "dotenv";
import fastifyFormBody from "@fastify/formbody";
import fastifyWs from "@fastify/websocket";
import mem0Service from "./mem0Service.js";
import DTMFHandler from "./dtmf.js";

// Load environment variables from .env file
dotenv.config();

const { ELEVENLABS_AGENT_ID, ELEVENLABS_API_KEY } = process.env;

// Check for the required ElevenLabs Agent ID
if (!ELEVENLABS_AGENT_ID || !ELEVENLABS_API_KEY) {
  console.error(
    "Missing ELEVENLABS_AGENT_ID or ELEVENLABS_API_KEY in environment variables"
  );
  process.exit(1);
}

// Initialize Fastify server
const fastify = Fastify();
fastify.register(fastifyFormBody);
fastify.register(fastifyWs);

const PORT = process.env.PORT || 8080;

// Root route for health check
fastify.get("/", async (_, reply) => {
  reply.send({ message: "Server is running with Mem0 brain integration" });
});

// Demo endpoints removed - use frontend /api/brain endpoints for Mem0 functionality

// Route to handle incoming calls from Twilio
fastify.all("/twilio/inbound_call", async (request, reply) => {
  // Generate TwiML response to connect the call to a WebSocket stream
  const twimlResponse = `<?xml version="1.0" encoding="UTF-8"?>
    <Response>
      <Connect>
        <Stream url="wss://${request.headers.host}/media-stream" />
      </Connect>
    </Response>`;

  reply.type("text/xml").send(twimlResponse);
});

// Helper function to get signed URL for authenticated conversations
async function getSignedUrl(phoneNumber = null) {
  try {
    let url = `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${ELEVENLABS_AGENT_ID}`;
    let body = null;
    let method = "GET";

    // If we have a phone number, get memory context and use override
    if (phoneNumber) {
      const brainContext = await mem0Service.getUserBrainContext(phoneNumber);
      
      if (brainContext.memoriesCount > 0) {
        console.log(`[ElevenLabs] 🧠 Injecting ${brainContext.memoriesCount} memories into agent brain`);
        
        // Use POST with conversation override
        method = "POST";
        url = `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${ELEVENLABS_AGENT_ID}`;
        
        body = JSON.stringify({
          conversation_config_override: {
            agent: {
              prompt: {
                prompt: `You are a helpful voice assistant. Be conversational, friendly, and concise in your responses.${brainContext.contextPrompt}`
              },
              first_message: brainContext.firstMessage,
              language: "en"
            }
          }
        });
        
        console.log(`[ElevenLabs] 🧠 Using personalized greeting: "${brainContext.firstMessage}"`);
      }
    }

    const requestOptions = {
      method,
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json",
      },
    };

    if (body) {
      requestOptions.body = body;
    }

    const response = await fetch(url, requestOptions);

    if (!response.ok) {
      throw new Error(`Failed to get signed URL: ${response.statusText}`);
    }

    const data = await response.json();
    return data.signed_url;
  } catch (error) {
    console.error("Error getting signed URL:", error);
    throw error;
  }
}

// WebSocket route for handling media streams
fastify.register(async fastifyInstance => {
  fastifyInstance.get("/media-stream", { websocket: true }, (ws, req) => {
    console.info("[Server] Twilio connected to media stream");

    // Variables to track the call
    let streamSid = null;
    let callSid = null;
    let elevenLabsWs = null;
    let customParameters = null; // Add this to store parameters
    let phoneNumber = null; // Will store the caller's phone number
    let transcripts = []; // Store conversation transcripts
    let dtmfHandler = new DTMFHandler(); // DTMF handler for answering machines

    // DTMF event handlers
    dtmfHandler.on('answeringMachineDetected', (data) => {
      console.log(`[DTMF] 🤖 Answering machine detected with ${(data.confidence * 100).toFixed(1)}% confidence`);
    });

    dtmfHandler.on('toneSent', (data) => {
      console.log(`[DTMF] 📞 Sent tone '${data.digit}' (${data.step}/${data.total})`);
    });

    dtmfHandler.on('sequenceComplete', (data) => {
      console.log(`[DTMF] ✅ Completed ${data.type} sequence: ${data.sequence.join(', ')}`);
    });

    // Handle WebSocket errors
    ws.on("error", console.error);

    // Set up ElevenLabs connection with memory context
    const setupElevenLabs = async (callerPhoneNumber = null) => {
      try {
        const signedUrl = await getSignedUrl(callerPhoneNumber);
        elevenLabsWs = new WebSocket(signedUrl);

        elevenLabsWs.on("open", () => {
          console.log("[ElevenLabs] Connected to Conversational AI");
        });

        elevenLabsWs.on("message", data => {
          try {
            const message = JSON.parse(data);

            switch (message.type) {
              case "conversation_initiation_metadata":
                console.log("[ElevenLabs] Received initiation metadata");
                break;

              case "audio":
                if (streamSid) {
                  if (message.audio?.chunk) {
                    const audioData = {
                      event: "media",
                      streamSid,
                      media: {
                        payload: message.audio.chunk,
                      },
                    };
                    ws.send(JSON.stringify(audioData));
                  } else if (message.audio_event?.audio_base_64) {
                    const audioData = {
                      event: "media",
                      streamSid,
                      media: {
                        payload: message.audio_event.audio_base_64,
                      },
                    };
                    ws.send(JSON.stringify(audioData));
                  }
                } else {
                  console.log(
                    "[ElevenLabs] Received audio but no StreamSid yet"
                  );
                }
                break;

              case "interruption":
                if (streamSid) {
                  ws.send(
                    JSON.stringify({
                      event: "clear",
                      streamSid,
                    })
                  );
                }
                break;

              case "ping":
                if (message.ping_event?.event_id) {
                  elevenLabsWs.send(
                    JSON.stringify({
                      type: "pong",
                      event_id: message.ping_event.event_id,
                    })
                  );
                }
                break;

              case "agent_response":
                const agentResponse = message.agent_response_event?.agent_response;
                console.log(`[ElevenLabs] Agent response: ${agentResponse}`);
                if (agentResponse && callSid) {
                  transcripts.push({ role: 'assistant', content: agentResponse });
                  
                  // Check for answering machine indicators
                  if (dtmfHandler.detectAnsweringMachine(agentResponse)) {
                    console.log('[DTMF] 🤖 Answering machine detected, preparing DTMF navigation');
                  }
                  
                  // TODO: Save to Mem0 after fixing transcript capture
                  // mem0Service.addTranscript(callSid, phoneNumber || callSid, 'assistant', agentResponse)
                }
                break;

              case "user_transcript":
                const userTranscript = message.user_transcription_event?.user_transcript;
                console.log(`[ElevenLabs] User transcript: ${userTranscript}`);
                if (userTranscript && callSid) {
                  transcripts.push({ role: 'user', content: userTranscript });
                  
                  // Analyze transcript for DTMF navigation opportunities
                  const dtmfAction = dtmfHandler.analyzeCallProgress(userTranscript);
                  if (dtmfAction) {
                    console.log(`[DTMF] 🎯 Detected action opportunity: ${dtmfAction.action} (confidence: ${dtmfAction.confidence})`);
                    
                    // Execute DTMF sequence based on detected scenario
                    switch (dtmfAction.action) {
                      case 'navigate_menu':
                        dtmfHandler.executeDTMFSequence(ws, streamSid, 'automated_menu');
                        break;
                      case 'start_recording':
                        dtmfHandler.executeDTMFSequence(ws, streamSid, 'voicemail_record');
                        break;
                      case 'request_human':
                        dtmfHandler.executeDTMFSequence(ws, streamSid, 'automated_menu');
                        break;
                    }
                  }
                  
                  // TODO: Save to Mem0 after fixing transcript capture
                  // mem0Service.addTranscript(callSid, phoneNumber || callSid, 'user', userTranscript)
                }
                break;

              default:
                console.log(
                  `[ElevenLabs] Unhandled message type: ${message.type}`
                );
            }
          } catch (error) {
            console.error("[ElevenLabs] Error processing message:", error);
          }
        });

        elevenLabsWs.on("error", error => {
          console.error("[ElevenLabs] WebSocket error:", error);
        });

        elevenLabsWs.on("close", () => {
          console.log("[ElevenLabs] Disconnected");
        });
      } catch (error) {
        console.error("[ElevenLabs] Setup error:", error);
      }
    };

    // ElevenLabs will be set up when we get phone number from Twilio start event

    // Handle messages from Twilio
    ws.on("message", message => {
      try {
        const msg = JSON.parse(message);
        if (msg.event !== "media") {
          console.log(`[Twilio] Received event: ${msg.event}`);
        }

        switch (msg.event) {
          case "start":
            streamSid = msg.start.streamSid;
            callSid = msg.start.callSid;
            // Extract phone number from custom parameters if available
            phoneNumber = msg.start.customParameters?.from || msg.start.from || callSid;
            console.log(
              `[Twilio] Stream started - StreamSid: ${streamSid}, CallSid: ${callSid}, Phone: ${phoneNumber}`
            );
            
            // Set up ElevenLabs with memory context for this caller
            console.log(`[Memory] 🧠 Setting up ElevenLabs with memory context for ${phoneNumber}`);
            setupElevenLabs(phoneNumber)
              .then(() => {
                console.log(`[Memory] ✅ ElevenLabs initialized with personalized brain context`);
              })
              .catch(err => {
                console.error('[Memory] ❌ Failed to setup ElevenLabs with context:', err);
                // Fallback to setup without context
                setupElevenLabs()
                  .catch(fallbackErr => console.error('[ElevenLabs] Complete setup failed:', fallbackErr));
              });
            
            // Log memory context for debugging (memory is already injected in agent brain)
            mem0Service.getCallContext(callSid, phoneNumber)
              .then(memories => {
                if (memories.length > 0) {
                  console.log(`[Mem0] 📚 Found ${memories.length} relevant memories for context`);
                }
              })
              .catch(err => console.error('[Mem0] Failed to load context:', err));
            break;

          case "media":
            if (elevenLabsWs?.readyState === WebSocket.OPEN) {
              const audioMessage = {
                user_audio_chunk: Buffer.from(
                  msg.media.payload,
                  "base64"
                ).toString("base64"),
              };
              elevenLabsWs.send(JSON.stringify(audioMessage));
            }
            break;

          case "stop":
            console.log(`[Twilio] Stream ${streamSid} ended`);
            
            // Save call summary to Mem0 for future brain context
            if (transcripts.length > 0 && callSid && phoneNumber) {
              mem0Service.summarizeCall(callSid, phoneNumber, transcripts)
                .then(() => console.log('[Mem0] 💾 Call summary saved for future brain context'))
                .catch(err => console.error('[Mem0] Failed to save call summary:', err));
            }
            
            if (elevenLabsWs?.readyState === WebSocket.OPEN) {
              elevenLabsWs.close();
            }
            break;

          default:
            console.log(`[Twilio] Unhandled event: ${msg.event}`);
        }
      } catch (error) {
        console.error("[Twilio] Error processing message:", error);
      }
    });

    // Handle WebSocket closure
    ws.on("close", () => {
      console.log("[Twilio] Client disconnected");
      if (elevenLabsWs?.readyState === WebSocket.OPEN) {
        elevenLabsWs.close();
      }
    });
  });
});

// Start the Fastify server
// For Cloud Run, we need to listen on 0.0.0.0
fastify.listen({
  port: PORT,
  host: '0.0.0.0'
}, err => {
  if (err) {
    console.error("Error starting server:", err);
    process.exit(1);
  }
  console.log(`[Server] Listening on port ${PORT}`);
});
