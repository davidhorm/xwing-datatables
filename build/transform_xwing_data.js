/* Transform the JSON from xwing-data2 to a readable format consumed by DataTables  */
var mkdirp = require('mkdirp');
var fs = require('fs');
console.log("\n *START TRANSFORM* \n");

var factions = [
    //"first-order",
    "galactic-empire",
    "rebel-alliance",
    //"resistance",
    "scum-and-villainy"
];

//create data folder before creating .json files
mkdirp("./public/data", function (err) {
	if (err) {
    	console.error(err);
    }
    else {
		createPilotShipJson();
		createUpgradesJson();
    }
});

//used when parsing upgrades.json
var shipsArray = {};

function createPilotShipJson() {
    var pilotsArray = [];
    var pilotsDir = "./submodules/xwing-data2/data/pilots"
	factions.forEach(factionName => {
		var factionDir = `${pilotsDir}/${factionName}`;
		fs.readdirSync(factionDir).forEach(shipFileName => {
			var shipFilePath = `${factionDir}/${shipFileName}`;

			var content = fs.readFileSync(shipFilePath);
			var json = JSON.parse(content);
			
			//store the ship information by xws key in a seperate array
			var shipOnly = JSON.parse(content);
			shipOnly = getModifiedShipJson(shipOnly);
			shipsArray[shipOnly.xws] = shipOnly;

			//store ship data on pilot
			json.pilots.forEach(pilotObj => {
				var mergedObj = Object.assign(pilotObj, shipOnly);
				mergedObj["pilot_name"] = pilotObj.name;
				delete mergedObj.name;
				pilotsArray.push(mergedObj);
			});
		});
	});
	var pilotsData = {"data": pilotsArray};
	var pilotsDataFilePath = "./public/data/pilots.json";
	fs.writeFileSync(pilotsDataFilePath, JSON.stringify(pilotsData));
	console.log(`\n *CREATED ${pilotsDataFilePath} * \n`);
}

function getModifiedShipJson(shipJson) {
	//copy name into ship_name so it doesn't collide with pilot_name
	shipJson["ship_name"] = shipJson.name;

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

	//no longer need stats & pilots data
	delete shipJson.stats;
	delete shipJson.pilots;

	//now parse actions
	var actionsArray = getActionsArray(shipJson.actions);
	shipJson.actions = actionsArray;
				
	return shipJson;
}

function getActionsArray(actions) {
	var actionsArray = [];
	actions.forEach(action => {
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
	
	return actionsArray;
}

function createUpgradesJson() {
	var upgradesArray = [];
	var upgradeDir = "./submodules/xwing-data2/data/upgrades";
	fs.readdirSync(upgradeDir).forEach(upgradeFileName => {
		var upgradeFilePath = `${upgradeDir}/${upgradeFileName}`;
		var content = fs.readFileSync(upgradeFilePath);
		var json = JSON.parse(content);

		json.forEach(upgrade => {

			var restrictions = getRestrictions(upgrade.restrictions);

			upgrade.sides.forEach(side => {
				side["restrictions"] = restrictions;
				side["limited"] = upgrade.limited;

				if(side.hasOwnProperty("actions")) {
					var actionsArray = getActionsArray(side.actions);
					side.actions = actionsArray;
				}
				
				setCost(side, upgrade.cost);
				setAddRemoveSlots(side);

				upgradesArray.push(side);
			});
		});
	});
	var upgradesData = {"data": upgradesArray};
	var upgradesDataFilePath = "./public/data/upgrades.json";
	fs.writeFileSync(upgradesDataFilePath, JSON.stringify(upgradesData));
	console.log(`\n *CREATED ${upgradesDataFilePath} * \n`);
}

/*
 * Formats the costs of the card. Some cards are a simple value, however, other cards have a variable power.
 * This will set the cost property to "Side-Small = 2, Side-Medium = 5..." or "Agility-0 = 1, Agility-1 = 4..."
 */
function setCost(side, cost) {
	if(cost.hasOwnProperty("value")) {
		side["cost"] = cost.value;
	}
	else if(cost.hasOwnProperty("variable") && cost.hasOwnProperty("values")) {
		var variableCost = [];
		var variable = cost.variable.charAt(0).toUpperCase() + cost.variable.slice(1);
		for (var key in cost.values) {
			if(cost.values.hasOwnProperty(key)) {
				var value = `${variable}-${key} = ${cost.values[key]}`;
				variableCost.push(value);
			}
		}
		side["variable_cost"] = variableCost.join(", ");
	}
}

function setAddRemoveSlots(side) {
	if(side.hasOwnProperty("grants")) {
		var addGrantsArray = [];
		var removeGrantsArray = [];
		side.grants.forEach(grant => {
			if(grant.type === "slot") {
				if(grant.amount === 1) {
					addGrantsArray.push(grant.value);
				}
				else if (grant.amount === -1) {
					removeGrantsArray.push(grant.value);
				}
			}
		});
		side["add_slots"] = addGrantsArray.join(", ");
		side["remove_slots"] = removeGrantsArray.join(", ");
	}
}

function getRestrictions(restrictions) {
	if(typeof(restrictions) !== 'undefined') {
		var restrictionsArray = [];
		restrictions.forEach(restriction => {

			if(restriction.hasOwnProperty("factions")) {
				restrictionsArray = restrictionsArray.concat(restriction.factions);
			}
			else if(restriction.hasOwnProperty("names")) {
				restrictionsArray = restrictionsArray.concat(restriction.names);
			}
			else if(restriction.hasOwnProperty("sizes")) {
				restrictionsArray = restrictionsArray.concat(restriction.sizes);
			}
			else if(restriction.hasOwnProperty("arcs")) {
				restrictionsArray = restrictionsArray.concat(restriction.arcs);
			}
			else if(restriction.hasOwnProperty("ships")) {
				restriction.ships.forEach(ship_xws => {
					restrictionsArray.push(shipsArray[ship_xws].name);
				});
			}
			else if(restriction.hasOwnProperty("action")) {
				var value = restriction.action.type;
				if(restriction.action.difficulty === "Red") {
					value += "!";
				}
				restrictionsArray.push(value);
			}
		});

		return restrictionsArray.join(", ");
	}
}

console.log("\n *END TRANSFORM * \n");