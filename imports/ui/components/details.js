import {Template} from "meteor/templating";
import "./details.html";
import {getLevelTwoGraph} from "/imports/api/events/methods.js";

require('datatables.net-bs')(window, $);

let table;
let dataTables;
let tableColumns;
let loader;
let tableContainer;

$(document).ready(function () {
    tableContainer = $('#table-level2-container');
    table = $('#table-level2');
    tableColumns = $('#table-level2-columns');
    loader = $('#table-level2-loader');

    loader.hide();
});


Template.aggregation.events({
    'click .aggregation-tt-btn': function (event) {

        tableContainer.hide();
        loader.show();

        $('html, body').animate({
            scrollTop: $("#details-container").offset().top - 10
        }, "slow");


        populateGraph(event.target.value);
    }
});


function populateGraph(nodeName) {

    getLevelTwoGraph.call({nodeName: nodeName}, function (error, tableData) {

        tableColumns.empty();


        if (error) {
            loader.hide();
            console.log("Error");
            console.log(error);
        } else {

            tableContainer.show();
            loader.hide();
            _.each(tableData.columnNames, (columnName) => {
                tableColumns.append('<th>' + columnName + '</th>')

            });

            dataTables = table.DataTable({
                destroy: true,
                lengthMenu: [[100, -1], [100, "All"]],
                scrollY: "400px",
                scrollCollapse: true,
                // paging: false,
                data: tableData.rows
            });

        }
    });
}