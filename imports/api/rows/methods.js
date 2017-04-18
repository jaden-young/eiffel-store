import {ValidatedMethod} from "meteor/mdg:validated-method";
import {Rows} from "./rows";
import {EventSequences} from "../eventSequences/eventSequences";
import {setProperty} from "../properties/methods";

function getRowsVersion() {
    return '1.2';
}

function getRowsVersionPropertyName() {
    return 'rowsVersion';
}

function setRowsVersionPropertyName() {
    setProperty.call({propertyName: getRowsVersionPropertyName(), propertyValue: getRowsVersion()})
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
        let VALUE_UNDEFINED = '-';

        console.log("Removing old rows collection.");
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
                    timeStart: event.timeStart,
                    timeFinish: event.timeFinish,
                    timeExecution: event.timeFinish - event.timeStart,
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