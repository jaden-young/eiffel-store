'use strict';

import {ValidatedMethod} from "meteor/mdg:validated-method";
import {EiffelEvents} from "../eiffelevents/eiffelevents";
import {Events} from "../events/events";
import {getActivityEventName, getRedirectName, getTestCaseEventName, getTestSuiteEventName} from "./event-types";
import {
    isEiffelActivityCanceled,
    isEiffelActivityExecution,
    isEiffelActivityFinished,
    isEiffelActivityStarted,
    isEiffelActivityTriggered,
    isEiffelTestCaseFinished,
    isEiffelTestCaseStarted,
    isEiffelTestSuiteFinished,
    isEiffelTestSuiteStarted
} from "../eiffelevents/eiffeleventTypes";
import {setProperty} from "../properties/methods";

function getEventVersion() {
    return '1.7';
}
function getEventVersionPropertyName() {
    return 'events.version';
}

function setEventVersionProperty() {
    setProperty.call({propertyName: getEventVersionPropertyName(), propertyValue: getEventVersion()})
}

function invalidateEventVersionProperty() {
    setProperty.call({propertyName: getEventVersionPropertyName(), propertyValue: undefined})
}

export const eventVersion = new ValidatedMethod({
    name: 'eventVersion',
    validate: null,
    run(){
        return getEventVersion();
    }
});

export const eventVersionPropertyName = new ValidatedMethod({
    name: 'eventVersionPropertyName',
    validate: null,
    run(){
        return getEventVersionPropertyName();
    }
});

export const populateEventsCollection = new ValidatedMethod({
    name: 'populateEventsCollection',
    validate: null,
    run(){
        console.log("Removing old events collection.");
        invalidateEventVersionProperty();
        Events.remove({});

        let total = EiffelEvents.find().count();
        let done = 0;
        let lastPrint = ((done / total) * 100);

        console.log('Fetching ' + total + ' eiffel events from database. Please wait.');
        let events = EiffelEvents.find().fetch();

        let toBePared = {};

        function isToBePared(type) {
            return isEiffelTestCaseStarted(type) || isEiffelTestSuiteStarted(type) || isEiffelActivityTriggered(type);
        }

        _.each(events, (event) => {
            if (isToBePared(event.meta.type)) {
                toBePared[event.meta.id] = event;
            }
        });

        _.each(events, (event) => {
            if (isEiffelTestCaseFinished(event.meta.type)) {
                let startEvent = toBePared[event.links[0].target];
                if (startEvent === undefined) {
                    console.log(startEvent);
                }
                delete toBePared[event.links[0].target];

                let regex = /^(\D+)\D(\d)+$/g;
                let str = event.data.customData[0].value;
                let match = regex.exec(str);

                Events.insert({
                    type: getTestCaseEventName(), // *
                    version: event.meta.version, // *
                    name: match[1] + match[2], // *
                    id: event.meta.id, // *
                    timeStart: startEvent.meta.time, // *
                    timeFinish: event.meta.time, // *
                    links: startEvent.links, // *
                    source: startEvent.meta.source, //*
                    data: Object.assign(startEvent.data, event.data), // *
                    dev: {},

                    startEvent: startEvent.meta.id,
                    finishEvent: event.meta.id,
                })
            } else if (isEiffelTestSuiteFinished(event.meta.type)) {
                let startEvent = toBePared[event.links[0].target];
                if (startEvent === undefined) {
                    console.log(startEvent);
                }
                delete toBePared[event.links[0].target];

                let regex = /^(\D+)\D(\d)+$/g;
                let str = event.data.customData[0].value;
                let match = regex.exec(str);

                Events.insert({
                    type: getTestSuiteEventName(), // *
                    version: event.meta.version, // *
                    name: match[1] + match[2], // *
                    id: event.meta.id, // *
                    timeStart: startEvent.meta.time, // *
                    timeFinish: event.meta.time, // *
                    links: startEvent.links, // *
                    source: startEvent.meta.source, //*
                    data: Object.assign(startEvent.data, event.data), // *
                    dev: {},

                    startEvent: startEvent.meta.id,
                    finishEvent: event.meta.id,
                });

                Events.insert({
                    type: getRedirectName(), // *
                    id: startEvent.meta.id,
                    dev: {},

                    target: event.meta.id
                });
            }
            else if (isEiffelActivityCanceled(event.meta.type)) {
                // TODO
            }
            else if (isEiffelActivityExecution(event.meta.type)) {
                let mergingEvent = toBePared[event.links[0].target];

                if (mergingEvent.event === undefined) {

                    let regex = /^(\D+)\D(\d)+$/g;
                    let str = mergingEvent.data.customData[0].value;
                    let match = regex.exec(str);

                    mergingEvent.event = {
                        type: getActivityEventName(), // *
                        version: mergingEvent.meta.version, // *
                        name: match[1] + match[2], // *
                        id: mergingEvent.meta.id, // *

                        links: mergingEvent.links, // *
                        source: mergingEvent.meta.source, //*
                        data: Object.assign(mergingEvent.data, event.data), // *
                        timeTriggered: mergingEvent.meta.time,
                        dev: {},
                    };
                } else {
                    mergingEvent.event.data = Object.assign(mergingEvent.event.data, event.data)
                }

                if (isEiffelActivityStarted(event.meta.type)) {
                    mergingEvent.event.timeStart = event.meta.time;
                    mergingEvent.event.startEvent = event.meta.id;
                } else if (isEiffelActivityFinished(event.meta.type)) {
                    mergingEvent.event.timeFinish = event.meta.time;
                    mergingEvent.event.finishEvent = event.meta.id;
                }

                Events.insert({
                    type: getRedirectName(), // *
                    id: event.meta.id,
                    dev: {},

                    target: mergingEvent.meta.id
                });

                if (mergingEvent.event.startEvent !== undefined && mergingEvent.event.finishEvent !== undefined) {
                    Events.insert(mergingEvent.event);
                    delete toBePared[event.meta.id]
                }
            }
            else if (isToBePared(event.meta.type)) {
                // No
            }
            else {
                Events.insert({
                    type: event.meta.type, // *
                    version: event.meta.version, // *
                    name: event.data.customData[0].value, // *
                    id: event.meta.id, // *
                    timeStart: event.meta.time, // *
                    timeFinish: event.meta.time, // *
                    links: event.links, // *
                    source: event.meta.source, // *
                    data: event.data, // *
                    dev: {},
                });
            }

            done++;
            let print = Math.floor((done / total) * 100);
            if (print >= (lastPrint + 5)) {
                console.log("Populating events progress: " + print + '% (' + done + '/' + total + ')');
                lastPrint = print;
            }
        });

        setEventVersionProperty();
        let print = Math.floor((done / total) * 100);
        console.log("Events collection is populated. [" + print + "%] (" + done + "/" + total + ")");
    }
});