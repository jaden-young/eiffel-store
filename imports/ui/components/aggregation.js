
import { Template } from "meteor/templating";
import { renderGraph } from "./graph.js";

import './aggregation.html';
import { getAggregatedGraph } from '/imports/api/events/methods.js';
import vis from 'vis';


Template.aggregation.rendered = () => {


    // Runs when document is ready
    $(() => {
        //console.log('document is loaded');
        let fromInput = $('#date-from'),
            toInput = $('#date-to'),
            limitInput = $('#limit'),
            datepickers = $('.datepicker'),
            defaultLimit = 500,
            defaultFrom = '2015-01-01',
            defaultTo = '2018-01-01',
            fromTimeline = 1420070400000,// from: 1420070400000 2015
            toTimeline = 1514764800000;// to: 1514764800000 2018

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

        /* TIMELINE */
        let container = document.getElementById('example-timeline');
        // Timebars in the timeline
        let data = new vis.DataSet([{
            id: '1',
            content: 'Start',
            start: defaultFrom
        }, {
            id: '2',
            content: 'End',
            start: defaultTo
        }]);

        let options = {
            height: '150px',
            zoomMin: 3600000, // Setting 10 minutes as minimum zoom
            max: new Date(Date.now()).toLocaleDateString(), //Todays date
            min: '2010-01-01',  // IS HARDCODED NOW, SHOULD BE THE DATE OF THE FIRST EVENT
            editable: {updateTime: true},
            selectable: true,
            onMove: function (item, callback) {
                    let limit = parseInt(limitInput.val());
                if(item.id === 1){
                    let from = Date.parse(item.start),
                        to = toTimeline;
                    fromInput.val(new Date(item.start).toLocaleDateString('sv'));
                    fromTimeline = Date.parse(item.start);
                    showAggregation(from, to, limit);
                }else if(item.id === 2){
                    let from = fromTimeline,
                        to = Date.parse(item.start);
                    toInput.val(new Date(item.start).toLocaleDateString('sv'));
                    toTimeline = Date.parse(item.start);
                    showAggregation(from, to, limit);
                }
            }
        };
        let timeline = new vis.Timeline(container, data, options);
        /*---------------*/

        //Aggregates new graph when datepicker changes values
        $('#date-from').change(
            function() {
                let limit = parseInt(limitInput.val());
                fromTimeline = Date.parse(fromInput.val())
                timeline.setItems( new vis.DataSet([{
                    id: 1,
                    content: 'Start',
                    start: fromTimeline
                }, {
                    id: 2,
                    content: 'End',
                    start: toTimeline
                }]));
                showAggregation(fromTimeline, toTimeline, limit);
            });

        $('#date-to').change(
            function() {
                let limit = parseInt(limitInput.val());
                toTimeline = Date.parse(toInput.val());
                    timeline.setItems( new vis.DataSet([{
                    id: 1,
                    content: 'Start',
                    start: fromTimeline
                }, {
                    id: 2,
                    content: 'End',
                    start: toTimeline
                }]));
                showAggregation(fromTimeline, toTimeline, limit);
            });

        $('#limit').change(
            function() {
                let limit = parseInt(limitInput.val());
                showAggregation(fromTimeline, toTimeline, limit);
            });

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
            renderGraph(graph, container);
        }
    });
}