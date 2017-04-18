'use strict';
import {ValidatedMethod} from "meteor/mdg:validated-method";
import {EiffelEvents} from "../eiffelevents/eiffelevents";
import {Events} from "../events/events";
import {Rows} from "../rows/rows";
import {populateRowsCollection} from "/imports/api/rows/methods";
import {eventVersion, populateEventsCollection} from "/imports/api/events/methods";
import {populateEventSequences} from "/imports/api/eventSequences/methods";
import {EventSequences} from "../eventSequences/eventSequences";
import {eventSequenceVersion} from "../eventSequences/methods";

Meteor.startup(function () {
    if (Events.find().count() === 0 || Events.findOne().dev.version !== eventVersion.call()) {
        populateEventsCollection.call();
    }

    if (EventSequences.find().count() === 0 || EventSequences.findOne().dev.version !== eventSequenceVersion.call()) {
        populateEventSequences.call();
    }

    // populateEventsCollection.call();
    // populateEventSequences.call();

    if (Rows.find().count() === 0 || EiffelEvents.find().count() !== Rows.find().count() || (Object.keys(Rows.findOne()).length !== 5)) { // The number to be equal amount of data elements that should be in each row (including _id)
        console.log("Rows collection is not up to date with database.");
        populateRowsCollection.call();
    }
});