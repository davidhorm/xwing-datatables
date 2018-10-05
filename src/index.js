function loadDataTable(){
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
                    var stats = shipsData[ship_xws].stats;
                    var stat = stats.filter(function(stat){ return stat.type === "attack"; });
                    if(stat.length === 1){
                        return stat[0].value
                    }
                    else if (stat.length === 2){
                        return `${stat[0].value}, ${stat[1].value}`;
                    }
                }
            },
            {
                "title":"Attack Arc",
                "data": "ship_xws",
                "render": function ( ship_xws, type, row, meta ) {
                    var stats = shipsData[ship_xws].stats;
                    var stat = stats.filter(function(stat){ return stat.type === "attack"; });
                    if(stat.length === 1){
                        return stat[0].arc
                    }
                    else if (stat.length === 2){
                        return `${stat[0].arc}, ${stat[1].arc}`;
                    }
                }
            },
            {
                "title":"Agility",
                "className":"dt-body-center",
                "data": "ship_xws",
                "render": function ( ship_xws, type, row, meta ) {
                    var stats = shipsData[ship_xws].stats;
                    var stat = stats.filter(function(stat){ return stat.type === "agility"; });
                    return stat[0].value;
                }
            },
            {
                "title":"Hull",
                "className":"dt-body-center",
                "data": "ship_xws",
                "render": function ( ship_xws, type, row, meta ) {
                    var stats = shipsData[ship_xws].stats;
                    var stat = stats.filter(function(stat){ return stat.type === "hull"; });
                    return stat[0].value;
                }
            },
            {
                "title":"Shields",
                "className":"dt-body-center",
                "data": "ship_xws",
                "render": function ( ship_xws, type, row, meta ) {
                    var stats = shipsData[ship_xws].stats;
                    var stat = stats.filter(function(stat){ return stat.type === "shields"; });
                    return stat.length > 0 ? stat[0].value : "";
                }
            },
            {
                "title":"Actions",
                "data": "ship_xws",
                "render": function ( ship_xws, type, row, meta ) {
                    var actionsArray = [];
                    var actions = shipsData[ship_xws].actions;
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
                    return actionsArray.join("<br />");
                }
            }
        ];
    
        var pilotTable = $('#pilotTable').DataTable({
            "ajax": "data/pilots.json",
            "columns": pilotColumnsConfig,
            "bSort": false, //disable sort because excelTableFilter plugin will handle it
            "paging": false //disable paging to show all data
        });
    
        //when table is drawn the first time, then draw the column filters
        pilotTable.one( 'draw', function () {
            $('#pilotTable').excelTableFilter();
        });
    });
}