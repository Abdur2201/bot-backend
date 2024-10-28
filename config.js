require('dotenv').config();

const config = {
    port: process.env.PORT || 3000,
    dialogflowProjectId: process.env.DIALOGFLOW_PROJECT_ID || 'fir-3a36f',
    webhookUrl: process.env.WEBHOOK_URL || 'http://localhost:3000/webhook'
};

module.exports = config;
