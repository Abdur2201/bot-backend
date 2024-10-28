import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import { authroutes } from './authroutes.js';
import dotenv from 'dotenv';
import { WebhookClient } from 'dialogflow-fulfillment'; // Import Dialogflow fulfillment library

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
mongoose.connect('mongodb://localhost:27017/chatbotUsers', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB:', error);
  });

// Basic route for testing
app.get('/', (req, res) => {
  res.send("Welcome to FSL Chatbot");
});

// Webhook endpoint for Dialogflow
app.post('/webhook', (req, res) => {
  const agent = new WebhookClient({ request: req, response: res });

  // Intent handlers
  function handleTrackService(agent) {
    const idNum = agent.parameters.id_num; // Parameter from Dialogflow
    if (idNum) {
      agent.add(`Your tracking number ${idNum} is in transit.`);
    } else {
      agent.add("Please provide a valid tracking number.");
    }
  }

  function handleDownloadReceipt(agent) {
    const idNum = agent.parameters.id_num; // Adjust parameter name
    if (idNum) {
      agent.add(`Here is the download link for receipt with ID ${idNum}: www.google.com`);
    } else {
      agent.add("Please provide a valid ID number to download the receipt.");
    }
  }

  function handleCalculateCost(agent) {
    const source = agent.parameters.src_name;
    const destination = agent.parameters.des_name;
    if (source && destination) {
      const estimatedCost = calculateShippingCost(source, destination); // Call cost calculation
      agent.add(`The estimated cost to ship from ${source} to ${destination} is $${estimatedCost}.`);
    } else {
      agent.add("Please provide both source and destination to calculate the shipping cost.");
    }
  }

  function handleOtherQueries(agent) {
    const query = agent.parameters.query; // Adjust parameter name
    if (query) {
      agent.add(`For "${query}", please contact our customer support for further assistance.`);
    } else {
      agent.add("Please provide more details about your query.");
    }
  }

  // Helper function to calculate cost
  function calculateShippingCost(source, destination) {
    const baseRate = 5;
    const distanceFactor = 2;
    return baseRate + (destination.length - source.length) * distanceFactor;
  }

  // Map Dialogflow intents to handlers
  let intentMap = new Map();
  intentMap.set('Track', handleTrackService);
  intentMap.set('download', handleDownloadReceipt);
  intentMap.set('estimation', handleCalculateCost);
  intentMap.set('others', handleOtherQueries);

  // Handle the request
  agent.handleRequest(intentMap);
});

// Routing to authroutes
app.use('/auth', authroutes);

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

























// import express from 'express';
// import mongoose from 'mongoose';
// import bodyParser from 'body-parser';
// import cors from 'cors';
// import { authroutes } from './authroutes.js';
// import dotenv from 'dotenv';
// import   { sendMessageToPythonChatbot } from './chat.service.js';


// dotenv.config();

// const app = express();
// const port = process.env.PORT || 3000;
// const corsOptions = {
//   origin: '*',
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type'],
// };

// app.use(cors(corsOptions));

// // app.use(cors());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// // Database connection
// mongoose.connect('mongodb://localhost:27017/chatbotUsers', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// })
//   .then(() => {
//     console.log('Connected to MongoDB');
//   })
//   .catch((error) => {
//     console.log('Error connecting to MongoDB:', error);
//   });

// // Basic route for testing
// app.get('/', (req, res) => {
//   res.send("Welcome to FSL Chatbot");
// });

// app.post('/api/chat', async (req, res) => {
//   const userMessage = req.body.message;
//   try {
//     const chatbotResponse = await sendMessageToPythonChatbot(userMessage);
//     res.json({ response: chatbotResponse });
//   } catch (error) {
//     console.error('Error in /api/chat:', error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
  
// });


// // Routing to authroutes
// app.use('/auth', authroutes);

// // Start the server
// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });









// const userMessage = req.body.message;
  // const chatbotResponse = await sendMessageToPythonChatbot(userMessage);
  // res.json({ response: chatbotResponse });

  

//import { WebhookClient } from 'dialogflow-fulfillment';

// app.post('/api/chat', (req, res) => {

//   console.log('Received message:', req.body.text);
//   const agent = new WebhookClient({ request: req, response: res });

//   console.log("Webhook received", req.body);

//   // Intent handlers
//   function handleTrackService(agent) {
//     const trackingNumber = agent.parameters.trackingId; // Parameter name from Dialogflow
//     agent.add(`Your cargo with tracking number ${trackingNumber} is in transit.`);
//   }

//   function handleDownloadReceipt(agent) {
//     const orderNumber = agent.parameters.trackingId; // Parameter name from Dialogflow
//     agent.add(`Here is the download link for order number ${orderNumber}: https://your-domain.com/receipt/${orderNumber}`);
//   }

//   function handleCalculateCost(agent) {
//     const source = agent.parameters['Sourcename'];
//     const destination = agent.parameters['Destname'];
//     const weight = 75

//     // Simple calculation logic for demo
//     const estimatedCost = calculateShippingCost(source, destination, weight);
//     agent.add(`The estimated cost to ship from ${source} to ${destination} for a weight of ${weight} kg is $${estimatedCost}.`);
//   }

//   function handleOtherQueries(agent) {
//     const query = agent.parameters.UserId; // Parameter name from Dialogflow
//     agent.add(`For "${query}", please contact our customer support for further assistance.`);
//   }

//   function calculateShippingCost(source, destination, weight) {
//     const baseRate = 5;
//     const distanceFactor = 2;
//     const weightFactor = 1.5;

//     const distanceCost = baseRate * distanceFactor;
//     const weightCost = weight * weightFactor;

//     return distanceCost + weightCost;
//   }

//   // Map Dialogflow intent names to the handlers
//   let intentMap = new Map();
//   intentMap.set('Trackservice', handleTrackService);
//   intentMap.set('DownloadReceipt', handleDownloadReceipt);
//   intentMap.set('calculation_data', handleCalculateCost);
//   intentMap.set('Others', handleOtherQueries);

//   // Handle the request using the intent map
//   agent.handleRequest(intentMap);
  
// });







// app.post('/chat', (req, res) => {
//   const userMessage = req.body.message.toLowerCase();

//   let botResponse = "";

//   // Simple keyword matching for responses
//   if (userMessage.includes("track")) {
//     botResponse = "Please provide your tracking number, and I'll let you know the status.";
//   } else if (userMessage.includes("receipt")) {
//     botResponse = "To download your receipt, please provide your order number.";
//   } else if (userMessage.includes("cost")) {
//     botResponse = "For cost calculation, provide the source, destination, and weight.";
//   } else {
//     botResponse = "I'm here to assist you. Could you please provide more details or ask another question?";
//   }

//   res.json({ response: botResponse });
// });

// // Webhook endpoint for Dialogflow
// app.post('/webhook', (req, res) => {
//   
// });






// const userMessage = req.body.text;

  // // Logic to determine the bot's response
  // let botResponse;

  // if (userMessage.includes("track")) {
  //   botResponse = {
  //     text: "What would you like to do?",
  //     buttons: ["Track Service", "Download Receipt", "Calculate Shipping"]
  //   };
  // } else {
  //   botResponse = {
  //     text: "I'm not sure about that. Can you try asking something else?"
  //   };
  // }

  // res.json({ botMessage });


// const wss=new Websocket.Server({port:8080})
// wss.on('connection',(ws)=>{
//     ws.on('message',(message)=>{
//         console.log('Received: %s',message);
        
//         ws.send('Chat response: '+processQuery(message));
//     });
// });

//   function processQuery(query)
//   {
//     if(query.includes('status'))
//     {
//         return 'Your service is being process'
//     }
//     else if (query.includes('help')) 
//     {
//         return 'How can I assist you today?';
//     } 
//     else 
//     {
//         return 'I am not sure how to answer that. Can you clarify?';
//     }
//   }


//imports
// const express=require('express');
// const mongoose=require('mongoose');
// const bodyparser=require('body-parser');
// const cors=require('cors');
// const Websocket=require('ws')
// const authroutes=require('C:/Users/Intern- newage/Desktop/chatbot/back/authroutes.js');
// const { Configuration,OpenAIAPI}=require('openai')
// require('dotenv').config();
// import OpenAI from 'openai';





// console.log("Using API Key:", apiKey);
// const openai=new OpenAI({
//     apiKey:apiKey
// });

// app.post('/chatbot',async(req,res)=>{
//     const userMessage=req.body.message
//   try 
//   {
//     const response = await openai.chat.completions.create({
//       model: 'dall-e-3',  
//       prompt: userMessage,
//       max_tokens: 100,
//     });
//     const botMessage = response.data.choices[0].text.trim();
//     res.json({ botMessage });
//   } 
//   catch (error) {
//     console.error('Error with OpenAI API request:', error);
//     res.status(500).send('Error processing your request.');
//   }
// });











// try {
//     const responses = await sessionClient.detectIntent(request);
//     const botReply = responses[0].queryResult.fulfillmentText;

//     res.status(200).json({ botMessage: botReply });
//   } catch (error) {
//     console.error('Error in Dialogflow:', error);
//     res.status(500).json({ message: 'An error occurred while processing your message.' });
//   }
//     try {
//         const userMessage = req.body.userMessage;
//         if (!userMessage) {
//           return res.status(400).json({ botMessage: 'User message is missing' });
//         }
        
//         // Replace this logic with your Dialogflow or chatbot response logic.
//         const botReply = `You said: ${userMessage}`;
//         res.status(200).json({ botMessage: botReply });
//       } catch (error) {
//         console.error('Error in /webhook:', error);
//         res.status(500).json({ message: 'An error occurred on the server.' });
//       }