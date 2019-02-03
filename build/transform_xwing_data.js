/* Transform the JSON from xwing-data2 to a readable format consumed by DataTables  */
var mkdirp = require('mkdirp');
var fs = require('fs');
var glob = require("glob");

console.log("\n *START TRANSFORM* ");

var shipsArray = {}; //used when parsing upgrades.json
var metadata = getMetadata();
var pilotsArray = [];
var upgradesArray = [];

/*
var metadataFilePath = "./build/ffg/metadata.json";
fs.writeFileSync(metadataFilePath, JSON.stringify(metadata, null, 4));
console.log(`\n *CREATED ${metadataFilePath} * \n`);
*/

//create data folder before creating .json files
mkdirp("./public/data", function (err) {
	if (err) {
    	console.error(err);
    }
    else {
		createPilotShipJson();
		//createUpgradesJson();
		//createDamageDeckJson();
		console.log("\n *END TRANSFORM * \n");
    }
}); 

function getMetadata() {
	var metadataFilePath = "./build/ffg/app-metadata.sorted.json"
	var metadataContent = fs.readFileSync(metadataFilePath);
	var metadataJson = JSON.parse(metadataContent);

	var extensionsFilePath = "./build/ffg/extensions.sorted.json"
	var extensionsContent = fs.readFileSync(extensionsFilePath);
	var extensionsJson = JSON.parse(extensionsContent);

	var conditionsFilePath = "./submodules/xwing-data2/data/conditions/conditions.json"
	var conditionsContent = fs.readFileSync(conditionsFilePath);
	var conditionsJson = { "conditions": JSON.parse(conditionsContent)};

	return Object.assign(metadataJson, extensionsJson, conditionsJson);
}

function createPilotShipJson() {
	var cardsFilePath = "./build/ffg/cards.sorted.json"
	var cardsContent = fs.readFileSync(cardsFilePath);
	var cardsJson = JSON.parse(cardsContent);

	cardsJson.cards.forEach(card => {
		//card.name
		//card.card_set_ids
		//card.available_actions
		//card.statistics
		//card.image
		//card.card_image
		//card.ability_text
		//card.cost //todo: convert "*" via xwing-data2
		//card.ship_ability_text //TODO; currently null or blank everywhere
		//card.force_side //can be null
		//card.is_unique
		
		if(card.card_type_id === 1) {
			addPilotCard(card);
		}
		else if (card.card_type_id === 2) {
			addUpgradeCard(card);
		}
		else {
			console.log(`*UNKNOWN CARD TYPE: ${card.card_type_id}`);
		}
	});

	console.log("done");

	/*
	var pilotsData = {"data": pilotsArray};
	var pilotsDataFilePath = "./public/data/pilots.json";
	fs.writeFileSync(pilotsDataFilePath, JSON.stringify(pilotsData));
	console.log(`*CREATED ${pilotsDataFilePath} *`);*/
}

function addPilotCard(card) {
	//card.faction_id
	//card.available_upgrades
	//card.subtitle
	//card.ship_size
	//card.initiative
	//card.ship_type

	//check assumptions
	if(card.restrictions.length > 0) { console.log(`pilot id=${card.id} has ${card.restrictions.length} restrictions.`); }
	if(card.upgrade_types.length > 0) { console.log(`pilot id=${card.id} has ${card.upgrade_types.length} upgrade_types.`); }
	if(card.weapon_range !== null) { console.log(`pilot id=${card.id} has ${card.weapon_range} weapon_range.`); }
	if(card.weapon_no_bonus === true) { console.log(`pilot id=${card.id} has ${card.weapon_no_bonus} weapon_no_bonus.`); }
}

function addUpgradeCard(card) {
	//card.restrictions
	//card.upgrade_types //slot
	//card.weapon_range
	//card.weapon_no_bonus
	
	//check assumptions
	if(card.available_upgrades.length > 0) { console.log(`upgrade id=${card.id} has ${card.available_upgrades.length} available_upgrades.`); }
	if(card.subtitle !== null) { console.log(`upgrade id=${card.id} has ${card.subtitle} subtitle.`); }
	if(card.ship_size !== null) { console.log(`upgrade id=${card.id} has ${card.ship_size} ship_size.`); }
	if(card.initiative !== null) { console.log(`upgrade id=${card.id} has ${card.initiative} initiative.`); }
	if(card.ship_type !== null) { console.log(`upgrade id=${card.id} has ${card.ship_type} ship_type.`); }
}

function createPilotShipJson_old() {
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
			shipsArray[shipOnly.xws] = shipOnly.name;
			
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
 * Will append conditions and device effects if exists.
 * @param {*} json 
 */
function setFormattedAbility(json) {
	//Bold keywords like Action:, Setup:, and Attack:
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

	//Append Conditions
	if(json.hasOwnProperty("conditions") && json.conditions.length > 0) {
		//invisible dash added because excel won't show <hr />, but will show in export
		var condition = conditions[json.conditions[0]];
		json.ability = `<div>${json.ability}</div><hr /><span class="hidden"> — </span><div>${getFormattedTitledText(condition.name, condition.ability)}</div>`; 
	}

	//Append Device Effects
	if(json.hasOwnProperty("device")) {
		//invisible dash added because excel won't show <hr />, but will show in export
		json.ability = `<div>${json.ability}</div><hr /><span class="hidden"> — </span><div>${getFormattedTitledText(json.device.name, json.device.effect)}</div>`; 
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
				var value = restriction.factions;
				
				//some upgrades require Scum or Vader/Ezra
				if(restriction.hasOwnProperty("names")) {
					value = value.concat(restriction.names);
				}

				restrictionsArray.push(value.join(" or "));
			}
			else if(restriction.hasOwnProperty("sizes")) {
				restrictionsArray.push(restriction.sizes.join(" or "));
			}
			else if(restriction.hasOwnProperty("arcs")) {
				restrictionsArray.push(restriction.arcs.join(" or "));
			}
			else if(restriction.hasOwnProperty("ships")) {
				var ships = [];
				restriction.ships.forEach(ship_xws => {
					ships.push(shipsArray[ship_xws]);
				});
				restrictionsArray.push(ships.join(" or "));
			}
			else if(restriction.hasOwnProperty("action")) {
				var value = restriction.action.type;
				if(restriction.action.difficulty === "Red") {
					value = `<span class="red">${value}!</span>`;
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