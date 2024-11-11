import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import { authroutes } from './authroutes.js';
import dotenv from 'dotenv';
import { WebhookClient } from 'dialogflow-fulfillment';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

const corsOptions = {
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'user-id'],
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const uri = process.env.MONGODB_URI;
mongoose.connect(uri)
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

app.get('/', (req, res) => {
  res.send("Welcome to FSL Chatbot");
});
//newly added!
app.use((req, res, next) => {
  const sessionId = req.sessionID || req.headers['session-id'];
  if (sessionId && userSessionCache.has(sessionId)) {
    req.headers['user-id'] = userSessionCache.get(sessionId); // Attach userId to headers
  }
  next();
});

app.post('/webhook', (req, res) => {
  // console.log('Headers received:', req.headers);  // Log all headers to check for 'user-id'
  // const agent = new WebhookClient({ request: req, response: res });
  // const userId = req.headers['user-id'];  // Retrieve userId from headers
 
  const userId = req.headers['user-id'];
  console.log('Webhook connected, user ID:', userId);

  const handleTrackService = (agent) => {
    const idNum = agent.parameters.id_num;
    if (userId) {
      agent.add(`Your tracking number ${idNum} is in transit.`);
    } else {
      agent.add("Please provide a valid tracking number.");
    }
  };

  const handleDownloadReceipt = (agent) => {
    const idNum = agent.parameters.id_num;
    if (idNum) {
      agent.add(`Here is the download link for receipt with ID ${userId}: www.google.com`);
    } else {
      agent.add("Please provide a valid ID number to download the receipt.");
    }
  };

  const handleCalculateCost = (agent) => {
    const source = agent.parameters.src_name;
    const destination = agent.parameters.des_name;
    if (source && destination) {
      const estimatedCost = calculateShippingCost(source, destination);
      agent.add(`The estimated cost to ship from ${source} to ${destination} is $${estimatedCost}.`);
    } else {
      agent.add("Please provide both source and destination to calculate the shipping cost.");
    }
  };

  const handleOtherQueries = (agent) => {
    const query = agent.parameters.query;
    if (query) {
      agent.add(`For "${query}", please contact our customer support for further assistance.`);
    } else {
      agent.add("Please provide more details about your query.");
    }
  };

  const handleUnknownIntent = (agent) => {
    agent.add("I'm not sure how to handle that request.");
    console.warn(`No handler for intent: ${agent.intent}`);
  };

  const handleFallback = (agent) => {
    const intent = agent.intent;
    console.log(`Unhandled intent: ${intent}`);
    agent.add("I'm not sure how to handle that request.");
  };

  const calculateShippingCost = (source, destination) => {
    const baseRate = 10; 
    const distanceFactor = 5; 
    const regionDistances = {
      "chennai": 30,     
      "miami": 90, 
      "dubai": 53,     
      "mumbai": 154 
    };
    const sourceDistance = regionDistances[source] || 0; 
    const destinationDistance = regionDistances[destination] || 0;
    const distance = Math.abs(destinationDistance - sourceDistance);
    return baseRate + (distance * distanceFactor);
  };

  const intentMap = new Map();
  intentMap.set('Track', handleTrackService);
  intentMap.set('download', handleDownloadReceipt);
  intentMap.set('estimation', handleCalculateCost);
  intentMap.set('others', handleOtherQueries);
  intentMap.set('Default Fallback Intent', handleUnknownIntent); 
  intentMap.set(null, handleFallback);
  
  agent.handleRequest(intentMap);
});

app.use('/auth', authroutes);

const userSessionCache = new Map();

app.post('/auth/display-user-id', (req, res) => {
  const userId = req.headers['user-id'];
  const sessionId = req.sessionID || req.headers['session-id'];  // Use a session or unique identifier
  if (userId && sessionId) {
    userSessionCache.set(sessionId, userId); // Store the userId in memory cache
    res.status(200).json({ message: `User ID stored for session ${sessionId}` });
  } else {
    res.status(400).json("User ID or session ID missing.");
  }
});
// app.post('/auth/display-user-id', (req, res) => {

//   const userId = req.headers['user-id'];  // Retrieve the userId from headers
//   console.log('Received userId from frontend:', userId);
  
//   // const { userId } = req.body;
//   console.log(`userID:${userId}`);
//   if (userId) {
//     console.log(`User ID received: ${userId}`);
//     res.status(200).json(`User ID displayed: ${userId}`);
//   } else {
//     res.status(400).json("User ID is missing.");
//   }
// });

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});






















