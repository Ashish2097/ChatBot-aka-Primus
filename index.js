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

// function handleMessage(speech, message) {
//   console.log(speech, message);
//   speech.reply(message, "got it");        //handling replies
// }

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

function interpret(phrase) {
  console.log('interpret', phrase);
  const guesses = classifier.getClassifications(phrase.toLowerCase());
  console.log('guesses', guesses);
  const guess = guesses.reduce((x, y) => x && x.value > y.value ? x : y);
  return {
    probabilities: guesses,
    guess: guess.value > (0.7) ? guess.label : null
  };
}

function handleMessage(speech, message) {
  const interpretation = interpret(message.text);
  console.log('Bot heard: ', message.text);
  console.log('Bot interpretation: ', interpretation);

  if (interpretation.guess && trainingData[interpretation.guess]) {
    console.log('Found response');
    speech.reply(message, trainingData[interpretation.guess].answer);
  } else {
    console.log('Couldn\'t match phrase');
    speech.reply(message, 'Sorry, I\'m not sure what you mean');
  }
}

//generating classifier for each label in training data
var i = 0;
Object.keys(trainingData).forEach((element, key) => {
  trainClassifier(classifier, element, trainingData[element].questions);
  i++;
  //training at the end
  if(i === Object.keys(trainingData).length) {
    classifier.train();
    const filePath = './classifier.json';
    classifier.save(filePath, (err, classifier) => {
      if(err) {
        console.log("error in saving classifier: ",err);
      }
      console.log("Created a Classifier file in ", filePath);
    });
  }
});
