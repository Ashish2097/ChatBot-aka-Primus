const path = require('path');
const botkit = require('botkit');
const {parseTrainingData} = require('./parseTrainingData.js');
const trainingData = parseTrainingData(path.join(__dirname,'./trainingData.json'));  //loading training data

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


const NLP = require('natural');
const classifier = new NLP.LogisticsRegressionClassifier(); //create a new classifier

function trainClassifier(classifier, label, phrases) {    //feeding data to classifier
  console.log('Teaching set', label, phrases);
  phrases.forEach((phrase) => {
    console.log('Teaching single ${label}: ${phrase}');
    classifier.addDocument(phrase.toLowerCase(), label);      //associating phrases to label
  });
}
