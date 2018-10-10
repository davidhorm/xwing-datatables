/* Transform the JSON from xwing-data2 to a readable format consumed by DataTables  */
var mkdirp = require('mkdirp');
var fs = require('fs');
var glob = require("glob");

console.log("\n *START TRANSFORM* \n");

//create data folder before creating .json files
mkdirp("./public/data", function (err) {
	if (err) {
    	console.error(err);
    }
    else {
		setConditionsJson();
		createPilotShipJson();
		createUpgradesJson();
		createDamageDeckJson();
		console.log("\n *END TRANSFORM * \n");
    }
});

var shipsArray = {}; //used when parsing upgrades.json
var conditions = {}; //some pilots and upgrade cards cause conditions

function setConditionsJson() {
	var conditionFilePath = "./submodules/xwing-data2/data/conditions/conditions.json"
	var content = fs.readFileSync(conditionFilePath);
	var json = JSON.parse(content);
	json.forEach(condition => {
		conditions[condition.xws] = condition;
	});
}

function createPilotShipJson() {
    var pilotsArray = [];
	var pilotsDir = "./submodules/xwing-data2/data/pilots/*/*.json"
	var shipFilePaths = glob.sync(pilotsDir);
	shipFilePaths.forEach(shipFilePath => {
		var content = fs.readFileSync(shipFilePath);
		var json = JSON.parse(content);

		//only parse pilot content if ffg id is defined (to filter out preview content)
		if(json.hasOwnProperty("ffg")) {

			//store the ship information by xws key in a seperate array
			var shipOnly = JSON.parse(content);
			var shipOnlyActions = shipOnly.actions;
			delete shipOnly.actions;
			shipOnly = getModifiedShipJson(shipOnly);
			shipsArray[shipOnly.xws] = shipOnly;
			
			//store ship data on pilot
			json.pilots.forEach(pilotObj => {
				pilotObj["pilot_name"] = pilotObj.name; //assign to pilot_name so it doesn't conflict with name
				pilotObj["pilot_name_formatted"] = getFormattedPilotName(pilotObj); //format pilot name with limited and caption
				pilotObj["actions"] = getActionsArray(pilotObj.shipActions || shipOnlyActions); // some pilots have actions different than the ship (i.e. calculate)
				var mergedObj = Object.assign(pilotObj, shipOnly);
				delete mergedObj.name;

				//format shipAbility to be `${name}: ${text}`
				if(mergedObj.hasOwnProperty("shipAbility")) {
					mergedObj.shipAbility = getFormattedTitledText(mergedObj.shipAbility.name, mergedObj.shipAbility.text);
				}

				setFormattedAbility(mergedObj);
				setForceAndCharges(mergedObj);
				setImageLink(mergedObj);
				
				pilotsArray.push(mergedObj);
			});
		}
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
	//var actionsArray = getActionsArray(shipJson.actions);
	//shipJson.actions = actionsArray;
				
	return shipJson;
}

function getFormattedPilotName(pilotObj) {
	var bullet = pilotObj.limited ? "•" : "";
	var caption = pilotObj.hasOwnProperty("caption") ? `: <i>${pilotObj.caption}</i>` : "";
	return `${bullet}${pilotObj.name}${caption}`;
}

function getActionsArray(actions) {
	var actionsArray = [];
	actions.forEach(action => {
		var value = action.type;
        if(action.difficulty === "Red"){
			value = `<span class="red">${action.type}!</span>`;
		}
        
        if(action.hasOwnProperty("linked")){
			value += ` ▸ `;
			if(action.linked.difficulty === "Red"){
				value += `<span class="red">${action.linked.type}!</span>`;
			}
			else
			{
				value += `${action.linked.type}`;
			}
		}

        actionsArray.push(`[${value}]`);
	});
	
	return actionsArray;
}

/**
 * Will bold keywords like Action:, Setup:, and Attack:
 * Will append conditions if exists.
 * @param {*} json 
 */
function setFormattedAbility(json) {
	if(json.hasOwnProperty("ability")) {
		json.ability = json.ability.replace(/Action:/g, "<b>Action:</b>");
		json.ability = json.ability.replace("Setup:", "<b>Setup:</b>");
		json.ability = json.ability.replace("Attack:", "<b>Attack:</b>");
		json.ability = json.ability.replace("Attack ([Lock]):", "<b>Attack ([Lock]):</b>");
		json.ability = json.ability.replace("Attack ([Focus]):", "<b>Attack ([Focus]):</b>");

		if(json.ability === "Attack") {
			//Dorsal Turret
			json.ability = "<b>Attack</b>";
		}
	}

	if(json.hasOwnProperty("conditions") && json.conditions.length > 0) {
		var condition = conditions[json.conditions[0]];
		json.ability = `<div>${json.ability}</div><hr></hr><div>${getFormattedTitledText(condition.name, condition.ability)}</div>`; 
	}
}

/**
 * Some abilities and conditions have titles with text. This formats it for displaying.
 * @param {string} title 
 * @param {text} text 
 */
function getFormattedTitledText(title, text) {
	return `<b><i>${title}:</i></b> ${text}`;
}

/**
 * if force/charges can recover, then append ▴
 * @param {*} json 
 */
function setForceAndCharges(json) {
	if(json.hasOwnProperty("force") && json.force.recovers === 1) {
		json.force.value += "▴";
	}
	if(json.hasOwnProperty("charges") && json.charges.recovers === 1) {
		json.charges.value += "▴";
	}
}

function setImageLink(json) {
	if(json.hasOwnProperty("image")) {
		json["image_link"] = `<a href="${json.image}">image</a>`;
	}
}

function createUpgradesJson() {
	var upgradesArray = [];
	var upgradeDir = "./submodules/xwing-data2/data/upgrades/*.json";
	var upgradeFilePaths = glob.sync(upgradeDir);
	upgradeFilePaths.forEach(upgradeFilePath => {
		var content = fs.readFileSync(upgradeFilePath);
		var json = JSON.parse(content);
		json.forEach(upgrade => {

			var restrictions = getRestrictions(upgrade.restrictions);

			upgrade.sides.forEach(side => {
				//only parse upgrade content if ffg id is defined (to filter out preview content)
				if(side.hasOwnProperty("ffg")) {
					side["restrictions"] = restrictions;
					side["limited"] = upgrade.limited;

					if(side.hasOwnProperty("actions")) {
						var actionsArray = getActionsArray(side.actions);
						side.actions = actionsArray;
					}

					setFormattedAbility(side);
					setCost(side, upgrade.cost);
					setAddStats(side);
					setAddRemoveSlots(side);
					setForceAndCharges(side);
					setAttack(side);
					setImageLink(side);

					upgradesArray.push(side);
				}
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
		var variable = capitalize(cost.variable);
		for (var key in cost.values) {
			if(cost.values.hasOwnProperty(key)) {
				var value = `${variable}-${key} = ${cost.values[key]}`;
				variableCost.push(value);
			}
		}
		side["variable_cost"] = variableCost.join(", ");
	}
}

function setAddStats(side) {
	var statsArray = [];
	if(side.hasOwnProperty("grants")) {
		side.grants.forEach(grant => {
			if(grant.type === "stat") {
				var value = `${capitalize(grant.value)} +${grant.amount}`;
				statsArray.push(value);
			}
		});

		side["add_stats"] = statsArray.join(", ");
	}
}

function capitalize(word) {
	return word.charAt(0).toUpperCase() + word.slice(1);
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
					restrictionsArray.push(shipsArray[ship_xws].name || ""); //add "" for preview content
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

function setAttack(side) {
	if(side.hasOwnProperty("attack")) {
		side["attack_arc"] = side.attack.arc;
		side["attack_value"] = side.attack.value;
		side["attack_range"] = `${side.attack.minrange}-${side.attack.maxrange}`;
		side["attack_ordnance"] = side.attack.ordnance;

		delete side.attack;
	}
}

function createDamageDeckJson() {
	var damageDeckFilePath = "./submodules/xwing-data2/data/damage-decks/core.json"
	var content = fs.readFileSync(damageDeckFilePath);
	var json = JSON.parse(content);

	damageDeckArray = [];
	json.cards.forEach(card => {
		damageDeckArray.push(card);
	});

	var damageDeckData = {"data": damageDeckArray};
	var damageDeckDataFilePath = "./public/data/damage-deck.json";
	fs.writeFileSync(damageDeckDataFilePath, JSON.stringify(damageDeckData));
	console.log(`\n *CREATED ${damageDeckDataFilePath} * \n`);
}