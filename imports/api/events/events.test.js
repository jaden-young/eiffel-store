/**
 * Created by seba on 2017-03-24.
 */

import { Meteor } from 'meteor/meteor';
import { assert } from 'meteor/practicalmeteor:chai';
import { faker } from 'meteor/practicalmeteor:faker';
import { resetDatabase } from 'meteor/xolvio:cleaner';

import { Events } from './events.js';
import {
    getAggregatedGraph,
    getEventAncestorGraph, }
    from './methods';

import {
    isTestEvent,
    isConfidenceLevelEvent,
    isFinishedEvent}
    from './eventTypes.js';

if (Meteor.isServer) {

    // Factory used to generate dummy Eiffel-events
    Factory.define('event', Events, {
        links: [],
        meta: {
            id: () => faker.random.uuid(),
            source: () => faker.internet.domainName(),
            time: () => Date.parse(faker.date.between(2015, 2018))
        },
        data: () => randomData(),
        type: () => "Dummy"
    });

    // Helper function for the factory creating dummy data
    function randomData() {
        let randomEiffelEvent = function () {
            let events = [
                'ActI',
                'ActC',
                'ActS',
                'ActF',
                'ArtC',
                'ArtP',
                'ArtR',
                'CLM',
                'ED',
                'CD',
                'SCC',
                'SCS',
                'FCD',
                'TCS',
                'TCF',
                'TSS',
                'TSF',
                'IV',
                'TERCC',
                'AnnP'
            ];
            return events[_.random(0, events.length - 1)];
        };

        let event = randomEiffelEvent();
        let data = {
            customData: [{
                value: event,
                key: "name"
            }]
        };

        if (isTestEvent(event)) {
            let possibleVerdicts = ['PASSED', 'FAILED'];
            data.outcome = {
                verdict: possibleVerdicts[_.random(0, possibleVerdicts.length - 1)]
            };
        }

        if (isConfidenceLevelEvent(event)) {
            let possibleValues = ['PASSED', 'FAILED', 'INCONCLUSIVE'];
            data.value = possibleValues[_.random(0, possibleValues.length - 1)]
        }

        return data;
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
            _.times(eventCount, () => Factory.create('event'));

            // Call function under test and extract the aggregated events
            let graph = getAggregatedGraph.call({from: from, to: to, limit: limit});
            let aggregatedEvents = _.flatten(_.map(graph.nodes, (n) => n.data.events));

            // There should be no events
            assert(aggregatedEvents.length === 0);
        });

        it('aggregates events only in provided time span', function () {
            let from = Date.parse('02/01/2016'),
                to = Date.parse('02/01/2017'),
                limit = 50,
                eventCount = 50;

            // Insert dummy events into collection
            _.times(eventCount, () => Factory.create('event'));

            // Call function under test and extract the aggregated events
            let graph = getAggregatedGraph.call({from: from, to: to, limit: limit});

            let aggregatedEvents = _.flatten(_.map(graph.nodes, (node) => node.data.events));

            // Every event should be in the time span
            assert(_.every(aggregatedEvents, (e) =>
                e.meta.time >= from &&
                e.meta.time <= to
            ));
        });

        it('does not aggregate over the limit', function () {
            let from = Date.parse('02/01/2010'),
                to = Date.parse('02/01/2020'),
                limit = 10,
                aboveLimit = 11;

            // Insert dummy events into collection
            _.times(aboveLimit, () => Factory.create('event'));

            // Call function under test and extract the aggregated events
            let graph = getAggregatedGraph.call({from: from, to: to, limit: limit});
            let aggregatedEvents = _.flatten(_.map(graph.nodes, (n) => n.data.events));

            // There are more events then the limit, so the limit should be reached
            assert.equal(aggregatedEvents.length, limit);
        });
    });

    describe('getEventAncestorGraph', function () {

        beforeEach(function () {
            resetDatabase();
        });


        it('fetches ancestors recursively', function () {
            let ancestor1 = Factory.create('event', {meta: {id: 1}});
            let ancestor2 = Factory.create('event', {links: [{target: 1}], meta: {id: 2}});
            let child = Factory.create('event', {links: [{target: 2}], meta: {id: 3}});
            let graph = getEventAncestorGraph.call({eventId: child.meta.id});

            assert.notEqual(graph, undefined);
        });
    });

    describe('isTestEvent', function () {
        it('returns true for events containing tests', function () {
            let events = [
                'EiffelTestCaseFinishedEvent',
                'EiffelTestSuiteFinishedEvent'
            ];

            let result = _.every(events, isTestEvent);
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

            let result = _.every(events, !isTestEvent);
            assert.isTrue(result);
        });
    });

    describe('isConfidenceLevelEvent', function () {
        it('returns true for confidence level modified event', function () {
            let event = 'EiffelConfidenceLevelModifiedEvent';
            let result = isConfidenceLevelEvent(event);
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

            let result = _.every(events, !isConfidenceLevelEvent);
            assert.isTrue(result);
        });
    });


    describe('isFinishedEvent', function () {
        it('returns true for events that signal that something finished', function () {
            let events = [
                'EiffelActivityFinishedEvent',
                'EiffelTestCaseFinishedEvent',
                'EiffelTestSuiteFinishedEvent'
            ];
            let result = _.every(events, !isFinishedEvent);
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

            let result = _.every(events, !isFinishedEvent);
            assert.isTrue(result);
        });
    });
}


