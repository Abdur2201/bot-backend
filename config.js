require('dotenv').config();

const config = {
    port: process.env.PORT || 10000,
    dialogflowProjectId: process.env.DIALOGFLOW_PROJECT_ID || 'fir-3a36f',
    webhookUrl: process.env.WEBHOOK_URL || 'https://bot-backend-0y9c.onrender.com/webhook'
};

module.exports = config;
