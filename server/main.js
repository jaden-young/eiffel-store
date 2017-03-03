import { Meteor } from 'meteor/meteor';


let eiffelEvents = new Mongo.Collection('eiffel-events');

Meteor.startup(() => {
    Meteor.methods({

        /*
         * Returns a graph object in Vis syntax with aggregated Eiffel events as nodes.
         */
        getAggregatedGraph: function (from, to, limit) {
            // Below values will fetch events between 2015 and 2018
            // from: 1420070400000 2015
            // to: 1514764800000 2018

            let events = eiffelEvents.find(
                { 'meta.time': { $gte: parseInt(from), $lte: parseInt(to) }},
                { limit: limit })
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
                nodes.push({ data: {
                    id: group,
                    label: group,
                    count: events.length
                }});

                // Save the links from events -> group and group -> events to reconstruct group -> group later
                let links = _.reduce(events, (memo, event) => memo.concat(event.links), []);
                groupToEvents[group] = _.pluck(links, 'target');
                _.each(events, (event) => eventToGroup[event.meta.id] = group);
            });

            // Construct edges between groups
            let edges = [];
            _.each(groupToEvents, (events, group) => {
                let toGroups = (_.uniq(_.map(events, (event) => eventToGroup[event])));
                _.each(toGroups, (toGroup) => edges.push({ data: { source: group, target: toGroup }}));
            });
            return { nodes: nodes, edges: edges };
        },

        /*
         * Returns a graph in Vis syntax consisting of the entire ancestry of provided node.
         */
        getNodeAncestorGraph: function (nodeId) {
            let createAncestorGraph = function (graph, nodeId) {
                let event = eiffelEvents.findOne({'meta.id': nodeId});

                // Maps the node's Eiffel-links into a list of ids
                let parentIds = _.map(event.links, (link) => link.target);

                // Save nodes in a map to prevent duplicates
                graph.nodes[nodeId] = ({ data: { id: event.meta.id, label: event.meta.type }});

                // Save edges in a map to prevent duplicates
                _.each(parentIds, (parentId) => {
                    let id = nodeId + ':' + parentId;
                    graph.edges[id] = { data: {
                        source: nodeId,
                        target: parentId
                    }}
                });
                return _.reduce(parentIds, createAncestorGraph, graph);
            };

            let graph = createAncestorGraph({nodes: {}, edges: {}}, nodeId);

            // Map the objects to lists to be compatible with Vis
            return { nodes: _.values(graph.nodes), edges: _.values(graph.edges) };
        }
    });
});