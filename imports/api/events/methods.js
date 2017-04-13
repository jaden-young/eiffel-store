/**
 * Created by seba on 2017-03-24.
 */

import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import { Events } from './events.js';
import {
    isTestEvent,
    isConfidenceLevelEvent,
    isFinishedEvent} from './eventTypes.js';

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

        console.log('beginning aggregation ');
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
            console.log(group);
            let node = {
                data: {
                    id: group,
                    events: events,
                    length: _.size(events),
                    type: events[0].meta.type
                },
                // This code is only run if there are events
                // so it is assumed that the first element exists.
                // The aggregated type is also the same type as every
                // aggregated event.
                //type: events[0].meta.type
            };

            if (isTestEvent(node.data.type)) {
                let valueCount = _.countBy(events, (event) => event.data.outcome.verdict);
                let passedCount = valueCount.hasOwnProperty('SUCCESS') ?  valueCount['SUCCESS'] : 0;
                node.data.passed = passedCount / _.size(events); // Bad name for the quotient?
            }

            if (isConfidenceLevelEvent(node.data.type)) {
                let valueCount = _.countBy(events, (event) => event.data.value);
                console.log('confience level', valueCount);
                node.data.passed = valueCount.hasOwnProperty('SUCCESS') ?  valueCount['SUCCESS'] : 0;
                node.data.failed = valueCount.hasOwnProperty('FAILURE') ?  valueCount['FAILURE'] : 0;
                node.data.inconclusive = valueCount.hasOwnProperty('INCONCLUSIVE') ?  valueCount['INCONCLUSIVE'] : 0;
                node.data.name = events[0].data.name;
                console.log('confience level nod ', node);
            }

            nodes.push(node);

            // Save the links from events -> group and group -> events to reconstruct group -> group later
            let links = _.reduce(events, (memo, event) => memo.concat(event.links), []);
            groupToEvents[group] = _.pluck(links, 'target');
            _.each(events, (event) => eventToGroup[event.meta.id] = group);
        });

        console.log('aggregated nodes');

        // let finishedEvents = _.filter(nodes, (node) => isFinishedEvent(node.meta.type));
        // Construct edges between groups
        let edges = [];
        _.each(groupToEvents, (events, group) => {
            let toGroups = (_.uniq(_.map(events, (event) => eventToGroup[event])));
            _.each(toGroups, (toGroup) => edges.push({data: {source: group, target: toGroup}}));
        });
        console.log('aggregated edges');
        //console.log('nodes', nodes);
        //console.log('edges', edges);
        return {nodes: nodes, edges: edges};

        /*return {nodes: [{data: {
            id: 'A',
            events: ['lite', 'grejer'],
            length: 2,
            type: 'någoteiffelevent'
        },
            passed: 2,
            failed: 0,
            inconclusive: 0
        }, {data: {id: 'B'}}], edges: [{data: {source:'A', target: 'B'}}]};*/
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