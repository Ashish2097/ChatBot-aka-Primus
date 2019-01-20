const botkit = require('botkit');
require('dotenv').config(); //Load our environment variables from the .env file


const scopes = [
  'direct_mention',     //what are the types of chats we want to consider
  'direct_message',     //in this case, we onl care about chats that come directly
  'mention'             //to the bot
];

const token = process.env.SLACK_API_TOKEN;    //get our slack api token from the environment

const Bot = botkit.slackbot({     //chat bot instance
  debug: true,
  storage: undefined
});

function handleMessage(speech, message) {
  console.log(speech, message);
  speech.reply(message, "got it");        //handling replies
}

Bot.hears('.*', scopes, handleMessage);   //configuring bot
                                          // (.*) ---->  message
                                          // scope -----> message to be considered
                                          // handling ----> handleMessage

Bot.spawn({
  token: token
}).startRTM();
