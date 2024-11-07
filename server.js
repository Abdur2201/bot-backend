
import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import { authroutes } from './authroutes.js';
import dotenv from 'dotenv';
import { WebhookClient } from 'dialogflow-fulfillment'; // Import Dialogflow fulfillment library

dotenv.config();

const app = express();
const PORT = process.env.PORT || 10000;

// Configure CORS options
const corsOptions = {
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection URI with encoded special characters
const uri = process.env.MONGODB_URI;
mongoose.connect(uri)
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Basic route for testing
app.get('/', (req, res) => {
  res.send("Welcome to FSL Chatbot");
});

// Webhook route for Dialogflow
app.post('/webhook', (req, res) => {
  const agent = new WebhookClient({ request: req, response: res });
  const message = req.body.message;
  const parameters = req.body.parameters || {};
  console.log('Webhook connected');

  app.post('/auth/display-user-id', (req, res) => {
  const { userId } = req.body;
  if (userId) {
    console.log(`User ID received: ${userId}`);
    res.status(200).send(`User ID displayed: ${userId}`);
  } else {
    res.status(400).send("User ID is missing.");
  }
});
  // Intent handlers
  const handleTrackService = (agent) => {
    const idNum = agent.parameters.id_num;
    if (idNum) {
      agent.add(`Your tracking number ${userId} is in transit.`);
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
  const intent = agent.intent; // Retrieve the unmatched intent name
  console.log(`Unhandled intent: ${intent}`); // Log the unmatched intent
  agent.add("I'm not sure how to handle that request.");
};

  // Helper function to calculate cost
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
    
    const distance = Math.abs(destinationDistance - sourceDistance)
    const totalCost = baseRate + (distance * distanceFactor);
    return totalCost;
  };

  // Map Dialogflow intents to handlers
  const intentMap = new Map();
  intentMap.set('Track', handleTrackService);
  intentMap.set('download', handleDownloadReceipt);
  intentMap.set('estimation', handleCalculateCost);
  intentMap.set('others', handleOtherQueries);
  intentMap.set('Default Fallback Intent', handleUnknownIntent); 
  intentMap.set(null, handleFallback);
  // Handle the request with intentMap
  agent.handleRequest(intentMap);
});

// Routing to authroutes
app.use('/auth', authroutes);

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



// import express from 'express';
// import mongoose from 'mongoose';
// import bodyParser from 'body-parser';
// import cors from 'cors';
// import { authroutes } from './authroutes.js';
// import dotenv from 'dotenv';
// import { WebhookClient } from 'dialogflow-fulfillment'; // Import Dialogflow fulfillment library

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 10000;

// // Configure CORS options
// const corsOptions = {
//   origin: 'http://localhost:4200',
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type'],
// };

// app.use(cors(corsOptions));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// // MongoDB connection URI with encoded special characters
// //const uri = 'mongodb+srv://abdur220103:chat@10-2024@chatbotusers.k69gq.mongodb.net/chatbotUsers?retryWrites=true&w=majority';

// const uri = process.env.MONGODB_URI;
// mongoose.connect(uri)
//   .then(() => console.log('MongoDB connected!'))
//   .catch(err => console.error('Error connecting to MongoDB:', err));

// // Basic route for testing
// app.get('/', (req, res) => {
//   res.send("Welcome to FSL Chatbot");
// });

// // Webhook endpoint for Dialogflow
// app.post('/webhook', (req, res) => {
//   const agent = new WebhookClient({ request: req, response: res });

// app.post('/auth/display-user-id', (req, res) => {
//   const { userId } = req.body;
//   if (userId) {
//     console.log(`User ID received: ${userId}`);
//     res.status(200).send(`User ID displayed: ${userId}`);
//   } else {
//     res.status(400).send("User ID is missing.");
//   }
// });
//   const currentUserId = getCurrentUserId();
//   // Intent handlers
//   const handleTrackService = (agent) => {
//     const idNum = agent.parameters.id_num;
//     if (idNum) {
//       agent.add(`Your tracking number ${userId} is in transit.`);
//     } else {
//       agent.add("Please provide a valid tracking number.");
//     }
//   };

//   const handleDownloadReceipt = (agent) => {
//     const idNum = agent.parameters.id_num;
//     if (idNum) {
//       agent.add(`Here is the download link for receipt with ID ${userId}: www.google.com`);
//     } else {
//       agent.add("Please provide a valid ID number to download the receipt.");
//     }
//   };

//   const handleCalculateCost = (agent) => {
//     const source = agent.parameters.src_name;
//     const destination = agent.parameters.des_name;
//     if (source && destination) {
//       const estimatedCost = calculateShippingCost(source, destination);
//       agent.add(`The estimated cost to ship from ${source} to ${destination} is ${estimatedCost}.`);
//     } else {
//       agent.add("Please provide both source and destination to calculate the shipping cost.");
//     }
//   };

//   const handleOtherQueries = (agent) => {
//     const query = agent.parameters.query;
//     if (query) {
//       agent.add(`For "${query}", please contact our customer support for further assistance.`);
//     } else {
//       agent.add("Please provide more details about your query.");
//     }
//   };

//   // Helper function to calculate cost
//   const calculateShippingCost = (source, destination) => {
//     const baseRate = 10; 
//     const distanceFactor = 5; 
//     const regionDistances = {
//       "chennai": 30,     
//       "miami": 90, 
//       "dubai": 53,     
//       "mumbai": 154 
//     };
  
    
//     const sourceDistance = regionDistances[source] || 0; 
//     const destinationDistance = regionDistances[destination] || 0;
  
   
//     const distance = Math.abs(destinationDistance - sourceDistance);
    
//     // Calculate total cost
//     const totalCost = baseRate + (distance * distanceFactor);
    
//     return totalCost;
//   };
  

//   // Map Dialogflow intents to handlers
//   const intentMap = new Map();
//   intentMap.set('Track', handleTrackService);
//   intentMap.set('download', handleDownloadReceipt);
//   intentMap.set('estimation', handleCalculateCost);
//   intentMap.set('others', handleOtherQueries);

//   // Handle the request
//   agent.handleRequest(intentMap);
// });

// // Routing to authroutes
// app.use('/auth', authroutes);

// // Start the server
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });



























