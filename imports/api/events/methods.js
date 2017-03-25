/**
 * Created by seba on 2017-03-24.
 */

import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Events } from './events.js';

/*
 * Returns a graph object in Cytoscape syntax with aggregated Eiffel events as nodes.
 */
export const getAggregatedGraph = new ValidatedMethod({
    name: 'getAggregatedGraph',
    validate: null,
    run({ from, to, limit }) {
        // Below values will fetch events between 2015 and 2018
        // from: 1420070400000 2015
        // to: 1514764800000 2018

        let events = Events.find(
            {'meta.time': {$gte: parseInt(from), $lte: parseInt(to)}},
            {limit: limit})
            .fetch();

        // Maps individual event node id's to their aggregated node's id and vice versa
        let groupToEvents = {};
        let eventToGroup = {};

        // Assumes that the events list data.customData contains a unique value
        // first in the list and provided to the Eiffel event by the event producer.
        // Very brittle.
        let nodes = [];
        let groupedEvents = _.groupBy(events, (event) => event.data.customData[0].value);
        _.each(groupedEvents, (events, group) => {
            nodes.push({
                data: {
                    id: group,
                    label: group,
                    events: events
                }
            });

            // Save the links from events -> group and group -> events to reconstruct group -> group later
            let links = _.reduce(events, (memo, event) => memo.concat(event.links), []);
            groupToEvents[group] = _.pluck(links, 'target');
            _.each(events, (event) => eventToGroup[event.meta.id] = group);
        });
        let evs = _.flatten(_.map(nodes, (n) => n.data.events));
        let count = evs.length;

        // Construct edges between groups
        let edges = [];
        _.each(groupToEvents, (events, group) => {
            let toGroups = (_.uniq(_.map(events, (event) => eventToGroup[event])));
            _.each(toGroups, (toGroup) => edges.push({data: {source: group, target: toGroup}}));
        });
        return {nodes: nodes, edges: edges};
    }
});

/*
 * Returns a graph in Cytoscape syntax consisting of the entire ancestry of provided node.
 */
export const getEventAncestorGraph = new ValidatedMethod({
    name: 'getEventAncestorGraph',
    validate: null,
    run({ eventId }) {
        console.log('fetching ancestry for', eventId);
        let createAncestorGraph = function (graph, eventId) {
            let event = Events.findOne({'meta.id': eventId});
            console.log('fetched event', event);
            // Maps the node's Eiffel-links into a list of ids
            let parentIds = _.map(event.links, (link) => link.target);

            // Save nodes in a map to prevent duplicates
            graph.nodes[eventId] = ({ data: { id: event.meta.id, label: event.meta.type }});

            // Save edges in a map to prevent duplicates
            _.each(parentIds, (parentId) => {
                let id = eventId + ':' + parentId;
                graph.edges[id] = { data: {
                    source: eventId,
                    target: parentId
                }}
            });
            return _.reduce(parentIds, createAncestorGraph, graph);
        };

        let graph = createAncestorGraph({nodes: {}, edges: {}}, eventId);

        // Map the objects to lists to be compatible with Cytoscape
        return { nodes: _.values(graph.nodes), edges: _.values(graph.edges) };
    }
});
