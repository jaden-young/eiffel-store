export const isTestEvent = function (eventType) {
    let eventTypes = [
        getTestCaseEventName,
        getTestSuiteEventName
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