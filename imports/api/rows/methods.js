import {ValidatedMethod} from "meteor/mdg:validated-method";
import {EiffelEvents} from "../eiffelevents/eiffelevents";
import {Rows} from "./rows";


export const populateRowsCollection = new ValidatedMethod({
    name: 'populateRowsCollection',
    validate: null,
    run(){
        console.log("Removing old rows collection.");
        Rows.remove({});

        let total = EiffelEvents.find().count();
        let done = 0;
        let lastPrint = ((done / total) * 100);

        console.log('Fetching ' + total + ' eiffelevents from database. Please wait.');
        let events = EiffelEvents.find().fetch();

        _.each(events, (event) => {
            Rows.insert({
                name: event.data.customData[0].value,
                type: event.meta.type,
                id: event.meta.id,
                timestamp: event.meta.time
            });
            done++;
            let print = Math.floor((done / total) * 100);
            if (print >= (lastPrint + 5)) {
                console.log("Populating rows progress: " + print + '% (' + done + '/' + total + ')');
                lastPrint = print;
            }
        });
        console.log("Rows collection is populated.");
    }
});