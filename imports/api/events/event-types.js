'use strict';

export const isActivityCanceledEvent = function (eventType) {
    return eventType === 'EiffelActivityCanceledEvent';
};

export const isActivityFinishedEvent = function (eventType) {
    return eventType === 'EiffelActivityFinishedEvent';
};

export const isActivityStartedEvent = function (eventType) {
    return eventType === 'EiffelActivityStartedEvent';
};

export const isActivityTriggeredEvent = function (eventType) {
    return eventType === 'EiffelActivityTriggeredEvent';
};

export const isAnnouncementPublishedEvent = function (eventType) {
    return eventType === 'EiffelAnnouncementPublishedEvent';
};

export const isArtifactCreatedEvent = function (eventType) {
    return eventType === 'EiffelArtifactCreatedEvent';
};

export const isArtifactPublishedEvent = function (eventType) {
    return eventType === 'EiffelArtifactPublishedEvent';
};

export const isArtifactReusedEvent = function (eventType) {
    return eventType === 'EiffelArtifactReusedEvent';
};

export const isCompositionDefinedEvent = function (eventType) {
    return eventType === 'EiffelCompositionDefinedEvent';
};

export const isConfidenceLevelEvent = function (eventType) {
    return eventType === 'EiffelConfidenceLevelModifiedEvent';
};

export const isConfigurationAppliedEvent = function (eventType) {
    return eventType === 'EiffelConfigurationAppliedEvent';
};

export const isEnvironmentDefinedEvent = function (eventType) {
    return eventType === 'EiffelEnvironmentDefinedEvent';
};

export const isFlowContextDefinedEvent = function (eventType) {
    return eventType === 'EiffelFlowContextDefinedEvent';
};

export const isIssueVerifiedEvent = function (eventType) {
    return eventType === 'EiffelIssueVerifiedEvent';
};

export const isSourceChangeCreatedEvent = function (eventType) {
    return eventType === 'EiffelSourceChangeCreatedEvent';
};

export const isSourceChangeSubmittedEvent = function (eventType) {
    return eventType === 'EiffelSourceChangeSubmittedEvent';
};

export const isTestEvent = function (eventType) {
    let eventTypes = [
        getTestCaseEventName(),
        getTestSuiteEventName()
    ];
    return _.contains(eventTypes, eventType);
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