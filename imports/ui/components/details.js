'use strict';
import {Template} from "meteor/templating";
import "./details.html";
import "./button-row.html";

import {$} from "meteor/jquery";
import dataTablesBootstrap from "datatables.net-bs";
import "datatables.net-bs/css/dataTables.bootstrap.css";
import {Session} from "meteor/session";
import {getDetailedPlots} from "../../api/rows/methods";
import {renderDetailedGraph} from "./detailed-graph";


dataTablesBootstrap(window, $);

let table = undefined;
let plotPassFail = undefined;
let plotContainer = undefined;
let invalidPlotEvent = undefined;
let loader = undefined;
let graph2dPassFail = undefined;
let waitLock = false;

Template.details.rendered = () => {
    // Runs when document is ready
    $(() => {
        table = $('#details_table');
        plotPassFail = $('#plot_pass_fail');
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

                    if (waitLock === false && graph2dPassFail === undefined) {
                        renderSuccessRateGraph(plotPassFail);
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
        plotPassFail.hide();

        if (graph2dPassFail !== undefined) {
            graph2dPassFail.destroy();
            graph2dPassFail = undefined;
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
    getDetailedPlots.call({
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
            graph2dPassFail = renderDetailedGraph(container, data.plotPassFail);
            waitLock = false;
            loader.hide();
            if (graph2dPassFail === undefined) {
                invalidPlotEvent.show();
                plotPassFail.hide();
            } else {
                invalidPlotEvent.hide();
                plotPassFail.show();
            }
        }
    });
}