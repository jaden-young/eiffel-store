import {Template} from "meteor/templating";
import {renderGraph} from "./graph.js";

import "./aggregation.html";
import {getAggregatedGraph} from "/imports/api/events/methods.js";
import {Session} from "meteor/session";

Template.aggregation.rendered = () => {
    // Runs when document is ready
    $(() => {
        //console.log('document is loaded');
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

            let sequenceIds = showAggregation(from, to, limit);
            Session.set('displayedSequenceIds', sequenceIds);
        };

        datepickers.on('change', onChange);
        limitInput.on('change', onChange);

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
            let container = document.getElementById('cy-aggregation');
            console.log(graph);
            //console.log('rendering aggregation, now', graph);


            renderGraph(graph, container);
            return graph.sequences;
        }
    });
}