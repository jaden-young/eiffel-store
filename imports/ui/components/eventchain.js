'use strict';
import "./eventchain.html";

import {getEventAncestorGraph} from "/imports/api/eiffelevents/methods";
import {renderGraph} from "./graph";

Template.eventchain.rendered = () => {
    let eventId = '6acc3c87-75e0-4b6d-88f5-b1a5d4e62b43';
    showEventChain(eventId);
};

// Attempt to asynchronously fetch graph from server
function showEventChain(eventId) {
    getEventAncestorGraph.call({eventId: eventId}, function (error, graph) {
        if (error) {
            console.log(error);
        } else {
            let container = document.getElementById('cy-event-chain');
            renderGraph(graph, container);
        }
    });
}