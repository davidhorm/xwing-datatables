/* Merge all the json objects together into a single object to see what are the available properties. */
var mkdirp = require('mkdirp');
var fs = require('fs');
console.log("\n *START MERGE* ");

var cardsFilePath = `./build/ffg/cards.sorted.json`;
var content = fs.readFileSync(cardsFilePath);
var json = JSON.parse(content);

var mergedCard = {};
json.cards.forEach(cardObj => {
	mergedCard = Object.assign(mergedCard, cardObj);
});
            
var mergedDataFilePath = "./build/ffg/cards.merged.json";
fs.writeFileSync(mergedDataFilePath, JSON.stringify(mergedCard, null, 4));
console.log(` *CREATED ${mergedDataFilePath} *`);