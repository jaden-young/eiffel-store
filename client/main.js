import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { renderGraph } from './ui.js';

import './main.html';

Template.graph.onCreated(() => {
    console.log('template created');

    let from = 1420070400000, to = 1514764800000, limit = 1000;
    showAggregation(from, to, limit);

    let nodeId = '6acc3c87-75e0-4b6d-88f5-b1a5d4e62b43';
    showEventchain(nodeId);
});

// Attempt to asynchronously fetch graph from server
function showAggregation(from, to, limit, callback) {
    console.log('rendering aggregation');
    Meteor.call('getAggregatedGraph', from, to, limit, (error, graph) => {
        if (error) {
            console.log(error);
        } else {
            let container = document.getElementById('cy-aggregation');
            let onClick = (event) => {
                console.log(event.cyTarget.id());
            };
            renderGraph(graph, container, onClick);
            console.log('aggregation rendered');
        }
    });
}

// Attempt to asynchronously fetch graph from server
function showEventchain(nodeId) {
    console.log('rendering event chain');
    Meteor.call('getNodeAncestorGraph', nodeId, function (error, graph) {
        if (error) {
            console.log(error);
        } else {
            let container = document.getElementById('cy-event-chain');
            let onClick = (event) => {
                console.log(event.cyTarget.id());
            };
            renderGraph(graph, container, onClick);
            console.log('event chain rendered');
        }
    });
}
