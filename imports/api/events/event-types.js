'use strict';

export const isTestEvent = function (eventType) {
    let eventTypes = [
        getTestCaseEventName(),
        getTestSuiteEventName()
    ];
    return _.contains(eventTypes, eventType);
};

export const isConfidenceLevelEvent = function (eventType) {
    return eventType === 'EiffelConfidenceLevelModifiedEvent';
};

export const getTestCaseEventName = function () {
    return "TestCaseEvent"
};

export const getTestSuiteEventName = function () {
    return "TestSuiteEvent"
};

export const getActivityEventName = function () {
    return "ActivityEvent"
};

export const getRedirectName = function () {
    return "Redirect"
};