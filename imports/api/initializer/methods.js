import {ValidatedMethod} from "meteor/mdg:validated-method";
import {EiffelEvents} from "../eiffelevents/eiffelevents";
import {Events} from "../events/events";
import {Rows} from "../rows/rows";
import {populateRowsCollection} from '/imports/api/rows/methods'
import {populateEventsCollection} from '/imports/api/events/methods'
import {populateEventSequences} from '/imports/api/eventSequences/methods'

Meteor.startup(function () {
    // populateEventsCollection.call();
    // console.log(Events.findOne({type: 'TestCase'}));
    // console.log(Events.findOne({type: 'ConfidenceLevel'}));

    // populateEventSequences.call();


    if(EiffelEvents.find().count() !== Rows.find().count() || (Object.keys(Rows.findOne()).length !== 5)){ // The number to be equal amount of data elements that should be in each row (including _id)
        console.log("Rows collection is not up to date with database.");
        populateRowsCollection.call();
    }
});