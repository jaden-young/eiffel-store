import '/imports/startup/client';

import { Template } from "meteor/templating";
import { renderGraph } from "../imports/ui/components/graph.js";

import "./main.html";
import {
    getAggregatedGraph,
    getNodeAncestorGraph
} from '../imports/api/events/methods.js'



Template.eventchain.onCreated(() => {
    console.log('event chain template created');
    let nodeId = '6acc3c87-75e0-4b6d-88f5-b1a5d4e62b43';
    // showEventchain(nodeId);
});


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