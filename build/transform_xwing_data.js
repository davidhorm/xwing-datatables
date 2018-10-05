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

function createPilotShipJson() {
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
			shipsArray[shipOnly.xws] = getModifiedShipJson(shipOnly);
		});
	});
	var pilotsData = {"data": pilotsArray};
	var pilotsDataFilePath = "./public/data/pilots.json";
	fs.writeFileSync(pilotsDataFilePath, JSON.stringify(pilotsData));
	console.log(`\n *CREATED ${pilotsDataFilePath} * \n`);

	var shipsDataFilePath = "./public/data/ships.json";
	fs.writeFileSync(shipsDataFilePath, JSON.stringify(shipsArray));
	console.log(`\n *CREATED ${shipsDataFilePath} * \n`);
}

function getModifiedShipJson(shipJson) {
	//first handle  agility, hull, shield values
	shipJson.stats.forEach(stat => {
		if(stat.type !== "attack") {
			shipJson[stat.type] = stat.value;
		}
	});

	//now handle attack values
	var attackValues = shipJson.stats.filter(stat => { return stat.type === "attack" });
	shipJson["attack_value"] = attackValues[0].value;
	shipJson["attack_arc"] = attackValues[0].arc;
	if(attackValues.length === 2){
		shipJson["attack_value"] += `, ${attackValues[1].value}`;
		shipJson["attack_arc"] += `, ${attackValues[1].arc}`;
	}
	
	//no longer need stats
	delete shipJson.stats;

	//now parse actions
	var actionsArray = [];
	shipJson.actions.forEach(action => {
		var value = action.type;
        if(action.difficulty === "Red"){
			value += '!';
        }
        
        if(action.hasOwnProperty("linked")){
			value += ` > ${action.linked.type}`;
			if(action.linked.difficulty === "Red"){
				value += '!';
			}
		}

        actionsArray.push(`[${value}]`);
    });
	shipJson.actions = actionsArray;
					
	return shipJson;
}

function createUpgradesJson() {
	var upgradesArray = [];
	var upgradeDir = "./submodules/xwing-data2/data/upgrades";
	fs.readdirSync(upgradeDir).forEach(upgradeFileName => {
		var upgradeFilePath = `${upgradeDir}/${upgradeFileName}`;
		var content = fs.readFileSync(upgradeFilePath);
		var json = JSON.parse(content);
		upgradesArray = upgradesArray.concat(json);
	});
	var upgradesData = {"data": upgradesArray};
	var upgradesDataFilePath = "./public/data/upgrades.json";
	fs.writeFileSync(upgradesDataFilePath, JSON.stringify(upgradesData));
	console.log(`\n *CREATED ${upgradesDataFilePath} * \n`);
}

createPilotShipJson();
createUpgradesJson();

console.log("\n *END TRANSFORM * \n");