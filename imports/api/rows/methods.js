import {ValidatedMethod} from "meteor/mdg:validated-method";
import {EiffelEvents} from "../eiffelevents/eiffelevents";
import {Rows} from "./rows.js";

Meteor.startup(function () {
    if(EiffelEvents.find().count() !== Rows.find().count() || (Object.keys(Rows.findOne()).length !== 4)){ // Number to be equal amount of data elements that should be in each row + 1
        console.log("Rows collection is not up to date with database.");
        populateRowsCollection.call();
    }
});

export const populateRowsCollection = new ValidatedMethod({
    name: 'populateRowsCollection',
    validate: null,
    run(){
        console.log("Removing old rows collection.");
        Rows.remove({});

        console.log("Populating rows collection from events collection.");
        let total = EiffelEvents.find().count();
        let done = 0;
        let lastPrint = ((done/total)*100);

        console.log('Fetching ' + total + ' events from database.');
        let events = EiffelEvents.find().fetch();

        _.each(events, (event) => {
            Rows.insert({
                name: event.data.customData[0].value,
                id: event.meta.id,
                timestamp: event.meta.time
            });
            done++;
            let print = Math.floor((done/total)*100);
            if(print >= (lastPrint + 5)){
                console.log("Populating rows progress: " + print + '% (' + done + '/' + total + ')');
                lastPrint = print;
            }
        });
        console.log("Rows collection is populated.");
    }
});