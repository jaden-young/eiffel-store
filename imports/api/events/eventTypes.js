'use strict';
/**
 * Created by seba on 2017-04-12.
 * Contains various categories of events types
 * that are to be processed in the same way.
 */
export const isTestEvent = function (eventType) {
    let eventTypes = [
        'TestCase',
        'EiffelTestSuiteFinishedEvent'
    ];
    return _.contains(eventTypes, eventType);
};

export const isConfidenceLevelEvent = function (eventType) {
    return eventType === 'EiffelConfidenceLevelModifiedEvent';
};