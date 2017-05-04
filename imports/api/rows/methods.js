'use strict';
import {ValidatedMethod} from "meteor/mdg:validated-method";
import {Rows} from "./rows";
import {EventSequences} from "../eventSequences/event-sequences";
import {setProperty} from "../properties/methods";
import {getTestCaseEventName, getTestSuiteEventName} from "../events/event-types";
import moment from "moment";

function getRowsVersion() {
    return '1.5';
}

function getRowsVersionPropertyName() {
    return 'rows.version';
}

function setRowsVersionPropertyName() {
    setProperty.call({propertyName: getRowsVersionPropertyName(), propertyValue: getRowsVersion()})
}

function invalidateRowsVersionPropertyName() {
    setProperty.call({propertyName: getRowsVersionPropertyName(), propertyValue: undefined})
}

export const rowsVersion = new ValidatedMethod({
    name: 'rowsVersion',
    validate: null,
    run(){
        return getRowsVersion();
    }
});

export const rowsVersionPropertyName = new ValidatedMethod({
    name: 'rowsVersionPropertyName',
    validate: null,
    run(){
        return getRowsVersionPropertyName();
    }
});

export const populateRowsCollection = new ValidatedMethod({
    name: 'populateRowsCollection',
    validate: null,
    run(){
        // return;

        let VALUE_UNDEFINED = '-';

        console.log("Removing old rows collection.");
        invalidateRowsVersionPropertyName();
        Rows.remove({});

        let total = EventSequences.find().count();
        let done = 0;
        let lastPrint = ((done / total) * 100);

        console.log('Fetching ' + total + ' sequences from database. Please wait.');
        let sequences = EventSequences.find().fetch();

        _.each(sequences, (sequence) => {
            _.each(sequence.events, (event) => {

                let verdict = VALUE_UNDEFINED;
                if (event.data.outcome !== undefined && event.data.outcome.verdict !== undefined) {
                    verdict = event.data.outcome.verdict
                }

                let conclusion = VALUE_UNDEFINED;
                if (event.data.outcome !== undefined && event.data.outcome.conclusion !== undefined) {
                    conclusion = event.data.outcome.conclusion
                }

                Rows.insert({
                    name: event.name,
                    type: event.type,
                    id: event.id,
                    sequenceId: sequence.id,
                    time: event.time,
                    timeExecution: event.time.finished - event.time.started,
                    verdict: verdict,
                    conclusion: conclusion,
                    dev: {
                        // version: getRowsVersion()
                    }
                });
            });


            done++;
            let print = Math.floor((done / total) * 100);
            if (print >= (lastPrint + 5)) {
                console.log("Populating rows progress: " + print + '% (' + done + '/' + total + ')');
                lastPrint = print;
            }
        });
        setRowsVersionPropertyName();
        let print = Math.floor((done / total) * 100);
        console.log("Rows collection is populated. [" + print + "%] (" + done + "/" + total + ")");
    }
});

export const getResultOverTime = new ValidatedMethod({
    name: 'getResultOverTime',
    validate: null,
    run({eventName, eventType, sequenceIds}){
        console.log(eventName);
        console.log(eventType);
        console.log(sequenceIds.length);
        if (Meteor.isServer) {
            if (eventType !== getTestCaseEventName() && eventType !== getTestSuiteEventName()) {
                return undefined;
            }
            let rows = Rows.find({name: eventName, sequenceId: {$in: (sequenceIds)}}).fetch();

            console.log(rows.length);

            let data = {
                time: {
                    start: getTimeString(rows[0].time.started),
                    end:
                        getTimeString(rows[rows.length - 1].time.finished),
                }
            };
            // console.log(data);

            let gP = 0;
            let gF = 1;
            let gG = 2;
            let gR = 3;

            let items = [];
            let pass = undefined;
            let fail = undefined;
            let lastPass = undefined;
            let lastFail = undefined;

            items.push({
                x:
                    getTimeString(data.time.start),
                y: 0,
                group: gG,
            });

            _.each(rows, (row) => {
                let y;
                switch (row.verdict) {
                    case 'PASSED':
                        y = 1;
                        pass = 1;
                        fail = 0;
                        break;
                    case 'FAILED':
                        y = -1;
                        pass = 0;
                        fail = -1;
                        break;
                    default:
                        y = 0;
                        pass = 0;
                        fail = 0;
                        break;
                }
                items.push({
                    x:
                        getTimeString(row.time.finished),
                    y: y,
                    group: gR
                });

                if (pass !== lastPass) {
                    items.push({
                        x:
                            getTimeString(row.time.finished),
                        y: lastPass,
                        group: gP
                    });
                    items.push({
                        x:
                            getTimeString(row.time.finished),
                        y: pass,
                        group: gP
                    });
                    lastPass = pass;
                }
                if (fail !== lastFail) {
                    items.push({
                        x:
                            getTimeString(row.time.finished),
                        y: lastFail,
                        group: gF
                    });
                    items.push({
                        x:
                            getTimeString(row.time.finished),
                        y: fail,
                        group: gF
                    });
                    lastFail = fail;
                }
            });

            items.push({
                x:
                    getTimeString(data.time.end),
                y: 0,
                group: gG,
            });

            data.items = items;
            // console.log(data);
            return data;
        }
    }
});

function getTimeString(long) {
    return moment(long).format();
}