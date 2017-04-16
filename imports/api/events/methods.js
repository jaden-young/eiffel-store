'use strict';
import {Meteor} from "meteor/meteor";
import {ValidatedMethod} from "meteor/mdg:validated-method";
import {Events} from "./events.js";
import {isConfidenceLevelEvent, isTestEvent} from "./eventTypes.js";

export const getLevelTwoGraph = new ValidatedMethod({
        name: 'getLevelTwoGraph',
        validate: null,
        run({nodeName}){
            let events = Events.find({
                "data.customData": {
                    "value": nodeName,
                    "key": "name"
                }
            }).fetch();

            let columnNames = [
                ["ID"],
                ["Timestamp"],
                ["Execution time"],
                ["Passrate"]
            ];

            let rows = [];
            _.each(events, (event) => {
                    rows.push([
                        event.meta.id,
                        (new Date(event.meta.time)).toString(),
                        "-",
                        "-"

                        // event._id._str, // _id
                    ])
                }
            );

            return {
                columnNames: columnNames,
                name: nodeName,
                rows: rows
            };
        }
    })
;

/*
 * Returns a graph object in Cytoscape syntax with aggregated Eiffel events as nodes.
 */
export const getAggregatedGraph = new ValidatedMethod({
    name: 'getAggregatedGraph',
    validate: null,
    run({from, to, limit}) {
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
            let node = {
                data: {
                    id: group,
                    events: events,
                    length: _.size(events),

                    // This code is only run if there are events
                    // so it is assumed that the first element exists.
                    // The aggregated type is also the same type as every
                    // aggregated event.
                    type: events[0].meta.type

                }
            };

            if (isTestEvent(node.data.type)) {
                let valueCount = _.countBy(events, (event) => event.data.outcome.verdict);
                let passedCount = valueCount.hasOwnProperty('PASSED') ? valueCount['PASSED'] : 0;
                let failedCount = valueCount.hasOwnProperty('FAILED') ? valueCount['FAILED'] : 0;
                node.data.inconclusive = valueCount.hasOwnProperty('INCONCLUSIVE') ? valueCount['INCONCLUSIVE'] : 0;
                node.data.passed = passedCount;
                node.data.failed = failedCount;
            }

            if (isConfidenceLevelEvent(node.data.type)) {
                let valueCount = _.countBy(events, (event) => event.data.value);
                node.data.passed = valueCount.hasOwnProperty('SUCCESS') ? valueCount['SUCCESS'] : 0;
                node.data.failed = valueCount.hasOwnProperty('FAILURE') ? valueCount['FAILURE'] : 0;
                node.data.inconclusive = valueCount.hasOwnProperty('INCONCLUSIVE') ? valueCount['INCONCLUSIVE'] : 0;
                node.data.name = events[0].data.name;
            }

            nodes.push(node);

            // Save the links from events -> group and group -> events to reconstruct group -> group later
            let links = _.reduce(events, (memo, event) => memo.concat(event.links), []);
            groupToEvents[group] = _.pluck(links, 'target');
            _.each(events, (event) => eventToGroup[event.meta.id] = group);
        });

        // Construct edges between groups
        let edges = [];
        _.each(groupToEvents, (events, group) => {
            let toGroups = (_.uniq(_.map(events, (event) => eventToGroup[event])));
            _.each(toGroups, (toGroup) => edges.push({data: {source: group, target: toGroup}}));
        });
        return {nodes: nodes, edges: edges};
    }
});


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
                let event = Events.findOne({'meta.id': eventId});
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