import {Meteor} from "meteor/meteor";
import {ValidatedMethod} from "meteor/mdg:validated-method";
import {EiffelEvents} from "./eiffelevents.js";

export const getEventAncestorGraph = new ValidatedMethod({
    name: 'getEventAncestorGraph',
    validate: null,
    run({eventId}) {
        let emptyGraph = {nodes: {}, edges: {}};
        if (Meteor.isClient) {
            return emptyGraph;
        }

        if (Meteor.isServer) {
            let createAncestorGraph = function (graph, eventId) {
                let event = EiffelEvents.findOne({'meta.id': eventId});
                let parentIds = _.map(event.links, (link) => link.target);

                // Save nodes in a map to prevent duplicates
                graph.nodes[eventId] = ({data: {id: event.meta.id, label: event.meta.type}});

                // Save edges in a map to prevent duplicates
                _.each(parentIds, (parentId) => {
                    let id = eventId + ':' + parentId;
                    graph.edges[id] = {
                        data: {
                            id: id,
                            source: eventId,
                            target: parentId
                        }
                    }
                });
                return _.reduce(parentIds, createAncestorGraph, graph);
            };

            let graph = createAncestorGraph(emptyGraph, eventId);
            return {nodes: _.values(graph.nodes), edges: _.values(graph.edges)};
        }
    }
});