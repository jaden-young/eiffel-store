'use strict';
export const isTestEiffelEvent = function (eventType) {
    let eventTypesWithTests = [
        'EiffelTestCaseFinishedEvent',
        'EiffelTestSuiteFinishedEvent'
    ];
    return _.contains(eventTypesWithTests, eventType);
};

export const isConfidenceLevelEiffelEvent = function (eventType) {
    return eventType === 'EiffelConfidenceLevelModifiedEvent';
};

export const isFinishedEiffelEvent = function (eventType) {
    let finishedEventTypes = [
        'EiffelActivityFinishedEvent',
        'EiffelTestCaseFinishedEvent',
        'EiffelTestSuiteFinishedEvent'
    ];
    return _.contains(finishedEventTypes, eventType);
};

export const isEiffelTestCaseStarted = function (eventType) {
    let eventTypes = [
        'EiffelTestCaseStartedEvent'
    ];
    return _.contains(eventTypes, eventType);
};

export const isEiffelTestCaseFinished = function (eventType) {
    let eventTypes = [
        'EiffelTestCaseFinishedEvent'
    ];
    return _.contains(eventTypes, eventType);
};

export const isEiffelTestSuiteStarted = function (eventType) {
    let eventTypes = [
        'EiffelTestSuiteStartedEvent'
    ];
    return _.contains(eventTypes, eventType);
};
export const isEiffelTestSuiteFinished = function (eventType) {
    let eventTypes = [
        'EiffelTestSuiteFinishedEvent'
    ];
    return _.contains(eventTypes, eventType);
};