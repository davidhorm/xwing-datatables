/** Sort the data from the official FFG API */
var fs = require('fs');

/** Sort cards.raw.json */
var cardsFilePath = "./build/ffg/cards.raw.json"
var cardsContent = fs.readFileSync(cardsFilePath);
var cardsJson = JSON.parse(cardsContent);

cardsJson.cards.sort(GetSortOrder("id"));

var cardsSortedFilePath = "./build/ffg/cards.sorted.json";
fs.writeFileSync(cardsSortedFilePath, JSON.stringify(cardsJson, null, 4));
console.log(` *CREATED ${cardsSortedFilePath} * \n`);

/** Sort extensions.raw.json */
var extensionsFilePath = "./build/ffg/extensions.raw.json"
var extensionsContent = fs.readFileSync(extensionsFilePath);
var extensionsJson = JSON.parse(extensionsContent);

extensionsJson.extensions.sort(GetSortOrder("id"));

var extensionsSortedFilePath = "./build/ffg/extensions.sorted.json";
fs.writeFileSync(extensionsSortedFilePath, JSON.stringify(extensionsJson, null, 4));
console.log(` *CREATED ${extensionsSortedFilePath} * \n`);

/** Sort app-metadata.raw.json */
var metadataFilePath = "./build/ffg/app-metadata.raw.json"
var metadataContent = fs.readFileSync(metadataFilePath);
var metadataJson = JSON.parse(metadataContent);

metadataJson.force_affiliation.sort(GetSortOrder("id"));
metadataJson.ship_size.sort(GetSortOrder("id"));
metadataJson.ship_types.sort(GetSortOrder("id"));
metadataJson.card_stats.sort(GetSortOrder("id"));
metadataJson.card_types.sort(GetSortOrder("id"));
metadataJson.factions.sort(GetSortOrder("id"));
metadataJson.card_action_types.sort(GetSortOrder("id"));
metadataJson.upgrade_types.sort(GetSortOrder("id"));

var metadataSortedFilePath = "./build/ffg/app-metadata.sorted.json";
fs.writeFileSync(metadataSortedFilePath, JSON.stringify(metadataJson, null, 4));
console.log(` *CREATED ${metadataSortedFilePath} * \n`);

//Comparer Function  
function GetSortOrder(prop) {  
    return function(a, b) {  
        return a[prop] - b[prop];
    }  
}  