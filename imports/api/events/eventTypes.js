'use strict';
/**
 * Created by seba on 2017-04-12.
 * Contains various categories of events types
 * that are to be processed in the same way.
 */
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

export const getTestCaseEventName = function (eventType) {
    return "TestCaseEvent"
};

export const getTestSuiteEventName = function (eventType) {
    return "TestSuiteEvent"
};

export const getRedirectName = function (eventType) {
    return "Redirect"
};