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