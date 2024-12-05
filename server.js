import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import { authroutes } from './authroutes.js';
import dotenv from 'dotenv';
import { WebhookClient } from 'dialogflow-fulfillment';
import nodemailer from 'nodemailer';

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

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS  
  }
});

const uri = process.env.MONGODB_URI;
mongoose.connect(uri)
  .then(() => console.log('MongoDB connected!'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

app.get('/', (req, res) => {
  res.send("Welcome to FSL Chatbot");
});


app.post('/webhook', (req, res) => {

  const userId = req.headers['user-id'] || 'unknown-user';
  console.log('Resolved user ID:', userId); // Verify user ID here

  const agent = new WebhookClient({ request: req, response: res });
  // console.log("Webhook called with intent:", req.body.queryResult.intent.displayName);
  // console.log("Parameters received:", req.body.queryResult.parameters);
  // console.log("Headers:", req.headers);

  // const agent = new WebhookClient({ request: req, response: res });

  // const userId = req.headers['user-id'] || "unknown-user";
  // console.log("Resolved user ID:", userId);
  
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
      const downloadLink = `https://www.google.com`;
      agent.add(`Here is the download link for receipt:    ${downloadLink}`);
    } else {
      agent.add("Please provide a valid ID number to download the receipt.");
    }
  };

  const handleCalculateCost = (agent) => {
    const source = agent.parameters.src_name;
    const destination = agent.parameters.des_name;
    if (source && destination) {
      const estimatedCost = calculateShippingCost(source, destination);
      agent.add(`The estimated cost for shipment from ${source} to ${destination} is $${estimatedCost}.`);
    } else {
      if(!source)
      {
      agent.add("Please provide source name");
      }
      else if(!destination)
      {
        agent.add("Please provide destination name");
      }
      else{
        agent.add("Please provide both source and destination to calculate the shipping cost.");
      }
      //agent.add("Please provide both source and destination to calculate the shipping cost.");
    }
  };

  const handleOtherQueries = async (agent) => {
    const query = agent.parameters.query;
    if(query){
    const mailOptions={
      from:'abdurintern@gmail.com',
      to:'abdurintern@gmail.com',
      subject:"New Customer's Query (High Priority)",
      text:`New query complaint has been raised using chat bot: "${query}".`
    };
      console.log(mailOptions.text);
    try 
    {
      await transporter.sendMail(mailOptions);
      console.log('mail sent to our team');
      agent.add("Your query has been sent to our customer support team for further assistance.");
    }
    catch(error)
    {
      console.log('error sending mail to our team', error);
      agent.add("Error occurred while sending your query to our customer support team.");
    }
  }
  else{
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
        "miami": 353, 
        "dubai": 53,     
        "mumbai": 154,
        "goa": 36
    };

    // Convert source and destination to lowercase for consistent matching
    const sourceKey = source.toLowerCase();
    const destinationKey = destination.toLowerCase();

    // Look up distances
    const sourceDistance = regionDistances[sourceKey];
    const destinationDistance = regionDistances[destinationKey];

    // Debugging messages
    console.log("Source Key:", sourceKey, "Source Distance:", sourceDistance);
    console.log("Destination Key:", destinationKey, "Destination Distance:", destinationDistance);

    // Validate distances
    if (sourceDistance === undefined || destinationDistance === undefined) {
        return "Invalid source or destination.";
    }

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

  const userId = req.headers['user-id'];  // Retrieve the userId from headers
  console.log('Received userId from frontend:', userId);
  
  // const { userId } = req.body;
  console.log(`userID:${userId}`);
  if (userId) {
    console.log(`User ID received: ${userId}`);
    res.status(200).json(`User ID displayed: ${userId}`);
  } else {
    res.status(400).json("User ID is missing.");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// import express from 'express';
// import mongoose from 'mongoose';
// import bodyParser from 'body-parser';
// import cors from 'cors';
// import { authroutes } from './authroutes.js';
// import dotenv from 'dotenv';
// import { WebhookClient } from 'dialogflow-fulfillment';

// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 10000;

// const corsOptions = {
//   origin: 'http://localhost:4200',
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'user-id'],
// };

// app.use(cors(corsOptions));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// const uri = process.env.MONGODB_URI;
// mongoose.connect(uri)
//   .then(() => console.log('MongoDB connected!'))
//   .catch(err => console.error('Error connecting to MongoDB:', err));

// app.get('/', (req, res) => {
//   res.send("Welcome to FSL Chatbot");
// });


// app.post('/webhook', (req, res) => {

//   if(req.headers)
//   {
//   console.log('Headers received:'); // Log all headers!
//   }
//   const agent = new WebhookClient({ request: req, response: res });
//   const userId = req.headers['user-id'];  // Retrieve userId from headers
//   console.log('Webhook connected, user ID:', userId);

//   // const userId = req.headers['user-id'];
 
//   const handleTrackService = (agent) => {
//     const idNum = agent.parameters.id_num;
//     if (userId) {
//       agent.add(`Your tracking number ${idNum} is in transit.`);
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
//       agent.add(`The estimated cost to ship from ${source} to ${destination} is $${estimatedCost}.`);
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

//   const handleUnknownIntent = (agent) => {
//     agent.add("I'm not sure how to handle that request.");
//     console.warn(`No handler for intent: ${agent.intent}`);
//   };

//   const handleFallback = (agent) => {
//     const intent = agent.intent;
//     console.log(`Unhandled intent: ${intent}`);
//     agent.add("I'm not sure how to handle that request.");
//   };

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
//     return baseRate + (distance * distanceFactor);
//   };

//   const intentMap = new Map();
//   intentMap.set('Track', handleTrackService);
//   intentMap.set('download', handleDownloadReceipt);
//   intentMap.set('estimation', handleCalculateCost);
//   intentMap.set('others', handleOtherQueries);
//   intentMap.set('Default Fallback Intent', handleUnknownIntent); 
//   intentMap.set(null, handleFallback);
  
//   agent.handleRequest(intentMap);
// });

// app.use('/auth', authroutes);

// const userSessionCache = new Map();


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

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });



// import express from 'express';
// import mongoose from 'mongoose';
// import bodyParser from 'body-parser';
// import cors from 'cors';
// import { authroutes } from './authroutes.js';
// import dotenv from 'dotenv';
// import { WebhookClient } from 'dialogflow-fulfillment';
// import nodemailer from 'nodemailer';
// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 10000;

// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: {
//       user: 'internnewage@gmail.com',
//       pass: 'newage2024'
//   }
// });
// const corsOptions = {
//   origin: 'http://localhost:4200',
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   allowedHeaders: ['Content-Type', 'user-id'],
// };

// app.use(cors(corsOptions));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// const uri = process.env.MONGODB_URI;
// mongoose.connect(uri)
//   .then(() => console.log('MongoDB connected!'))
//   .catch(err => console.error('Error connecting to MongoDB:', err));

// app.get('/', (req, res) => {
//   res.send("Welcome to FSL Chatbot");
// });


// app.post('/webhook', async (req, res) => {

//   const { intent, queryText } = req.body;

//     if (intent === 'others') {
//         const mailOptions = {
//             from: 'internnewage@gmail.com',
//             to: 'internnewage@gmail.com',
//             subject: 'New Query',
//             text: `Query received: ${queryText}`
//         };

//         try {
//             const info = await transporter.sendMail(mailOptions);
//             console.log('Email sent:', info.response);
//             res.status(200).send('Email sent successfully');
//         } catch (error) {
//             console.error('Error sending email:', error);
//             res.status(500).send('Failed to send email');
//         }
//     } else {
//         res.status(200).send('Not an "others" intent');
//     }
//   if(req.headers)
//   {
//   console.log('Headers received:'); // Log all headers!
//   }
//   const agent = new WebhookClient({ request: req, response: res });
//   const userId = req.headers['user-id'];  // Retrieve userId from headers
//   console.log('Webhook connected, user ID:', userId);

//   // const userId = req.headers['user-id'];
 
//   const handleTrackService = (agent) => {
//     const idNum = agent.parameters.id_num;
//     if (userId) {
//       agent.add(`Your tracking number ${idNum} is in transit.`);
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
//       agent.add(`The estimated cost to ship from ${source} to ${destination} is $${estimatedCost}.`);
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

//   const handleUnknownIntent = (agent) => {
//     agent.add("I'm not sure how to handle that request.");
//     console.warn(`No handler for intent: ${agent.intent}`);
//   };

//   const handleFallback = (agent) => {
//     const intent = agent.intent;
//     console.log(`Unhandled intent: ${intent}`);
//     agent.add("I'm not sure how to handle that request.");
//   };

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
//     return baseRate + (distance * distanceFactor);
//   };

//   const intentMap = new Map();
//   intentMap.set('Track', handleTrackService);
//   intentMap.set('download', handleDownloadReceipt);
//   intentMap.set('estimation', handleCalculateCost);
//   intentMap.set('others', handleOtherQueries);
//   intentMap.set('Default Fallback Intent', handleUnknownIntent); 
//   intentMap.set(null, handleFallback);
  
//   agent.handleRequest(intentMap);
// });

// app.use('/auth', authroutes);

// const userSessionCache = new Map();


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

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });



















