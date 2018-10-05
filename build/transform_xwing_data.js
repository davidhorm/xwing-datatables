/* Transform the JSON from xwing-data2 to a readable format consumed by DataTables  */
var fs = require('fs');
console.log("\n *START TRANSFORM* \n");

var factions = [
    //"first-order", //not ready
    "galactic-empire",
    "rebel-alliance",
    //"resistance", //not ready
    "scum-and-villainy"
]

var pilotArray = [];
var pilotsDir = "./submodules/xwing-data2/data/pilots"
factions.forEach(factionName => {
    var factionDir = `${pilotsDir}/${factionName}`;
    fs.readdirSync(factionDir).forEach(shipFileName => {
        var shipFilePath = `${factionDir}/${shipFileName}`;

        var content = fs.readFileSync(shipFilePath);
        var json = JSON.parse(content);
        var shipOnly = JSON.parse(content);
        delete shipOnly.pilots;

        json.pilots.forEach(pilotObj => {
            pilotObj.ship = shipOnly;
            pilotArray.push(pilotObj);
        });
    });
});
var pilotsData = {"data": pilotArray};
var pilotsDataFilePath = "./public/data/pilots.json";
fs.writeFileSync(pilotsDataFilePath, JSON.stringify(pilotsData));
console.log(`\n *CREATED ${pilotsDataFilePath} * \n`);

console.log("\n *END TRANSFORM * \n");