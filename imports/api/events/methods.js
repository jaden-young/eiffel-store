'use strict';

import {ValidatedMethod} from "meteor/mdg:validated-method";
import {EiffelEvents} from "../eiffelevents/eiffelevents";
import {Events} from "../events/events";
import {getRedirectName, getTestCaseEventName, getTestSuiteEventName} from "./event-types";
import {
    isEiffelTestCaseFinished,
    isEiffelTestCaseStarted,
    isEiffelTestSuiteFinished,
    isEiffelTestSuiteStarted
} from "../eiffelevents/eiffeleventTypes";
import {setProperty} from "../properties/methods";

function getEventVersion() {
    return '1.4';
}
function getEventVersionPropertyName() {
    return 'eventVersion';
}

function setEventVersionProperty() {
    setProperty.call({propertyName: getEventVersionPropertyName(), propertyValue: getEventVersion()})
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
        Events.remove({});

        let total = EiffelEvents.find().count();
        let done = 0;
        let lastPrint = ((done / total) * 100);

        console.log('Fetching ' + total + ' eiffel events from database. Please wait.');
        let events = EiffelEvents.find().fetch();

        let toBePared = {};

        _.each(events, (event) => {
            if (isEiffelTestCaseStarted(event.meta.type) || isEiffelTestSuiteStarted(event.meta.type)) {
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
                    dev: {
                        version: getEventVersion() // *
                    },

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
                    dev: {
                        // version: getEventVersion() // *
                    },

                    startEvent: startEvent.meta.id,
                    finishEvent: event.meta.id,
                });

                Events.insert({
                    type: getRedirectName(), // *
                    id: startEvent.meta.id,
                    dev: {
                        // version: getEventVersion() // *
                    },

                    target: event.meta.id
                });
            }
            else if (isEiffelTestCaseStarted(event.meta.type) || isEiffelTestSuiteStarted(event.meta.type)) {
                // toBePared[event.meta.id] = event;
            }
            else {
                Events.insert(({
                    type: event.meta.type, // *
                    version: event.meta.version, // *
                    name: event.data.customData[0].value, // *
                    id: event.meta.id, // *
                    timeStart: event.meta.time, // *
                    timeFinish: event.meta.time, // *
                    links: event.links, // *
                    source: event.meta.source, // *
                    data: event.data, // *
                    dev: {
                        // version: getEventVersion() // *
                    },
                }))
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