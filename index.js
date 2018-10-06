function setClickHandlers() {
    $('#pilotLink').click(e => {
        e.preventDefault(); 
        $('#upgradeDiv').hide();
        $('#pilotDiv').show();
        return false;
    });
    
    $('#upgradeLink').click(e => {
        e.preventDefault(); 
        $('#pilotDiv').hide();
        $('#upgradeDiv').show();
        return false;
    });
}

function loadDataTable(){

    function populateTable(tableId, dataPath, columnsConfig) {
        var pilotTable = $(tableId).DataTable({
            "ajax": dataPath,
            "columns": columnsConfig,
            "bSort": false, //disable sort because excelTableFilter plugin will handle it
            "paging": false //disable paging to show all data
        });
    
        //when table is drawn the first time, then draw the column filters
        pilotTable.one( 'draw', function () {
            $(tableId).excelTableFilter();
        });
    }

    //first load ships data
    $.getJSON( "data/ships.json", function( shipsData ) {
        var pilotColumnsConfig = [
            {
                "title": "Faction",
                "data": "ship_xws",
                "render": function ( ship_xws, type, row, meta ) {
                    return shipsData[ship_xws].faction;
                }
            },
            {
                "title":"Ship Name",
                "data": "ship_xws",
                "render": function ( ship_xws, type, row, meta ) {
                    return shipsData[ship_xws].name;
                }
            },
            {
                "title": "Initiative",
                "data": "initiative",
                //"width": "90px",
                "className":"dt-body-center"
            },
            {
                "title": "Pilot Name", 
                "data": "name"
            },
            {
                "title": "Caption",
                "data": "caption",
                "defaultContent": ""
            },
            {
                "title": "Limited",
                "data": "limited",
                //"width": "82px",
                "className":"dt-body-center"
            },
            {
                "title": "Cost",
                "data": "cost",
                //"width": "61px",
                "className":"dt-body-center"
            },
            {
                "title": "Ability", 
                "data": "ability",
                "defaultContent": ""
            },
            {
                "title": "Slots",
                "data": "slots",
                "render":"[, ]"
            },
            {
                "title":"Size",
                "data": "ship_xws",
                "render": function ( ship_xws, type, row, meta ) {
                    return shipsData[ship_xws].size;
                }
            },
            {
                "title":"Dial",
                "data": "ship_xws",
                "render": function ( ship_xws, type, row, meta ) {
                    return shipsData[ship_xws].dial.join(", ");
                }
            },
            {
                "title":"Attack Value",
                "className":"dt-body-center",
                "data": "ship_xws",
                "render": function ( ship_xws, type, row, meta ) {
                    return  shipsData[ship_xws].attack_value;
                }
            },
            {
                "title":"Attack Arc",
                "data": "ship_xws",
                "render": function ( ship_xws, type, row, meta ) {
                    return  shipsData[ship_xws].attack_arc;
                }
            },
            {
                "title":"Agility",
                "className":"dt-body-center",
                "data": "ship_xws",
                "render": function ( ship_xws, type, row, meta ) {
                    return shipsData[ship_xws].agility;
                }
            },
            {
                "title":"Hull",
                "className":"dt-body-center",
                "data": "ship_xws",
                "render": function ( ship_xws, type, row, meta ) {
                    return shipsData[ship_xws].hull;
                }
            },
            {
                "title":"Shields",
                "className":"dt-body-center",
                "defaultContent": "",
                "data": "ship_xws",
                "render": function ( ship_xws, type, row, meta ) {
                    return shipsData[ship_xws].shields;
                }
            },
            {
                "title":"Actions",
                "data": "ship_xws",
                "render": function ( ship_xws, type, row, meta ) {
                    return shipsData[ship_xws].actions;
                }
            }
        ];
    
        populateTable("#pilotTable", "data/pilots.json", pilotColumnsConfig);
    });

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
            "title": "Add Actions", 
            "data": "actions",
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
        }
    ];

    populateTable("#upgradeTable", "data/upgrades.json", upgradeColumnsConfig);
}