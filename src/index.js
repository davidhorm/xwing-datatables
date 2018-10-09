function setClickHandlers() {
    var tabBar = new mdc.tabBar.MDCTabBar(document.querySelector('.mdc-tab-bar'));
    tabBar.preventDefaultOnClick = true;

    tabBar.listen("MDCTabBar:activated", function(t) {
        var tabIndex = t.detail.index;
        
        if(tabIndex === 0) {
            $('#upgradeDiv').hide();
            $('#pilotDiv').show();
        }
        else if (tabIndex === 1) {
            $('#pilotDiv').hide();
            $('#upgradeDiv').show();
        }
    });
}

function loadDataTable(){

    function populateTable(tableId, dataPath, columnsConfig) {
        var table = $(tableId).DataTable({
            "ajax": dataPath,
            "columns": columnsConfig,
            "bSort": false, //disable sort because excelTableFilter plugin will handle it
            "paging": false, //disable paging to show all data

            //enable excel export button
            "dom": "Bfrtip",
            "buttons": [
                "colvis",   //column visibility button
                {
                    "extend": "excel",  //export to excel button
                    "title": null,
                    "exportOptions": {
                        "format": {
                            "header": function(data, columnId) {
                                var removeAt = data.indexOf("<div"); //remove filter text from header
                                return data.substr(0,removeAt);
                            }
                        }
                    }
                }
            ]
        });

        //when table is drawn the first time, then draw the column filters
        table.one( 'draw', function () {
            $(tableId).excelTableFilter();
        });
    }

    var pilotColumnsConfig = [
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
            "title": "Faction",
            "data": "faction"
        },
        {
            "title":"Ship Name",
            "data": "ship_name"
        },
        {
            "title": "Limited",
            "data": "limited",
            //"width": "82px",
            "className":"dt-body-center"
        },
        {
            "title": "Initiative",
            "data": "initiative",
            //"width": "90px",
            "className":"dt-body-center"
        },
        {
            "title": "Cost",
            "data": "cost",
            //"width": "61px",
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
            "render":"[, ]"
        },
        {
            "title":"Attack Value",
            "className":"dt-body-center",
            "data": "attack_value"
        },
        {
            "title":"Attack Arc",
            "data": "attack_arc"
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
            "title":"Image",
            "data": "image"
        }
    ];

    populateTable("#pilotTable", "data/pilots.json", pilotColumnsConfig);
    

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
            "title": "Is Ordnance", 
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
            "title": "Image", 
            "data": "image",
            "defaultContent": "" //broken image url for one record
        }
    ];

    populateTable("#upgradeTable", "data/upgrades.json", upgradeColumnsConfig);
}