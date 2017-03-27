/**
 * Created by seba on 2017-03-25.
 */

import './eventchain.html';

import { getEventAncestorGraph } from '/imports/api/events/methods';
import { renderGraph } from './graph';

Template.eventchain.rendered = () => {
    console.log('event chain template created');
    let eventId = '6acc3c87-75e0-4b6d-88f5-b1a5d4e62b43';
    showEventChain(eventId);
};

// Attempt to asynchronously fetch graph from server
function showEventChain(eventId) {
    console.log('rendering event chain');
    getEventAncestorGraph.call({ eventId: eventId }, function (error, graph) {
        if (error) {
            console.log(error);
        } else {
            let container = document.getElementById('cy-event-chain');
            let onClick = (event) => {
                console.log(event.cyTarget.id());
            };
            console.log('rendering graph, client', graph);
            renderGraph(graph, container, onClick);
            console.log('event chain rendered');
        }
    })

    /*getEventAncestorGraph.call({ eventId: eventId }, function (error, graph) {
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
    });*/
}