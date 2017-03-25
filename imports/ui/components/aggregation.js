/**
 * Created by seba on 2017-03-25.
 */

import { Template } from "meteor/templating";
import { renderGraph } from "./graph.js";

import './aggregation.html';
import { getAggregatedGraph } from '/imports/api/events/methods.js';

Template.aggregation.rendered = () => {
    console.log('aggregation template created');
    console.log($);
    console.log($('#date-from'));

    // Runs when document is ready
    $(() => {
        console.log('document is loaded');
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

        console.log('set defaults');
        // Set up datepicker;
        datepickers.datepicker({
            changeMonth: true,
            changeYear: true
        });

        console.log('datepickers done');
        let onChange = () => {
            let from = Date.parse(fromInput.val()),
                to = Date.parse(toInput.val()),
                limit = parseInt(limitInput.val());

            console.log('dates changed', from, to, limit);
            showAggregation(from, to, limit);
        };
        console.log('on change bound');

        datepickers.on('change', onChange);
        limitInput.on('change', onChange);

        // Trigger on change to fetch and render graph
        fromInput.trigger('change');

        console.log('completed setting up aggregation')
    });
};


// Attempt to asynchronously fetch graph from server
function showAggregation(from, to, limit) {
    console.log('rendering aggregation');
    getAggregatedGraph.call(from, to, limit, function (error) {
        if (error) {
            console.log(error);
        } else {
            let container = document.getElementById('cy-aggregation');
            let onClick = (event) => {
                console.log(event.cyTarget.id());
            };
            console.log('got graph', graph);
            renderGraph(graph, container, onClick);
            console.log('aggregation rendered');
        }
    });

    /*Meteor.call('getAggregatedGraph', from, to, limit, (error, graph) => {
     if (error) {
     console.log(error);
     } else {
     let container = document.getElementById('cy-aggregation');
     let onClick = (event) => {
     console.log(event.cyTarget.id());
     };
     console.log('got graph', graph);
     renderGraph(graph, container, onClick);
     console.log('aggregation rendered');
     }
     });*/
}