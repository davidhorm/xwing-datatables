/** Defines tab's divId to show/hide content, and tableObj to show/hide fixed header */
var tabDefinitions = [
    {"divId": "#pilotDiv", "tableObj": null},
    {"divId": "#upgradeDiv", "tableObj": null},
    {"divId": "#damageDeckDiv", "tableObj": null},
    {"divId": "#aboutDiv", "tableObj": null}
];

function loadPage() {
    hideAllTables();
    $(tabDefinitions[0].divId).show(); //show first div by default
    setClickHandlers();
    loadDataTables();
}

/** Iterate through all tabDefinitions and hide div. Also hide fixed header. */
function hideAllTables() {
    tabDefinitions.forEach(function(tabDef, index) {
        //hide whole div
        $(tabDef.divId).hide();

        //hide fixed column
        setFixedHeaderVisibility(tabDefinitions[index].tableObj, false);
    });
}

/**
 * Show or Hide the table header. Since the headers are fixed, we need to change visibility based on what tab we're on.
 * @param {DataTable} tableObj - DataTable object when setting $.DataTables
 * @param {boolean} isVisibile - TRUE will make the header visible
 */
function setFixedHeaderVisibility(tableObj, isVisibile) {
    if(tableObj !== null) {
        var tableContainer = $(tableObj.table().container());
        tableContainer.css( 'display', isVisibile ? 'block' : 'none');
        tableObj.fixedHeader.adjust();
    }
}

/** When clicking on the tabs, hide everything. Then show specific div and fixed header. */
function setClickHandlers() {
    var tabBar = new mdc.tabBar.MDCTabBar(document.querySelector('.mdc-tab-bar'));
    tabBar.preventDefaultOnClick = true;

    tabBar.listen("MDCTabBar:activated", function(t) {
        var tabIndex = t.detail.index;
        hideAllTables();
        $(tabDefinitions[tabIndex].divId).show();
        setFixedHeaderVisibility(tabDefinitions[tabIndex].tableObj, true);
    });
}

function loadDataTables() {
    populatePilotTable();
    populateUpgradeTable();
    populateDamageDeckTable();
}

/**
 * Populate the DataTable with common configuration settings.
 * @param {string} tableId - id of the <table>. Needs to include #
 * @param {string} dataPath - filepath of the json file to load into the DataTable
 * @param {JSON} columnsConfig - {"columns"} configuration used by DataTables
 */
function populateTable(tableId, dataPath, columnsConfig) {
    var table = $(tableId).DataTable({
        "ajax": dataPath,
        "columns": columnsConfig,
        "autoWidth": false, //set static width
        "paging": false, //disable paging to show all data
        "processing": true, //show indicator when sorting/filtering takes a long time
        "fixedHeader": true, //fix the header when scrolling
        "colReorder": true, //enable column reordering
        
        //enable excel export button
        "dom": "Bfrtip",
        "buttons": getButtonsConfig(),

        //when table loaded draw filter
        "initComplete": function () { createDropdownFilter(this); }
    });
    
    return table;
}

/** {"buttons"} configuration used by DataTables. Used to show Column Visibility and Excel buttons. */
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

//#region Create Column Dropdown Filters

function createDropdownFilter(dataTable) {
    dataTable.api().columns().every( function () {
        var column = this;
        var headerText = $(column.header()).text();

        var dropdown = $('<div class="dropdown"></div>').appendTo( $(column.header()) );

        if(headerText !== "Image Link"){
            getSortButtons(column).appendTo(dropdown);
            getSearchBox(column, headerText).appendTo(dropdown);
            getCheckboxes(column, headerText).appendTo(dropdown);
        }
    });
}

function getSortButtons(column) {
    var sortDiv = $('<div class="sort"></div>');

    $('<div>A to Z</div>')
        .appendTo(sortDiv)
        .on('click', function() {
            column.order('asc').draw();
        });

    $('<div>Z to A</div>')
        .appendTo(sortDiv)
        .on('click', function() {
            column.order('desc').draw();
        });

    return sortDiv;
}

function getSearchBox(column, headerText) {
    var searchbox = $('<div class="searchbox"></div>');
    var input = $('<input type="text" placeholder="Search '+headerText+'" />')
        .appendTo(searchbox)
        .on( 'keyup change', function () {
            if ( column.search() !== this.value ) {
                column
                    .search( this.value )
                    .draw();
            }
        });
                    
    return searchbox;
}

function getCheckboxes(column, headerText) {
    var checkboxes = $('<div class="checkboxes"></div>');
    /*
    var select = $('<select><option value=""></option></select>')
    .appendTo( dropdown )
    .on( 'change', function () {
        var val = $.fn.dataTable.util.escapeRegex(
            $(this).val()
        );

        column
            .search( val ? '^'+val+'$' : '', true, false )
            .draw();
    } );*/

    var columnData = getColumnData(column, headerText); //
    
    columnData.forEach( function ( d ) {
        var val = d.toString().replace(/"/g, ''); //remove all quotes
        $('<input type="checkbox" checked="checked" name="'+headerText+'" value="'+d+'">'+d+'</input><br />')
            .appendTo(checkboxes)
            .on( 'change', function () {
                var columnName = this.name;
                var tableId = this.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.id;
                var self = this;
            });
    });

    return checkboxes;
}

function getColumnData(column, headerText) {
    var uniqueData = new Set();

    var delimitedHeaders = ["Actions", "Slots"];

    column.data().each(function(data) {
        if(delimitedHeaders.indexOf(headerText) >= 0) {
            for(var i = 0; i < data.length; i++) {
                var value = $('<div>' + data[i] + '</div>').text();
                uniqueData.add(value);
            }
        }
        else {
            var value = $('<div>' + data + '</div>').text();
            uniqueData.add( value );
        }
    });

    //initial sort
    var sortedData = Array.from(uniqueData).sort();
    
    //then sort if it's a number
    sortedData.sort(function(a,b) {
        if(!isNaN(parseInt(a)) && !isNaN(parseInt(b))) { 
            return parseInt(a) - parseInt(b);
        }
        else {
            return a - b;
        }
    });

    return sortedData;
}

//#endregion Create Column Dropdown Filters

//#region Populate DataTables

function populatePilotTable() {
    var pilotColumnsConfig = [
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
            "title": "Pilot", 
            "data": "pilot_name_formatted",
            "orderable": false, //disable sort on column to add dropdown filter
            "visible": false //hidden because not easily filterable, but user can display later
        },
        {
            "title": "Pilot Name", 
            "data": "pilot_name",
            "orderable": false, //disable sort on column to add dropdown filter
        },
        {
            "title": "Caption",
            "data": "caption",
            "defaultContent": "",
            "orderable": false, //disable sort on column to add dropdown filter
        },
        {
            "title": "Limited",
            "data": "limited",
            "className":"dt-body-center",
            "orderable": false, //disable sort on column to add dropdown filter
        },
        {
            "title": "Cost",
            "data": "cost",
            "className":"dt-body-center",
            "orderable": false, //disable sort on column to add dropdown filter
        },
        {
            "title": "Pilot Ability", 
            "data": "ability",
            "defaultContent": "",
            "orderable": false, //disable sort on column to add dropdown filter
        },
        {
            "title": "Ship Ability", 
            "data": "shipAbility",
            "defaultContent": "",
            "orderable": false, //disable sort on column to add dropdown filter
        },
        {
            "title":"Actions",
            "data": "actions",
            "render":"[, ]",
            "orderable": false, //disable sort on column to add dropdown filter
        },
        {
            "title": "Slots",
            "data": "slots",
            "render":"[, ]",
            "orderable": false, //disable sort on column to add dropdown filter
        },
        {
            "title":"Size",
            "data": "size",
            "orderable": false, //disable sort on column to add dropdown filter
        },
        {
            "title":"Dial",
            "data": "dial",
            "render":"[, ]",
            "orderable": false, //disable sort on column to add dropdown filter
            "visible": false //hidden in browser, but shown in excel
        },
        {
            "title":"Attack Arc",
            "data": "attack_arc",
            "orderable": false, //disable sort on column to add dropdown filter
        },
        {
            "title":"Attack Value",
            "className":"dt-body-center",
            "data": "attack_value",
            "orderable": false, //disable sort on column to add dropdown filter
        },
        {
            "title":"Agility",
            "className":"dt-body-center",
            "data": "agility",
            "orderable": false, //disable sort on column to add dropdown filter
        },
        {
            "title":"Hull",
            "className":"dt-body-center",
            "data": "hull",
            "orderable": false, //disable sort on column to add dropdown filter
        },
        {
            "title":"Shields",
            "className":"dt-body-center",
            "defaultContent": "",
            "data": "shields",
            "orderable": false, //disable sort on column to add dropdown filter
        },
        {
            "title":"Force",
            "className":"dt-body-center",
            "defaultContent": "",
            "data": "force.value",
            "orderable": false, //disable sort on column to add dropdown filter
        },
        {
            "title":"Charges",
            "className":"dt-body-center",
            "defaultContent": "",
            "data": "charges.value",
            "orderable": false, //disable sort on column to add dropdown filter
        },
        {
            "title":"Image Link",
            "data": "image_link",
            "orderable": false //disable sort on column to add dropdown filter
        },
        {
            "title":"Image Url",
            "data": "image",
            "orderable": false, //disable sort on column to add dropdown filter
            "visible": false //hidden, but will be shown in excel export
        }
    ];

    var tableObj = populateTable("#pilotTable", "data/pilots.json", pilotColumnsConfig);
    tabDefinitions[0].tableObj = tableObj;

    //sort the first visible column
    tableObj.column("0:visible").order("asc").draw();
}

function populateUpgradeTable() {
    var upgradeColumnsConfig = [
        {
            "title": "Name", 
            "data": "title",
            "orderable": false, //disable sort on column to add dropdown filter
        },
        {
            "title": "Limited", 
            "data": "limited",
            "className":"dt-body-center",
            "orderable": false, //disable sort on column to add dropdown filter
        },
        {
            "title": "Slots", 
            "data": "slots",
            "render": "[, ]",
            "orderable": false, //disable sort on column to add dropdown filter
        },
        {
            "title": "Cost", 
            "data": "cost",
            "className":"dt-body-center",
            "defaultContent": "",
            "orderable": false, //disable sort on column to add dropdown filter
        },
        {
            "title": "Variable Cost", 
            "data": "variable_cost",
            "defaultContent": "",
            "orderable": false, //disable sort on column to add dropdown filter
        },
        {
            "title": "Ability", 
            "data": "ability",
            "defaultContent": "",
            "orderable": false, //disable sort on column to add dropdown filter
        },
        {
            "title": "Restrictions", 
            "data": "restrictions",
            "defaultContent": "",
            "orderable": false, //disable sort on column to add dropdown filter
        },
        {
            "title":"Force",
            "className":"dt-body-center",
            "defaultContent": "",
            "data": "force.value",
            "orderable": false, //disable sort on column to add dropdown filter
        },
        {
            "title":"Charges",
            "className":"dt-body-center",
            "defaultContent": "",
            "data": "charges.value",
            "orderable": false, //disable sort on column to add dropdown filter
        },
        {
            "title": "Attack Arc", 
            "data": "attack_arc",
            "defaultContent": "",
            "orderable": false, //disable sort on column to add dropdown filter
        },
        {
            "title": "Attack Value", 
            "data": "attack_value",
            "className":"dt-body-center",
            "defaultContent": "",
            "orderable": false, //disable sort on column to add dropdown filter
        },
        {
            "title": "Attack Range", 
            "data": "attack_range",
            "className":"dt-body-center",
            "defaultContent": "",
            "orderable": false, //disable sort on column to add dropdown filter
        },
        {
            "title": "Range Bonus", 
            "data": "attack_ordnance",
            "className":"dt-body-center",
            "defaultContent": "",
            "orderable": false, //disable sort on column to add dropdown filter
        },
        {
            "title": "Add Actions", 
            "data": "actions",
            "defaultContent": "",
            "orderable": false, //disable sort on column to add dropdown filter
        },
        {
            "title": "Add Stats", 
            "data": "add_stats",
            "defaultContent": "",
            "orderable": false, //disable sort on column to add dropdown filter
        },
        {
            "title": "Add Slots", 
            "data": "add_slots",
            "defaultContent": "",
            "orderable": false, //disable sort on column to add dropdown filter
        },
        {
            "title": "Remove Slots", 
            "data": "remove_slots",
            "defaultContent": "",
            "orderable": false, //disable sort on column to add dropdown filter
        },
        {
            "title":"Image Link",
            "data": "image_link",
            "orderable": false //disable because it just says image
        },
        {
            "title":"Image Url",
            "data": "image",
            "orderable": false, //disable sort on column to add dropdown filter
            "visible": false //hidden in browser, but shown in excel
        }
    ];

    var tableObj = populateTable("#upgradeTable", "data/upgrades.json", upgradeColumnsConfig);
    tabDefinitions[1].tableObj = tableObj;
}

function populateDamageDeckTable() {
    var damageDeckColumnsConfig = [
        {
            "title": "Title", 
            "data": "title",
            "orderable": false, //disable sort on column to add dropdown filter
        },
        {
            "title": "Amount", 
            "data": "amount",
            "className":"dt-body-center",
            "orderable": false, //disable sort on column to add dropdown filter
        },
        {
            "title": "Type", 
            "data": "type",
            "orderable": false, //disable sort on column to add dropdown filter
        },
        {
            "title": "Text", 
            "data": "text",
            "orderable": false //disable sort on column to add dropdown filter
        }
    ];

    var tableObj = populateTable("#damageDeckTable", "data/damage-deck.json", damageDeckColumnsConfig);
    tabDefinitions[2].tableObj = tableObj;
}

//#endregion Populate DataTables