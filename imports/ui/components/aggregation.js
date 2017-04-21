'use strict';
import {Template} from "meteor/templating";
import {renderGraph} from "./graph.js";

import "./aggregation.html";
import {getAggregatedGraph} from "/imports/api/eventSequences/methods";
import {Session} from "meteor/session";

Template.aggregation.rendered = () => {
    // Runs when document is ready
    $(() => {
        let fromInput = $('#date-from'),
            toInput = $('#date-to'),
            limitInput = $('#limit'),
            datepickers = $('.datepicker'),
            defaultLimit = 500,
            defaultFrom = '01/02/2012',
            defaultTo = '01/02/2018';

        // Set default input values
        fromInput.val(defaultFrom);
        toInput.val(defaultTo);
        limitInput.val(defaultLimit);

        // Set up datepicker;
        datepickers.datepicker({
            changeMonth: true,
            changeYear: true
        });

        let onChange = () => {
            let from = Date.parse(fromInput.val()),
                to = Date.parse(toInput.val()),
                limit = parseInt(limitInput.val());

            showAggregation(from, to, limit);
        };

        datepickers.on('change', onChange);
        limitInput.on('change', onChange);

        let from = Date.parse(fromInput.val()),
            to = Date.parse(toInput.val()),
            limit = parseInt(limitInput.val());

        //showAggregation(from, to, limit);

        // Trigger on change to fetch and render graph
        fromInput.trigger('change');
    });
};

// Attempt to asynchronously fetch graph from server
function showAggregation(from, to, limit) {
    getAggregatedGraph.call({from: from, to: to, limit: limit}, function (error, graph) {
        if (error) {
            console.log(error);
        } else {
            let container = $('#cy-aggregation');

            Session.set('displayedSequenceIds', graph.sequences);
            renderGraph(graph, container);
        }
    });
}