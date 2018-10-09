/* Merge all the json together into a single object to see what are the available properties. */
var mkdirp = require('mkdirp');
var fs = require('fs');
console.log("\n *START MERGE* \n");

var factions = [
    "first-order",
    "galactic-empire",
    "rebel-alliance",
    "resistance",
    "scum-and-villainy"
];

mkdirp("./public/data", function (err) {
	if (err) {
    	console.error(err);
    }
    else {
		mergePilotShipJson();
		mergeUpgradesJson();
    }
});

function mergePilotShipJson() {
    var mergedShip = {};
    var mergedPilot= {};

    var pilotsDir = "./submodules/xwing-data2/data/pilots"
	factions.forEach(factionName => {
		var factionDir = `${pilotsDir}/${factionName}`;
		fs.readdirSync(factionDir).forEach(shipFileName => {
			var shipFilePath = `${factionDir}/${shipFileName}`;

			var content = fs.readFileSync(shipFilePath);
			var json = JSON.parse(content);
			
			//store the ship information by xws key in a seperate array
			var shipOnly = JSON.parse(content);
            delete shipOnly.pilots;
            mergedShip = Object.assign(mergedShip, shipOnly);

			//store ship data on pilot
			json.pilots.forEach(pilotObj => {
				mergedPilot = Object.assign(mergedPilot, pilotObj);
			});
		});
	});
    
    var shipsDataFilePath = "./public/data/mergedShip.json";
	fs.writeFileSync(shipsDataFilePath, JSON.stringify(mergedShip));
	console.log(`\n *CREATED ${shipsDataFilePath} * \n`);

	var pilotsDataFilePath = "./public/data/mergedPilot.json";
	fs.writeFileSync(pilotsDataFilePath, JSON.stringify(mergedPilot));
	console.log(`\n *CREATED ${pilotsDataFilePath} * \n`);
}

function mergeUpgradesJson() {
    var mergedUpgrade = {};
    var mergedSide = {};

	var upgradeDir = "./submodules/xwing-data2/data/upgrades";
	fs.readdirSync(upgradeDir).forEach(upgradeFileName => {
		var upgradeFilePath = `${upgradeDir}/${upgradeFileName}`;
		var content = fs.readFileSync(upgradeFilePath);
		var json = JSON.parse(content);

		json.forEach(upgrade => {
            //first merge sides of the card
			upgrade.sides.forEach(sideObj => {
				mergedSide = Object.assign(mergedSide, sideObj);
            });
            
            //then remove sides, and merge the rest
            delete upgrade.sides;
            mergedUpgrade = Object.assign(mergedUpgrade, upgrade);
		});
	});
	
	var upgradesDataFilePath = "./public/data/mergedUpgrade.json";
	fs.writeFileSync(upgradesDataFilePath, JSON.stringify(mergedUpgrade));
    console.log(`\n *CREATED ${upgradesDataFilePath} * \n`);
    
    var sidesDataFilePath = "./public/data/mergedSide.json";
	fs.writeFileSync(sidesDataFilePath, JSON.stringify(mergedSide));
	console.log(`\n *CREATED ${sidesDataFilePath} * \n`);
}