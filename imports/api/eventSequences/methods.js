'use strict';
import {Meteor} from "meteor/meteor";

import {ValidatedMethod} from "meteor/mdg:validated-method";
import {Events} from "../events/events";
import {EventSequences} from "./event-sequences";
import {setProperty} from "../properties/methods";
import {getRedirectName, isConfidenceLevelEvent, isTestEvent} from "../events/event-types";

function getEventSequenceVersion() {
    return '0.8';
}
function getEventSequenceVersionPropertyName() {
    return 'eventSequenceVersion';
}

function setEventVersionProperty() {
    setProperty.call({propertyName: getEventSequenceVersionPropertyName(), propertyValue: getEventSequenceVersion()})
}

export const eventSequenceVersion = new ValidatedMethod({
    name: 'eventSequenceVersion',
    validate: null,
    run(){
        return getEventSequenceVersion();
    }
});

export const eventSequenceVersionPropertyName = new ValidatedMethod({
    name: 'eventSequenceVersionPropertyName',
    validate: null,
    run(){
        return getEventSequenceVersionPropertyName();
    }
});

export const populateEventSequences = new ValidatedMethod({
    name: 'populateEventSequences',
    validate: null,
    run(){
        console.log("Removing old events-sequences collection.");
        EventSequences.remove({});

        let total = Events.find().count();
        let done = 0;
        let lastPrint = ((done / total) * 100);

        console.log('Fetching ' + total + ' events from database. Please wait.');
        let events = Events.find().fetch();

        console.log('Processing events from database. Please wait.');

        let illegalBridgeTypes = [
            'EiffelArtifactCreatedEvent',
            'EiffelDocumentationCreatedEvent',
            'EiffelCompositionDefinedEvent',
            'EiffelEnvironmentDefinedEvent',
            'EiffelSourceChangeCreatedEvent',
            'EiffelSourceChangeSubmittedEvent'
        ];

        let legalTypes = [
            'CAUSE',
            'CONTEXT',
            'FLOW_CONTEXT',
            'ACTIVITY_EXECUTION',
            'PREVIOUS_ACTIVITY_EXECUTION',
            // 'PREVIOUS_VERSION', RangeError: Maximum call stack size exceeded
            'COMPOSITION',
            // 'ENVIRONMENT', MongoError: document is larger than the maximum size 16777216
            'ARTIFACT',
            'SUBJECT',
            // 'ELEMENT' MongoError: document is larger than the maximum size 16777216
            // 'BASE', RangeError: Maximum call stack size exceeded
            'CHANGE',
            'TEST_SUITE_EXECUTION',
            'TEST_CASE_EXECUTION',
            'IUT',
            'TERC',
            'MODIFIED_ANNOUNCEMENT',
            'SUB_CONFIDENCE_LEVEL',
            'REUSED_ARTIFACT',
            'VERIFICATION_BASIS',
        ];

        // Populate map
        let eventMap = {};
        _.each(events, (event) => {
            // Filtering links that would make us jump between sequences.
            if (event.type !== getRedirectName()) {
                event.targets = _.pluck(_.filter(event.links, function (link) {

                    return _.contains(legalTypes, link.type);

                    // return !(_.contains(illegalBridgeTypes, event.type));

                    // return true;
                }), 'target');
                event.targetedBy = [];
                event.dev.checked = false;
                event.dev.stop = _.contains(illegalBridgeTypes, event.type);
            } else {
                total--;
            }
            eventMap[event.id] = event;
        });

        // Find targetedBy
        _.each(events, (event) => {
            if (event.type !== getRedirectName()) {
                _.each(event.targets, (target, index) => {
                    if (eventMap[target].type === getRedirectName()) {
                        eventMap[event.id].targets[index] = eventMap[target].target;
                        target = eventMap[target].target;
                    }
                    let exists = _.find(eventMap[target].targetedBy, function (id) {
                        return id === event.id;
                    });
                    if (!exists) { //  && !(_.contains(illegalBridgeTypes, event.type))
                        (eventMap[target].targetedBy).push(event.id)
                    }
                    eventMap[event.id] = event;
                });
            }

            done++;
            let print = Math.floor((done / total) * 100);
            if (print >= (lastPrint + 20)) {
                console.log("Finding event parents progress: " + print + '% (' + done + '/' + total + ')');
                lastPrint = print;
            }
        });

        function getAllLinked(eventId) {
            // if(eventMap[eventId].dev.stop === true){
            //     let linkedEvents = [];
            //     linkedEvents.push(eventId);
            //     return linkedEvents;
            // }
            if (eventMap[eventId].dev.checked === true) {
                return [];
            }
            eventMap[eventId].dev.checked = true;

            let linkedEvents = [];
            linkedEvents.push(eventId);

            let targets = eventMap[eventId].targets;
            for (let index = 0; index < targets.length; index++) {
                linkedEvents = linkedEvents.concat(getAllLinked(targets[index]));
            }

            let targetedBys = eventMap[eventId].targetedBy;
            for (let index = 0; index < targetedBys.length; index++) {
                linkedEvents = linkedEvents.concat(getAllLinked(targetedBys[index]));
            }
            return linkedEvents;
        }

        let sequences = _.sortBy(_.reduce(events, function (memo, event) {
            let sequence = [];
            if (event.type !== getRedirectName()) {
                sequence = getAllLinked(event.id);
            }
            if (sequence.length > 0) { // 10
                memo.push(sequence);
            }
            return memo;
        }, []), 'timeFinish').reverse();


        done = 0;
        lastPrint = ((done / total) * 100);

        let sequenceIndex = 0;
        _.each(sequences, (sequence) => {
            let timeStart = undefined;
            let timeFinish = undefined;

            let sequenceEvents = _.reduce(sequence, function (memo, eventId) {
                let event = eventMap[eventId];
                if (timeStart === undefined || event.timeStart < timeStart) {
                    timeStart = event.timeStart;
                }
                if (timeFinish === undefined || event.timeFinish > timeFinish) {
                    timeFinish = event.timeFinish;
                }
                memo.push(event);
                return memo;
            }, []);

            EventSequences.insert({
                timeStart: timeStart,
                timeFinish: timeFinish,
                events: sequenceEvents,
                id: sequenceIndex,
                dev: {
                    // version: getEventSequenceVersion()
                }
            });

            sequenceIndex++;

            done = done + sequenceEvents.length;
            let print = Math.floor((done / total) * 100);
            if (print >= (lastPrint + 5)) {
                console.log("Populating event-sequence collection progress: " + print + '% (' + done + '/' + total + ')');
                lastPrint = print;
            }
        });

        setEventVersionProperty();
        let print = Math.floor((done / total) * 100);
        console.log("Event-sequence collection populated. [" + print + "%] (" + done + "/" + total + ")");
    }
});

export const getAggregatedGraph = new ValidatedMethod({
    name: 'getAggregatedGraph',
    validate: null,
    run({from, to, limit}) {
        if (Meteor.isServer) {
            // Below values will fetch events between 2015 and 2018
            // from: 1420070400000 2015
            // to: 1514764800000 2018

            let eventsSequences = EventSequences.find(
                {timeStart: {$gte: parseInt(from), $lte: parseInt(to)}},
                {sort: {timeFinish: -1}, limit: limit})
                .fetch();

            let sequencesIds = [];

            let events = _.reduce(eventsSequences, function (memo, sequence) {
                sequencesIds.push(sequence.id);
                return memo.concat(sequence.events);
            }, []);

            // console.log(events[0]);

            // Maps individual event node id's to their aggregated node's id and vice versa
            let groupToEvents = {};
            let eventToGroup = {};

            // Assumes that the events list data.customData contains a unique value
            // first in the list and provided to the Eiffel event by the event producer.
            // Very brittle.
            let nodes = [];
            let groupedEvents = _.groupBy(events, (event) => event.name);
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
                        type: events[0].type
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
                // console.log(links);
                groupToEvents[group] = _.reduce(events, (memo, event) => memo.concat(event.targets), []);
                _.each(events, (event) => {
                    eventToGroup[event.id] = group
                });
            });

            // Construct edges between groups
            let edges = [];
            _.each(groupToEvents, (events, group) => {
                let tmp1 = _.map(events, (event) => eventToGroup[event]);
                let toGroups = (_.uniq(tmp1));
                _.each(toGroups, (toGroup) => {
                    // if(toGroup !== undefined){
                    edges.push({data: {source: group, target: toGroup}})
                    // }
                });
            });

            return {nodes: nodes, edges: edges, sequences: sequencesIds};
        }
    }
});

export const getEventChainGraph = new ValidatedMethod({
    name: 'getEventChainGraph',
    validate: null,
    run({sequenceId}) {
        if (sequenceId === undefined) {
            return undefined;
        }
        if (Meteor.isServer) {
            let sequence = EventSequences.findOne({id: sequenceId}, {});

            let events = sequence.events;

            let nodeMap = {};
            _.each(events, (event) => {
                nodeMap[event.id] = event.name
            });

            let nodes = [];
            let edges = [];

            _.each(events, (event) => {
                let node = {
                    data: {
                        id: event.name,
                        events: [event],
                        length: 1,
                        type: event.type
                    }
                };

                if (isTestEvent(node.data.type)) {
                    let verdict = event.data.outcome.verdict;

                    let passedCount = 0;
                    let failedCount = 0;
                    let inconclusiveCount = 0;

                    if (verdict === 'PASSED') {
                        passedCount++;
                    } else if (verdict === 'FAILED') {
                        failedCount++;
                    } else {
                        inconclusiveCount++;
                    }
                    node.data.inconclusive = inconclusiveCount;
                    node.data.passed = passedCount;
                    node.data.failed = failedCount;
                }

                if (isConfidenceLevelEvent(node.data.type)) {
                    let value = event.data.value;

                    let passedCount = 0;
                    let failedCount = 0;
                    let inconclusiveCount = 0;

                    if (value === 'SUCCESS') {
                        passedCount++;
                    } else if (value === 'FAILURE') {
                        failedCount++;
                    } else {
                        inconclusiveCount++;
                    }

                    node.data.inconclusive = inconclusiveCount;
                    node.data.passed = passedCount;
                    node.data.failed = failedCount;
                    node.data.name = event.name;
                }

                nodes.push(node);

                _.each(event.targetedBy, (target) => {
                    edges.push(
                        {
                            data: {
                                source: nodeMap[target],
                                target: event.name
                            }
                        })
                });
            });
            // console.log(nodes);
            // console.log(edges);
            return {nodes: nodes, edges: edges, timeStart: sequence.timeStart, timeFinish:sequence.timeFinish};
        }
    }
});