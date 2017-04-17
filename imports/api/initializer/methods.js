import {ValidatedMethod} from "meteor/mdg:validated-method";
import {EiffelEvents} from "../eiffelevents/eiffelevents";
import {Events} from "../events/events";
import {Rows} from "../rows/rows";
import {rowsVersion} from "../rows/methods";
import {populateRowsCollection} from "/imports/api/rows/methods";
import {eventVersion, populateEventsCollection} from "/imports/api/events/methods";
import {populateEventSequences} from "/imports/api/eventSequences/methods";
import {EventSequences} from "../eventSequences/eventSequences";
import {eventSequenceVersion} from "../eventSequences/methods";

Meteor.startup(function () {
    if (Events.find().count() === 0 || Events.findOne().dev === undefined || Events.findOne().dev.version !== eventVersion.call()) {
        populateEventsCollection.call();
        populateEventSequences.call();
        populateRowsCollection.call();
    } else if (EventSequences.find().count() === 0 || EventSequences.findOne().dev === undefined || EventSequences.findOne().dev.version !== eventSequenceVersion.call()) {
        populateEventSequences.call();
        populateRowsCollection.call();
    } else if (Rows.find().count() === 0 || Rows.findOne().dev === undefined || Rows.findOne().dev.version !== rowsVersion.call()) {
        populateRowsCollection.call();
    }

    // populateEventsCollection.call();
    // populateEventSequences.call();
    // populateRowsCollection.call();
});