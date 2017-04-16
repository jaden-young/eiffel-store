'use strict';
/**
 * Created by seba on 2017-04-12.
 * Contains various categories of events types
 * that are to be processed in the same way.
 */

export const isTestEvent = function (eventType) {
    let eventTypesWithTests = [
        'EiffelTestCaseFinishedEvent',
        'EiffelTestSuiteFinishedEvent'
    ];
    return _.contains(eventTypesWithTests, eventType);
};

export const isConfidenceLevelEvent = function (eventType) {
    return eventType === 'EiffelConfidenceLevelModifiedEvent';
};

export const isFinishedEvent = function (eventType) {
    let finishedEventTypes = [
        'EiffelActivityFinishedEvent',
        'EiffelTestCaseFinishedEvent',
        'EiffelTestSuiteFinishedEvent'
    ];
    return _.contains(finishedEventTypes, eventType);
};