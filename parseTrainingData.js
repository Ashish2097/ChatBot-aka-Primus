const fs = require('fs');

function parseTrainingData(filePath) {
  const trainingFile = fs.readFileSync(filePath);
  console.log('parsing training data');
  return JSON.parse(trainingFile);
}

module.exports = {parseTrainingData};
