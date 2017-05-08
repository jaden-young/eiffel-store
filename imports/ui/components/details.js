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

Template.details.rendered = () => {
    // Runs when document is ready
    $(() => {
        let table = $('#details_table');
        let graph = $('#details_chart');

        table.show();
        graph.hide();

        $(function () {
            $('#details_toggle').change(function () {
                if ($(this).prop('checked')) {
                    table.hide();
                    graph.show();

                    console.log('called');

                    renderSuccessRateGraph(graph);

                } else {
                    table.show();
                    graph.hide();
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
    getResultOverTime.call({
        eventName: Session.get('nodeNameFilter'),
        eventType: Session.get('nodeTypeFilter'),
        sequenceIds: Session.get('displayedSequenceIds')
    }, function (error, data) {
        if (error) {
            console.log(error);
        } else {
            // console.log('returned');
            console.log(data);
            renderDetailedGraph(container, data);
        }
    });
}