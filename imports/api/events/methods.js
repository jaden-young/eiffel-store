import {ValidatedMethod} from "meteor/mdg:validated-method";
import {EiffelEvents} from "../eiffelevents/eiffelevents";
import {Events} from "../events/events";
import {EventSequences} from "../eventSequences/eventSequences";
import {
    getRedirectName, getTestCaseEventName, getTestSuiteEventName, isConfidenceLevelEvent,
    isTestEvent
} from "./eventTypes";
import {
    isEiffelTestCaseFinished,
    isEiffelTestCaseStarted,
    isEiffelTestSuiteFinished,
    isEiffelTestSuiteStarted
} from "../eiffelevents/eiffeleventTypes";

function getEventVersion() {
    return '1.2';
}

export const eventVersion = new ValidatedMethod({
    name: 'eventVersion',
    validate: null,
    run(){
        return getEventVersion();
    }
});


export const populateEventsCollection = new ValidatedMethod({
    name: 'populateEventsCollection',
    validate: null,
    run(){
        console.log("Removing old events collection.");
        Events.remove({});

        let total = EiffelEvents.find().count();
        let done = 0;
        let lastPrint = ((done / total) * 100);

        console.log('Fetching ' + total + ' eiffel events from database. Please wait.');
        let events = EiffelEvents.find().fetch();

        let toBePared = {};

        _.each(events, (event) => {
            if (isEiffelTestCaseStarted(event.meta.type) || isEiffelTestSuiteStarted(event.meta.type)) {
                toBePared[event.meta.id] = event;
            }
        });

        _.each(events, (event) => {
            if (isEiffelTestCaseFinished(event.meta.type)) {
                let startEvent = toBePared[event.links[0].target];
                if (startEvent === undefined) {
                    console.log(startEvent);
                }
                delete toBePared[event.links[0].target];

                let regex = /^(\D+)\D(\d)+$/g;
                let str = event.data.customData[0].value;
                let match = regex.exec(str);

                Events.insert({
                    type: getTestCaseEventName(), // *
                    version: event.meta.version, // *
                    name: match[1] + match[2], // *
                    id: event.meta.id, // *
                    timeStart: startEvent.meta.time, // *
                    timeFinish: event.meta.time, // *
                    links: startEvent.links, // *
                    source: startEvent.meta.source, //*
                    data: Object.assign(startEvent.data, event.data), // *
                    dev: {
                        version: getEventVersion() // *
                    },

                    startEvent: startEvent.meta.id,
                    finishEvent: event.meta.id,
                })
            } else if (isEiffelTestSuiteFinished(event.meta.type)) {
                let startEvent = toBePared[event.links[0].target];
                if (startEvent === undefined) {
                    console.log(startEvent);
                }
                delete toBePared[event.links[0].target];

                let regex = /^(\D+)\D(\d)+$/g;
                let str = event.data.customData[0].value;
                let match = regex.exec(str);

                Events.insert({
                    type: getTestSuiteEventName(), // *
                    version: event.meta.version, // *
                    name: match[1] + match[2], // *
                    id: event.meta.id, // *
                    timeStart: startEvent.meta.time, // *
                    timeFinish: event.meta.time, // *
                    links: startEvent.links, // *
                    source: startEvent.meta.source, //*
                    data: Object.assign(startEvent.data, event.data), // *
                    dev: {
                        version: getEventVersion() // *
                    },

                    startEvent: startEvent.meta.id,
                    finishEvent: event.meta.id,
                });

                Events.insert({
                    type: getRedirectName(), // *
                    id: startEvent.meta.id,
                    dev: {
                        version: getEventVersion() // *
                    },

                    target: event.meta.id
                });
            }
            else if (isEiffelTestCaseStarted(event.meta.type) || isEiffelTestSuiteStarted(event.meta.type)) {
                // toBePared[event.meta.id] = event;
            }
            else {
                Events.insert(({
                    type: event.meta.type, // *
                    version: event.meta.version, // *
                    name: event.data.customData[0].value, // *
                    id: event.meta.id, // *
                    timeStart: event.meta.time, // *
                    timeFinish: event.meta.time, // *
                    links: event.links, // *
                    source: event.meta.source, // *
                    data: event.data, // *
                    dev: {
                        version: getEventVersion() // *
                    },
                }))
            }

            done++;
            let print = Math.floor((done / total) * 100);
            if (print >= (lastPrint + 5)) {
                console.log("Populating events progress: " + print + '% (' + done + '/' + total + ')');
                lastPrint = print;
            }
        });
        let print = Math.floor((done / total) * 100);
        console.log("Events collection is populated. [" + print + "%] (" + done + "/" + total + ")");
    }
});


export const getAggregatedGraph = new ValidatedMethod({
    name: 'getAggregatedGraph',
    validate: null,
    run({from, to, limit}) {
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
});