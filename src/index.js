var tableDivs = ['#pilotDiv', '#upgradeDiv', '#damageDeckDiv'];

function loadPage() {
    hideAllTables();
    $(tableDivs[0]).show(); //show first div by default
    setClickHandlers();
    loadDataTables();
}

function hideAllTables() {
    tableDivs.forEach(function(tableDiv) {
        $(tableDiv).hide();
    });
}

function setClickHandlers() {
    var tabBar = new mdc.tabBar.MDCTabBar(document.querySelector('.mdc-tab-bar'));
    tabBar.preventDefaultOnClick = true;

    tabBar.listen("MDCTabBar:activated", function(t) {
        var tabIndex = t.detail.index;
        hideAllTables();
        $(tableDivs[tabIndex]).show();
    });
}

function loadDataTables() {
    populatePilotTable();
    populateUpgradeTable();
    populateDamageDeckTable();
}

function populateTable(tableId, dataPath, columnsConfig) {
    var table = $(tableId).DataTable({
        "ajax": dataPath,
        "columns": columnsConfig,
        "bSort": false, //disable sort because excelTableFilter plugin will handle it
        "paging": false, //disable paging to show all data
        "autoWidth": false, //set static width

        //enable excel export button
        "dom": "Bfrtip",
        "buttons": getButtonsConfig()
    });

    //when table is drawn the first time, then draw the column filters
    table.one( 'draw', function () {
        $(tableId).excelTableFilter();
    });
}

function getButtonsConfig() {
    var buttonsConfig = {
        "dom": {
            "button": {
                //replace dt-button class added by datatable with mdc class name
                "tag": "button",
                "className": "mdc-button mdc-button--dense",
                "active": "mdc-button--unelevated"
            }
        },
        "buttons": [
            {   //column visibility button
                "extend": "colvis",  
                "className": "mdc-button"   //add mdc button style
            },
            {   //export to excel button
                "extend": "excel",          
                "className": "mdc-button",  //add mdc button style
                "title": null,  //remove header from first row of document
                "exportOptions": {
                    "format": {
                        "header": function(data, columnId) {
                            //remove filter text from column header
                            var removeAt = data.indexOf("<div"); 
                            return removeAt > 0 ? data.substr(0,removeAt) : data;
                        }
                    }
                }
            }
        ]
    };

    return buttonsConfig;
}

function populatePilotTable() {
    var pilotColumnsConfig = [
        {
            "title": "Pilot", 
            "data": "pilot_name_formatted",
            "visible": false //hidden because not easily filterable, but user can display later
        },
        {
            "title": "Pilot Name", 
            "data": "pilot_name"
        },
        {
            "title": "Caption",
            "data": "caption",
            "defaultContent": ""
        },
        {
            "title": "Limited",
            "data": "limited",
            "className":"dt-body-center"
        },
        {
            "title": "Faction",
            "data": "faction"
        },
        {
            "title":"Ship Name",
            "data": "ship_name"
        },
        {
            "title": "Initiative",
            "data": "initiative",
            "className":"dt-body-center"
        },
        {
            "title": "Cost",
            "data": "cost",
            "className":"dt-body-center"
        },
        {
            "title": "Pilot Ability", 
            "data": "ability",
            "defaultContent": ""
        },
        {
            "title": "Ship Ability", 
            "data": "shipAbility",
            "defaultContent": ""
        },
        {
            "title":"Actions",
            "data": "actions",
            "render":"[, ]"
        },
        {
            "title": "Slots",
            "data": "slots",
            "render":"[, ]"
        },
        {
            "title":"Size",
            "data": "size"
        },
        {
            "title":"Dial",
            "data": "dial",
            "render":"[, ]",
            "visible": false //hidden in browser, but shown in excel
        },
        {
            "title":"Attack Arc",
            "data": "attack_arc"
        },
        {
            "title":"Attack Value",
            "className":"dt-body-center",
            "data": "attack_value"
        },
        {
            "title":"Agility",
            "className":"dt-body-center",
            "data": "agility"
        },
        {
            "title":"Hull",
            "className":"dt-body-center",
            "data": "hull"
        },
        {
            "title":"Shields",
            "className":"dt-body-center",
            "defaultContent": "",
            "data": "shields"
        },
        {
            "title":"Force",
            "className":"dt-body-center",
            "defaultContent": "",
            "data": "force.value"
        },
        {
            "title":"Charges",
            "className":"dt-body-center",
            "defaultContent": "",
            "data": "charges.value"
        },
        {
            "title":"Image Link",
            "data": "image_link"
        },
        {
            "title":"Image Url",
            "data": "image",
            "visible": false //hidden, but will be shown in excel export
        }
    ];

    populateTable("#pilotTable", "data/pilots.json", pilotColumnsConfig);
}

function populateUpgradeTable() {
    var upgradeColumnsConfig = [
        {
            "title": "Name", 
            "data": "title"
        },
        {
            "title": "Limited", 
            "data": "limited",
            "className":"dt-body-center"
        },
        {
            "title": "Slots", 
            "data": "slots",
            "render": "[, ]"
        },
        {
            "title": "Cost", 
            "data": "cost",
            "className":"dt-body-center",
            "defaultContent": ""
        },
        {
            "title": "Variable Cost", 
            "data": "variable_cost",
            "defaultContent": ""
        },
        {
            "title": "Ability", 
            "data": "ability",
            "defaultContent": ""
        },
        {
            "title": "Restrictions", 
            "data": "restrictions",
            "defaultContent": ""
        },
        {
            "title":"Force",
            "className":"dt-body-center",
            "defaultContent": "",
            "data": "force.value"
        },
        {
            "title":"Charges",
            "className":"dt-body-center",
            "defaultContent": "",
            "data": "charges.value"
        },
        {
            "title": "Attack Arc", 
            "data": "attack_arc",
            "defaultContent": ""
        },
        {
            "title": "Attack Value", 
            "data": "attack_value",
            "className":"dt-body-center",
            "defaultContent": ""
        },
        {
            "title": "Attack Range", 
            "data": "attack_range",
            "className":"dt-body-center",
            "defaultContent": ""
        },
        {
            "title": "Range Bonus", 
            "data": "attack_ordnance",
            "className":"dt-body-center",
            "defaultContent": ""
        },
        {
            "title": "Add Actions", 
            "data": "actions",
            "defaultContent": ""
        },
        {
            "title": "Add Stats", 
            "data": "add_stats",
            "defaultContent": ""
        },
        {
            "title": "Add Slots", 
            "data": "add_slots",
            "defaultContent": ""
        },
        {
            "title": "Remove Slots", 
            "data": "remove_slots",
            "defaultContent": ""
        },
        {
            "title":"Image Link",
            "data": "image_link",
            "defaultContent": "" //broken image url for one record
        },
        {
            "title":"Image Url",
            "data": "image",
            "defaultContent": "", //broken image url for one record
            "visible": false //hidden in browser, but shown in excel
        }
    ];

    populateTable("#upgradeTable", "data/upgrades.json", upgradeColumnsConfig);
}

function populateDamageDeckTable() {
    var damageDeckColumnsConfig = [
        {
            "title": "Title", 
            "data": "title"
        },
        {
            "title": "Amount", 
            "data": "amount",
            "className":"dt-body-center"
        },
        {
            "title": "Type", 
            "data": "type"
        },
        {
            "title": "Text", 
            "data": "text"
        }
    ];

    populateTable("#damageDeckTable", "data/damage-deck.json", damageDeckColumnsConfig);
}