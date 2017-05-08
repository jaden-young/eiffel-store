'use strict';
import {Template} from "meteor/templating";
import "./details.html";
import "./button-row.html";

import {$} from "meteor/jquery";
import dataTablesBootstrap from "datatables.net-bs";
import "datatables.net-bs/css/dataTables.bootstrap.css";
import {Session} from "meteor/session";
import {getResultOverTime} from "../../api/rows/methods";
import {renderDetailedGraph} from "./detailed-graph";


dataTablesBootstrap(window, $);

let table = undefined;
let plot = undefined;
let plotContainer = undefined;
let invalidPlotEvent = undefined;
let loader = undefined;
let graph2d = undefined;
let waitLock = false;

Template.details.rendered = () => {
    // Runs when document is ready
    $(() => {
        table = $('#details_table');
        plot = $('#details_chart');
        plotContainer = $('#plot_container');
        loader = $('#details_loader');
        invalidPlotEvent = $('#invalid_plot_event');


        table.show();
        plotContainer.hide();

        invalidPlotEvent.hide();
        loader.hide();

        $(function () {
            $('#details_toggle').change(function () {
                if ($(this).prop('checked')) {
                    table.hide();
                    plotContainer.show();

                    if (waitLock === false && graph2d === undefined) {
                        renderSuccessRateGraph(plot);
                    }
                } else {
                    table.show();
                    plotContainer.hide();
                }
            });
        });
    });
};

Template.aggregation.events({
    'click .aggregation-tt-btn': function (event) {
        Session.set('nodeNameFilter', (event.target.value).split(';')[0]);
        Session.set('nodeTypeFilter', (event.target.value).split(';')[1]);
        $('#table-level2-heading').html(Session.get('nodeNameFilter'));

        invalidPlotEvent.hide();
        plot.hide();

        if (graph2d !== undefined) {
            graph2d.destroy();
            graph2d = undefined;
        }
        $('#details_toggle').prop('checked', false).change();


        $('html, body').animate({
            scrollTop: $("#details").offset().top - 10
        }, "slow");
    }
});

Template.details.onCreated(function () {
    Session.set('nodeTypeFilter');
    Session.set('nodeNameFilter');
    Session.set('displayedSequenceIds');
});
Template.details.helpers({
    selector() {
        return {name: Session.get('nodeNameFilter'), sequenceId: {$in: (Session.get('displayedSequenceIds'))}}
    }
});

function renderSuccessRateGraph(container) {
    loader.show();
    waitLock = true;
    getResultOverTime.call({
        eventName: Session.get('nodeNameFilter'),
        eventType: Session.get('nodeTypeFilter'),
        sequenceIds: Session.get('displayedSequenceIds')
    }, function (error, data) {
        if (error) {
            console.log(error);
            waitLock = false;
            loader.hide();
        } else {
            // console.log('returned');
            console.log(data);
            graph2d = renderDetailedGraph(container, data);
            waitLock = false;
            loader.hide();
            if (graph2d === undefined) {
                invalidPlotEvent.show();
                plot.hide();
            } else {
                invalidPlotEvent.hide();
                plot.show();
            }
        }
    });
}