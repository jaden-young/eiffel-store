/**
 * Created by seba on 2017-03-25.
 */

import { Template } from "meteor/templating";
import { renderGraph } from "./graph.js";

import './aggregation.html';
import { getAggregatedGraph } from '/imports/api/events/methods.js';
import vis from 'vis';

Template.aggregation.rendered = () => {


    // Runs when document is ready
    $(() => {
        console.log('document is loaded');
        let fromInput = $('#date-from'),
            toInput = $('#date-to'),
            limitInput = $('#limit'),
            datepickers = $('.datepicker'),
            defaultLimit = 500,
            defaultFrom = '2012-01-01',
            defaultTo = '2017-01-01';

        // Set default input values
        fromInput.val(defaultFrom);
        toInput.val(defaultTo);
        limitInput.val(defaultLimit);

        // Set up datepicker;
        datepickers.datepicker({
            changeMonth: true,
            changeYear: true,
            dateFormat: "yy-mm-dd"
        });

        /* TEST TIMELINE */
    // DOM element where the Timeline will be attached
        let container = document.getElementById('example-timeline');
    // Create a DataSet with data
        let data = new vis.DataSet([{
            id: '1',
            content: 'Lower limit',
            start: defaultFrom
        }, {
            id: '2',
            content: 'Upper limit',
            start: defaultTo
        }]);
    // Configuration for the Timeline as JSON object
        let options = {
            width: '70%',
            height: '150px',
            max: new Date(Date.now()).toLocaleDateString(), //Todays date
            min: '01/01/2000',  // IS HARDCODED NOW, SHOULD BE THE DATE OF THE FIRST EVENT
            editable: {updateTime: true},
            selectable: true,
            onMove: function (item, callback) {
                    let limit = parseInt(limitInput.val());
                if(item.id === 1){
                    let from = Date.parse(new Date(item.start).toLocaleDateString());
                    let to = Date.parse(toInput.val());
                    fromInput.val(new Date(item.start).toLocaleDateString());
                    showAggregation(from, to, limit);
                }else if(item.id === 2){
                    let from = Date.parse(fromInput.val());
                    let to = Date.parse(new Date(item.start).toLocaleDateString());
                    toInput.val(new Date(item.start).toLocaleDateString());
                    showAggregation(from, to, limit);
                }
            }
        };
    // Create a Timeline
        let timeline = new vis.Timeline(container, data, options);
        /*---------------*/

        let onChange = () => {
            let from = Date.parse(fromInput.val()),
                to = Date.parse(toInput.val()),
                limit = parseInt(limitInput.val());
            timeline.setItems( new vis.DataSet([{
                id: 1,
                content: 'Lower limit',
                start: fromInput.val()
            }, {
                id: 2,
                content: 'Upper limit',
                start: toInput.val()
            }]));
            showAggregation(from, to, limit);
        };


        datepickers.on('change', onChange);
        limitInput.on('change', onChange);

        // Trigger on change to fetch and render graph
        fromInput.trigger('change');
    });
};

// Attempt to asynchronously fetch graph from server
function showAggregation(from, to, limit) {
    console.log('rendering aggregation');



    getAggregatedGraph.call({from: from, to: to, limit: limit}, function (error, graph) {
        if (error) {
            console.log(error);
        } else {
            let container = document.getElementById('cy-aggregation');
            let onClick = (event) => {
                console.log(event.cyTarget.data());
            };
            console.log('rendering aggregation, now', graph);
            renderGraph(graph, container, onClick);
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