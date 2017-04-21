/**
 * Created by seba on 2017-03-24.
 */

import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { faker } from 'meteor/practicalmeteor:faker';
import { resetDatabase } from 'meteor/xolvio:cleaner';

import { EiffelEvents } from './eiffelevents.js';
import {
    getAggregatedGraph,
    getEventAncestorGraph, }
    from './methods';

import {
    isTestEiffelEvent,
    isConfidenceLevelEiffelEvent,
    isFinishedEiffelEvent}
    from './eiffeleventTypes.js';

if (Meteor.isServer) {

    function mergeObjectInto(source, target) {
        for(let property in source) {
            if(Object.prototype.hasOwnProperty.call(source, property)) {
                target[property] = source[property];
            }
        }
    }

    function randomEventType() {
        let eventTypes = [
            'EiffelActivityTriggeredEvent',
            'EiffelActivityCanceledEvent',
            'EiffelActivityStartedEvent',
            'EiffelActivityFinishedEvent',
            'EiffelArtifactCreatedEvent',
            'EiffelArtifactPublishedEvent',
            'EiffelArtifactReusedEvent',
            'EiffelEnvironmentDefinedEvent',
            'EiffelCompositionDefinedEvent',
            'EiffelSourceChangeCreatedEvent',
            'EiffelSourceChangeSubmittedEvent',
            'EiffelFlowContextDefinedEvent',
            'EiffelTestCaseTriggeredEvent',
            'EiffelTestCaseCanceledEvent',
            'EiffelTestCaseStartedEvent',
            'EiffelTestCaseFinishedEvent',
            'EiffelTestSuiteStartedEvent',
            'EiffelTestSuiteFinishedEvent',
            'EiffelIssueVerifiedEvent',
            'EiffelTestExecutionRecipeCollectionCreatedEvent',
            'EiffelAnnouncementPublishedEvent',
            'EiffelConfidenceLevelModifiedEvent'
        ];
        return eventTypes[_.random(0, eventTypes.length - 1)];
    }

    function createEventId (eventType) {

        let typeToIdMap = {
            'EiffelActivityTriggeredEvent' : 'ActT',
            'EiffelActivityCanceledEvent' : 'ActC',
            'EiffelActivityStartedEvent' : 'ActS',
            'EiffelActivityFinishedEvent' : 'ActF',
            'EiffelArtifactCreatedEvent' : 'ArtC',
            'EiffelArtifactPublishedEvent' : 'ArtP',
            'EiffelArtifactReusedEvent' : 'ArtR',
            'EiffelConfidenceLevelModifiedEvent' : 'CLM',
            'EiffelEnvironmentDefinedEvent' : 'ED',
            'EiffelCompositionDefinedEvent' : 'CD',
            'EiffelSourceChangeCreatedEvent' : 'SCC',
            'EiffelSourceChangeSubmittedEvent' : 'SCS',
            'EiffelFlowContextDefinedEvent' : 'FCD',
            'EiffelTestCaseTriggeredEvent' : 'TCT',
            'EiffelTestCaseCanceledEvent' : 'TCC',
            'EiffelTestCaseStartedEvent' : 'TCS',
            'EiffelTestCaseFinishedEvent' : 'TCF',
            'EiffelTestSuiteStartedEvent' : 'TSS',
            'EiffelTestSuiteFinishedEvent' : 'TSF',
            'EiffelIssueVerifiedEvent' : 'IV',
            'EiffelTestExecutionRecipeCollectionCreatedEvent' : 'TERCC',
            'EiffelAnnouncementPublishedEvent' : 'AnnP'
        };
        return typeToIdMap[eventType] + _.random(1, 9);
    }

    // Helper function for the factory creating dummy data
    function insertRandomEvent(data) {
        let eventType = randomEventType();
        let event = {
            links: [],
            meta: {
                id: faker.random.uuid(),
                source: faker.internet.domainName(),
                time: Date.parse(faker.date.between(2015, 2018)),
                type: eventType
            },
            data: {
                customData: [{
                    value: createEventId(eventType),
                    key: "name"
                }]
            }
        };

        if (isTestEiffelEvent(eventType)) {
            let possibleVerdicts = ['PASSED', 'FAILED'];
            event.data.outcome = {
                verdict: possibleVerdicts[_.random(0, possibleVerdicts.length - 1)]
            };
        }

        if (isConfidenceLevelEiffelEvent(eventType)) {
            let possibleValues = ['PASSED', 'FAILED', 'INCONCLUSIVE'];
            event.data.value = possibleValues[_.random(0, possibleValues.length - 1)]
        }

        if (data) {
            mergeObjectInto(data, event);
        }

        let id = EiffelEvents.insert(event);
        return EiffelEvents.findOne(id);
    }

    describe('getAggregatedGraph', function () {

        beforeEach(function () {
            resetDatabase();
        });

        it('returns empty on invalid dates', function () {
            let from = Date.parse('02/01/2016'),
                to = Date.parse('02/01/2014'), // Before from-date
                limit = 25,
                eventCount = 1;

            // Insert dummy events into collection
            _.times(eventCount, () => insertRandomEvent());

            // Call function under test and extract the aggregated events
            let graph = getAggregatedGraph.call({from: from, to: to, limit: limit});
            let aggregatedEvents = _.flatten(_.pluck(graph.nodes, 'data.events'));

            // There should be no events
            assert(aggregatedEvents.length === 0);
        });

        it('aggregates events only in provided time span', function () {
            let from = Date.parse('02/01/2016'),
                to = Date.parse('02/01/2017'),
                limit = 50,
                eventCount = 50;

            // Insert dummy events into collection
            _.times(eventCount, () => insertRandomEvent());

            // Call function under test and extract the aggregated events
            let graph = getAggregatedGraph.call({from: from, to: to, limit: limit});
            let aggregatedEvents = _.flatten(_.map(graph.nodes, (node) => node.data.events));

            console.log('aggregated', aggregatedEvents[0]);
            // Every event should be in the time span
            assert(_.every(aggregatedEvents, (event) =>
                event.meta.time >= from &&
                event.meta.time <= to
            ));
        });

        it('does not aggregate over the limit', function () {
            let from = Date.parse('02/01/2010'),
                to = Date.parse('02/01/2020'),
                limit = 10,
                aboveLimit = 11;

            // Insert dummy events into collection
            _.times(aboveLimit, () => insertRandomEvent());

            // Call function under test and extract the aggregated events
            let graph = getAggregatedGraph.call({from: from, to: to, limit: limit});
            let aggregatedEvents = _.flatten(_.map(graph.nodes, (node) => node.data.events));

            // There are more events then the limit, so the limit should be reached
            assert.equal(aggregatedEvents.length, limit);
        });
    });

    describe('getEventChainGraph', function () {

        beforeEach(function () {
            resetDatabase();
        });


        it('fetches ancestors recursively', function () {
            let ancestor1 = insertRandomEvent({meta: {id: 1}});
            let ancestor2 = insertRandomEvent({links: [{target: 1}], meta: {id: 2}});
            let child = insertRandomEvent({links: [{target: 2}], meta: {id: 3}});
            let graph = getEventAncestorGraph.call({eventId: child.meta.id});

            assert.notEqual(graph, undefined);
        });
    });

    describe('isTestEiffelEvent', function () {
        it('returns true for events containing tests', function () {
            let events = [
                'EiffelTestCaseFinishedEvent',
                'EiffelTestSuiteFinishedEvent'
            ];

            let result = _.every(events, isTestEiffelEvent);
            assert.isTrue(result);
        });


        it('returns false for events not containing tests', function () {
            let events = [
                'EiffelActivityTriggeredEvent',
                'EiffelActivityCanceledEvent',
                'EiffelActivityStartedEvent',
                'EiffelActivityFinishedEvent',
                'EiffelArtifactCreatedEvent',
                'EiffelArtifactPublishedEvent',
                'EiffelArtifactReusedEvent',
                'EiffelConfidenceLevelModifiedEvent',
                'EiffelEnvironmentDefinedEvent',
                'EiffelCompositionDefinedEvent',
                'EiffelSourceChangeCreatedEvent',
                'EiffelSourceChangeSubmittedEvent',
                'EiffelFlowContextDefinedEvent',
                'EiffelTestCaseTriggeredEvent',
                'EiffelTestCaseCanceledEvent',
                'EiffelTestCaseStartedEvent',
                'EiffelTestCaseFinishedEvent',
                'EiffelTestSuiteStartedEvent',
                'EiffelTestSuiteFinishedEvent',
                'EiffelIssueVerifiedEvent',
                'EiffelTestExecutionRecipeCollectionCreatedEvent',
                'EiffelAnnouncementPublishedEvent'
            ];

            let result = _.every(events, !isTestEiffelEvent);
            assert.isTrue(result);
        });
    });

    describe('isConfidenceLevelEiffelEvent', function () {
        it('returns true for confidence level modified event', function () {
            let event = 'EiffelConfidenceLevelModifiedEvent';
            let result = isConfidenceLevelEiffelEvent(event);
            assert.isTrue(result);
        });

        it('returns false for events not being confidence level changed events', function () {
            let events = [
                'EiffelActivityTriggeredEvent',
                'EiffelActivityCanceledEvent',
                'EiffelActivityStartedEvent',
                'EiffelActivityFinishedEvent',
                'EiffelArtifactCreatedEvent',
                'EiffelArtifactPublishedEvent',
                'EiffelArtifactReusedEvent',
                'EiffelEnvironmentDefinedEvent',
                'EiffelCompositionDefinedEvent',
                'EiffelSourceChangeCreatedEvent',
                'EiffelSourceChangeSubmittedEvent',
                'EiffelFlowContextDefinedEvent',
                'EiffelTestCaseTriggeredEvent',
                'EiffelTestCaseCanceledEvent',
                'EiffelTestCaseStartedEvent',
                'EiffelTestCaseFinishedEvent',
                'EiffelTestSuiteStartedEvent',
                'EiffelTestSuiteFinishedEvent',
                'EiffelIssueVerifiedEvent',
                'EiffelTestExecutionRecipeCollectionCreatedEvent',
                'EiffelAnnouncementPublishedEvent'
            ];

            let result = _.every(events, !isConfidenceLevelEiffelEvent);
            assert.isTrue(result);
        });
    });


    describe('isFinishedEiffelEvent', function () {
        it('returns true for events that signal that something finished', function () {
            let events = [
                'EiffelActivityFinishedEvent',
                'EiffelTestCaseFinishedEvent',
                'EiffelTestSuiteFinishedEvent'
            ];
            let result = _.every(events, !isFinishedEiffelEvent);
            assert.isTrue(result);
        });

        it('returns false for events not signaling that something finished', function () {
            let events = [
                'EiffelActivityTriggeredEvent',
                'EiffelActivityCanceledEvent',
                'EiffelActivityStartedEvent',
                'EiffelArtifactCreatedEvent',
                'EiffelArtifactPublishedEvent',
                'EiffelArtifactReusedEvent',
                'EiffelEnvironmentDefinedEvent',
                'EiffelCompositionDefinedEvent',
                'EiffelSourceChangeCreatedEvent',
                'EiffelSourceChangeSubmittedEvent',
                'EiffelFlowContextDefinedEvent',
                'EiffelTestCaseTriggeredEvent',
                'EiffelTestCaseCanceledEvent',
                'EiffelTestCaseStartedEvent',
                'EiffelTestSuiteStartedEvent',
                'EiffelIssueVerifiedEvent',
                'EiffelTestExecutionRecipeCollectionCreatedEvent',
                'EiffelAnnouncementPublishedEvent'
            ];

            let result = _.every(events, !isFinishedEiffelEvent);
            assert.isTrue(result);
        });
    });
}