'use strict';
import {Meteor} from "meteor/meteor";

import {ValidatedMethod} from "meteor/mdg:validated-method";
import {Events} from "../events/events";
import {EventSequences} from "./event-sequences";
import {getProperty, setProperty} from "../properties/methods";
import {isActivityEvent, isAnnouncementPublishedEvent, isConfidenceLevelEvent,
    isIssueVerifiedEvent, isTestEvent, getRedirectName} from "../events/event-types";

function getEventSequenceVersion() {
    return '1.3';
}
function getEventSequenceVersionPropertyName() {
    return 'eventSequences.version';
}
function getEventSequenceStartTimePropertyName() {
    return 'eventSequences.time.started';
}

function getEventSequenceFinishTimePropertyName() {
    return 'eventSequences.time.finished';
}

function setEventVersionProperty() {
    setProperty.call({propertyName: getEventSequenceVersionPropertyName(), propertyValue: getEventSequenceVersion()})
}

function invalidateEventVersionProperty() {
    setProperty.call({propertyName: getEventSequenceVersionPropertyName(), propertyValue: undefined})
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

export const getTimeSpan = new ValidatedMethod({
    name: 'getTimeSpan',
    validate: null,
    run(){
        return {
            timeStart: getProperty.call({propertyName: getEventSequenceStartTimePropertyName()}),
            timeFinish: getProperty.call({propertyName: getEventSequenceFinishTimePropertyName()})
        };
    }
});

export const populateEventSequences = new ValidatedMethod({
    name: 'populateEventSequences',
    validate: null,
    run(){
        console.log("Removing old events-sequences collection.");
        invalidateEventVersionProperty();
        EventSequences.remove({});

        let total = Events.find().count();
        let done = 0;
        let lastPrint = ((done / total) * 100);

        console.log('Fetching ' + total + ' events from database. Please wait.');
        let events = Events.find().fetch();

        console.log('Processing events from database. Please wait.');

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
            // 'BASE', // RangeError: Maximum call stack size exceeded
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

        let dangerousTypes = [
            'ELEMENT',
            'ENVIRONMENT',
            'BASE'
        ];

        // Populate map
        let eventMap = {};
        _.each(events, (event) => {
            // Filtering links that would make us jump between sequences.
            if (event.type !== getRedirectName()) {
                event.targets = _.pluck(_.filter(event.links, function (link) {
                    return _.contains(legalTypes, link.type);
                }), 'target');
                event.dangerousTargets = _.pluck(_.filter(event.links, function (link) {
                    return _.contains(dangerousTypes, link.type);
                }), 'target');
                event.targetedBy = [];
                event.dangerousTargetedBy = [];
                event.dev.checked = false;
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
                    if (!exists) {
                        (eventMap[target].targetedBy).push(event.id)
                    }
                    eventMap[event.id] = event;
                });

                _.each(event.dangerousTargets, (target, index) => {
                    if (eventMap[target].type === getRedirectName()) {
                        eventMap[event.id].dangerousTargets[index] = eventMap[target].target;
                        target = eventMap[target].target;
                    }
                    let exists = _.find(eventMap[target].dangerousTargetedBy, function (id) {
                        return id === event.id;
                    });
                    if (!exists) {
                        (eventMap[target].dangerousTargetedBy).push(event.id)
                    }
                    eventMap[event.id] = event;
                });
            }

            done++;
            let print = Math.floor((done / total) * 100);
            if (print >= (lastPrint + 50)) {
                console.log("Finding event parents progress: " + print + '% (' + done + '/' + total + ')');
                lastPrint = print;
            }
        });

        function getAllLinked(eventId, sequenceId) {
            // if(eventMap[eventId].dev.stop === true){
            //     let linkedEvents = [];
            //     linkedEvents.push(eventId);
            //     return linkedEvents;
            // }
            if (eventMap[eventId].dev.checked === true) {
                return [];
            }
            eventMap[eventId].dev.checked = true;
            eventMap[eventId].sequenceId = sequenceId;

            let linkedEvents = [];
            linkedEvents.push(eventId);

            let targets = eventMap[eventId].targets;
            for (let index = 0; index < targets.length; index++) {
                linkedEvents = linkedEvents.concat(getAllLinked(targets[index], sequenceId));
            }

            let targetedBys = eventMap[eventId].targetedBy;
            for (let index = 0; index < targetedBys.length; index++) {
                linkedEvents = linkedEvents.concat(getAllLinked(targetedBys[index], sequenceId));
            }
            return linkedEvents;
        }

        let sequencesIds = _.sortBy(_.reduce(events, function (memo, event) {
            let sequence = [];
            if (event.type !== getRedirectName()) {
                sequence = getAllLinked(event.id, memo.length);
            }
            if (sequence.length > 0) { // 10
                memo.push(sequence);
            }
            return memo;
        }, []), 'time.finished').reverse();


        console.log("Generating sequences.");
        let sequences = [];
        _.each(sequencesIds, (sequence) => {

            let timeStart = undefined;
            let timeFinish = undefined;

            let sequenceEvents = _.reduce(sequence, function (memo, eventId) {
                let event = eventMap[eventId];
                if (timeStart === undefined || event.time.started < timeStart) {
                    timeStart = event.time.started;
                }
                if (timeFinish === undefined || event.time.finished > timeFinish) {
                    timeFinish = event.time.finished;
                }

                memo.push(event);
                return memo;
            }, []);


            sequences.push({
                id: sequenceEvents[0].sequenceId,
                time: {
                    started: timeStart,
                    finished: timeFinish,
                },
                size: sequenceEvents.length,
                dev: {},
                events: sequenceEvents,
            });
        });

        done = 0;
        lastPrint = ((done / total) * 100);

        _.each(sequences, (sequence) => {
            let connections = [];
            _.each(sequence.events, (event) => {
                _.each(event.dangerousTargets.concat(event.dangerousTargetedBy), (target) => {
                    connections.push(eventMap[target].sequenceId);
                });

                done++;
                let print = Math.floor((done / total) * 100);
                if (print >= (lastPrint + 50)) {
                    console.log("Fining sequences connections: " + print + '% (' + done + '/' + total + ')');
                    lastPrint = print;
                }
            });
            sequence.connections = connections;
        });

        let latestTime = undefined;
        let earliestTime = undefined;

        done = 0;
        lastPrint = ((done / total) * 100);
        _.each(sequences, (sequence) => {
            if (latestTime === undefined || latestTime < sequence.timeFinish) {
                latestTime = sequence.timeFinish;
            }
            if (earliestTime === undefined || earliestTime > sequence.timeStart) {
                earliestTime = sequence.timeStart;
            }

            EventSequences.insert(sequence);

            done = done + sequence.events.length;
            let print = Math.floor((done / total) * 100);
            if (print >= (lastPrint + 5)) {
                console.log("Populating event-sequence collection progress: " + print + '% (' + done + '/' + total + ')');
                lastPrint = print;
            }
        });

        setProperty.call({propertyName: getEventSequenceStartTimePropertyName(), propertyValue: earliestTime});
        setProperty.call({propertyName: getEventSequenceFinishTimePropertyName(), propertyValue: latestTime});

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

            if (limit === 0) {
                return {nodes: [], edges: [], sequences: []};
            }

            let eventSequences = EventSequences.find(
                {"time.started": {$gte: parseInt(from), $lte: parseInt(to)}},
                {sort: {"time.finished": -1}, limit: limit})
                .fetch();


            let linkedSequences = {};
            _.each(eventSequences, (eventSequence) => {
                linkedSequences[eventSequence.id] = false;
            });

            _.each(eventSequences, (eventSequence) => {
                _.each(eventSequence.connections, (targetId) => {
                    if (linkedSequences[targetId] === undefined) {
                        linkedSequences[targetId] = EventSequences.findOne({id: targetId}, {})
                    }
                });
            });

            _.each(linkedSequences, (linkedSequence) => {
                if (linkedSequence !== false) {
                    eventSequences.push(linkedSequence);
                }
            });

            let sequencesIds = [];


            let events = _.reduce(eventSequences, function (memo, sequence) {
                sequencesIds.push(sequence.id);
                return memo.concat(sequence.events);
            }, []);

            // Maps individual event node id's to their aggregated node's id and vice versa
            let groupToEvents = {};
            let eventToGroup = {};

            let nodes = [];
            let groupedEvents = _.groupBy(events, (event) => event.name);
            _.each(groupedEvents, (events, group) => {
                let node = {
                    data: {
                        label: group,
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


                if (isActivityEvent(node.data.type)){
                    let valueCount = _.countBy(events, (event) => event.data.outcome.conclusion);
                    node.data.successful = valueCount.hasOwnProperty('SUCCESSFUL') ? valueCount['SUCCESSFUL'] : 0;
                    node.data.unsuccessful = valueCount.hasOwnProperty('UNSUCCESSFUL') ? valueCount['UNSUCCESSFUL'] : 0;
                    node.data.failed = valueCount.hasOwnProperty('FAILED') ? valueCount['FAILED'] : 0;
                    node.data.aborted = valueCount.hasOwnProperty('ABORTED') ? valueCount['ABORTED'] : 0;
                    node.data.timedOut = valueCount.hasOwnProperty('TIMED_OUT') ? valueCount['TIMED_OUT'] : 0;
                    node.data.inconclusive = valueCount.hasOwnProperty('INCONCLUSIVE') ? valueCount['INCONCLUSIVE'] : 0;
                    let totalQueueTime = _.reduce(events, (memo, event) => {
                        return memo + (event.timeStart - event.timeTriggered);
                    }, 0);
                    let totalRunTime = _.reduce(events, (memo, event) => {
                        return memo + (event.timeFinish - event.timeStart);
                    }, 0);
                    node.data.avgQueueTime = totalQueueTime / node.data.length;
                    node.data.avgRunTime = totalRunTime / node.data.length;
                }
                else if (isAnnouncementPublishedEvent(node.data.type)){
                    let valueCount = _.countBy(events, (event) => event.data.severity);
                    node.data.minor = valueCount.hasOwnProperty('MINOR') ? valueCount['MINOR'] : 0;
                    node.data.major = valueCount.hasOwnProperty('MAJOR') ? valueCount['MAJOR'] : 0;
                    node.data.critical = valueCount.hasOwnProperty('CRITICAL') ? valueCount['CRITICAL'] : 0;
                    node.data.blocker = valueCount.hasOwnProperty('BLOCKER') ? valueCount['BLOCKER'] : 0;
                    node.data.closed = valueCount.hasOwnProperty('CLOSED') ? valueCount['CLOSED'] : 0;
                    node.data.canceled = valueCount.hasOwnProperty('CANCELED') ? valueCount['CANCELED'] : 0;
                }
                else if (isConfidenceLevelEvent(node.data.type)) {
                    let valueCount = _.countBy(events, (event) => event.data.value);
                    node.data.passed = valueCount.hasOwnProperty('SUCCESS') ? valueCount['SUCCESS'] : 0;
                    node.data.failed = valueCount.hasOwnProperty('FAILURE') ? valueCount['FAILURE'] : 0;
                    node.data.inconclusive = valueCount.hasOwnProperty('INCONCLUSIVE') ? valueCount['INCONCLUSIVE'] : 0;
                    node.data.name = events[0].data.name;
                }
                else if (isIssueVerifiedEvent(node.data.type)){
                    let typeCount = _.countBy(events, (event) => event.data.issues.type);
                    node.data.bug = typeCount.hasOwnProperty('BUG') ? typeCount['BUG'] : 0;
                    node.data.improvement = typeCount.hasOwnProperty('IMPROVEMENT') ? typeCount['IMPROVEMENT'] : 0;
                    node.data.feature = typeCount.hasOwnProperty('FEATURE') ? typeCount['FEATURE'] : 0;
                    node.data.workItem = typeCount.hasOwnProperty('WORK_ITEM') ? typeCount['WORK_ITEM'] : 0;
                    node.data.requirement = typeCount.hasOwnProperty('REQUIREMENT') ? typeCount['REQUIREMENT'] : 0;
                    node.data.other = typeCount.hasOwnProperty('OTHER') ? typeCount['OTHER'] : 0;

                    let valueCount = _.countBy(events, (event) => event.data.issues.value);
                    node.data.success = valueCount.hasOwnProperty('SUCCESS') ? valueCount['SUCCESS'] : 0;
                    node.data.failure = valueCount.hasOwnProperty('FAILURE') ? valueCount['FAILURE'] : 0;
                    node.data.inconclusive = valueCount.hasOwnProperty('INCONCLUSIVE') ? valueCount['INCONCLUSIVE'] : 0;
                }
                else if (isTestEvent(node.data.type)) {
                    let valueCount = _.countBy(events, (event) => event.data.outcome.verdict);
                    let passedCount = valueCount.hasOwnProperty('PASSED') ? valueCount['PASSED'] : 0;
                    let failedCount = valueCount.hasOwnProperty('FAILED') ? valueCount['FAILED'] : 0;
                    node.data.inconclusive = valueCount.hasOwnProperty('INCONCLUSIVE') ? valueCount['INCONCLUSIVE'] : 0;
                    node.data.passed = passedCount;
                    node.data.failed = failedCount;

                    let totalRunTime = _.reduce(events, (memo, event) => {
                        return memo + (event.timeFinish - event.timeStart);
                    }, 0);
                    node.data.avgRunTime = totalRunTime / node.data.length;
                }

                nodes.push(node);

                // Save the links from events -> group and group -> events to reconstruct group -> group later
                groupToEvents[group] = _.reduce(events, (memo, event) => memo.concat(event.targets.concat(event.dangerousTargets)), []);
                _.each(events, (event) => {
                    eventToGroup[event.id] = group
                });
            });

            // Construct edges between groups
            let edgesMap = {};

            let edges = [];
            _.each(groupToEvents, (events, group) => {
                let tmp1 = _.map(events, (event) => eventToGroup[event]);
                let toGroups = (_.uniq(tmp1));
                _.each(toGroups, (toGroup) => {
                    if (group !== undefined && toGroup !== undefined && edgesMap['' + group + toGroup] === undefined) {
                        edgesMap['' + group + toGroup] = false;
                        edges.push({
                            data: {
                                source: group, target: toGroup
                            }
                        })
                    }
                });
            });

            // console.log(edges);
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

            let linkedSequences = {};
            linkedSequences[sequence.id] = false;

            _.each(sequence.connections, (targetId) => {
                if (linkedSequences[targetId] === undefined) {
                    // console.log(targetId);
                    linkedSequences[targetId] = EventSequences.findOne({id: targetId}, {})
                }
            });

            let events = sequence.events;

            let ignored = [];

            _.each(linkedSequences, (eventSequence) => {
                if (eventSequence !== false) {
                    events = events.concat(eventSequence.events);
                }
            });

            let eventsMap = {};
            _.each(events, (event) => {
                eventsMap[event.id] = true;
            });

            let nodes = [];
            let edges = [];

            _.each(events, (event) => {
                let node = {
                    data: {
                        label: event.name,
                        id: event.id,
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

                let edgesMap = {};
                _.each(event.targets.concat(event.dangerousTargets), (target) => {
                    if (eventsMap[target] !== undefined && edgesMap['' + event.id + target] === undefined) {
                        edgesMap['' + event.id + target] = false;
                        edges.push(
                            {
                                data: {
                                    source: event.id,
                                    target: target
                                }
                            });
                    }
                });
            });
            // console.log(nodes);
            // console.log(edges);
            return {
                nodes: nodes,
                edges: edges,
                time: sequence.time,
            };
        }
    }
});

export const getSequenceCount = new ValidatedMethod({
    name: 'getSequenceCount',
    validate: null,
    run({from, to}) {
        return EventSequences.find(
            {"time.started": {$gte: parseInt(from), $lte: parseInt(to)}})
            .count();
    }
});

