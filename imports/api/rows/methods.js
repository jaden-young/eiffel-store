import {ValidatedMethod} from "meteor/mdg:validated-method";
import {Rows} from "./rows";
import {EventSequences} from "../eventSequences/eventSequences";

function getRowsVersion() {
    return '0.4';
}

export const rowsVersion = new ValidatedMethod({
    name: 'rowsVersion',
    validate: null,
    run(){
        return getRowsVersion();
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
                if(event.data.outcome !== undefined && event.data.outcome.verdict !== undefined){
                    verdict = event.data.outcome.verdict
                }

                let conclusion = VALUE_UNDEFINED;
                if(event.data.outcome !== undefined && event.data.outcome.conclusion !== undefined){
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
                        version: getRowsVersion()
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
        let print = Math.floor((done / total) * 100);
        console.log("Rows collection is populated. [" + print + "%] (" + done + "/" + total + ")");
    }
});