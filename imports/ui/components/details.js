'use strict';
import {Template} from "meteor/templating";
import "./details.html";
import {getLevelTwoGraph} from "/imports/api/events/methods.js";

import {$} from "meteor/jquery";
import dataTablesBootstrap from "datatables.net-bs";
import "datatables.net-bs/css/dataTables.bootstrap.css";
dataTablesBootstrap(window, $);

let table;
let dataTables;
let tableColumns;
let loader;
let tableContainer;
let infoNoData;
let infoError;
let panelHeading;

function showDiv(div) {
    infoNoData.hide();
    infoError.hide();
    loader.hide();
    tableContainer.hide();
    panelHeading.hide();

    switch (div) {
        case "info":
            infoNoData.show();
            break;
        case "error":
            infoError.show();
            break;
        case "loader":
            loader.show();
            break;
        case "table":
            tableContainer.show();
            panelHeading.show();
            break;
        default:
            break;
    }
}

$(document).ready(function () {

    infoNoData = $('#table-level2-nodata');
    infoError = $('#table-level2-error');
    loader = $('#table-level2-loader');
    tableContainer = $('#table-level2-container');
    panelHeading = $('#table-level2-heading');

    table = $('#table-level2');
    tableColumns = $('#table-level2-columns');

    showDiv("info");
});


Template.aggregation.events({
    'click .aggregation-tt-btn': function (event) {

        showDiv("loader");

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
            showDiv("error");

        } else {

            panelHeading.html(nodeName);
            showDiv("table");
            _.each(tableData.columnNames, (columnName) => {
                tableColumns.append('<th>' + columnName + '</th>')

            });

            dataTables = table.DataTable({
                destroy: true,
                lengthMenu: [[50, -1], [50, "All"]],
                scrollY: "600px",
                scrollCollapse: true,
                // paging: false,
                data: tableData.rows
            });

        }
    });
}