/**
 * Created by seba on 2017-03-25.
 */

import './eventchain.html';

import { getEventAncestorGraph } from '/imports/api/events/methods';
import { renderGraph } from './graph';

Template.eventchain.onCreated(() => {
    console.log('event chain template created');
    let eventId = '6acc3c87-75e0-4b6d-88f5-b1a5d4e62b43';
    showEventchain(eventId);
});


// Attempt to asynchronously fetch graph from server
function showEventchain(eventId) {
    console.log('rendering event chain');
    getEventAncestorGraph.call({ eventId: eventId }, function (error, graph) {
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