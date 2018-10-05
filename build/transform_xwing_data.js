/* Transform the JSON from xwing-data2 to a readable format consumed by DataTables  */
var fs = require('fs');
console.log("\n *START TRANSFORM* \n");

var factions = [
    //"first-order",
    "galactic-empire",
    "rebel-alliance",
    //"resistance",
    "scum-and-villainy"
]

var shipsArray = {};
var pilotsArray = [];
var pilotsDir = "./submodules/xwing-data2/data/pilots"
factions.forEach(factionName => {
    var factionDir = `${pilotsDir}/${factionName}`;
    fs.readdirSync(factionDir).forEach(shipFileName => {
        var shipFilePath = `${factionDir}/${shipFileName}`;

        var content = fs.readFileSync(shipFilePath);
        var json = JSON.parse(content);
        var shipOnly = JSON.parse(content);
        delete shipOnly.pilots;

        //store the ship xws key on the pilot object
        json.pilots.forEach(pilotObj => {
            pilotObj["ship_xws"] = shipOnly.xws;
            pilotsArray.push(pilotObj);
        });

        //store the ship information by xws key in a seperate array
        shipsArray[shipOnly.xws] = shipOnly;
    });
});
var pilotsData = {"data": pilotsArray};
var pilotsDataFilePath = "./public/data/pilots.json";
fs.writeFileSync(pilotsDataFilePath, JSON.stringify(pilotsData));
console.log(`\n *CREATED ${pilotsDataFilePath} * \n`);

var shipsDataFilePath = "./public/data/ships.json";
fs.writeFileSync(shipsDataFilePath, JSON.stringify(shipsArray));
console.log(`\n *CREATED ${shipsDataFilePath} * \n`);

console.log("\n *END TRANSFORM * \n");