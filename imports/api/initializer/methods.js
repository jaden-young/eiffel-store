'use strict';
import {ValidatedMethod} from "meteor/mdg:validated-method";
import {Events} from "../events/events";
import {Rows} from "../rows/rows";
import {populateRowsCollection, rowsVersion, rowsVersionPropertyName} from "../rows/methods";
import {eventVersion, eventVersionPropertyName, populateEventsCollection} from "../events/methods";
import {
    eventSequenceVersion,
    eventSequenceVersionPropertyName,
    populateEventSequences
} from "../eventSequences/methods";
import {EventSequences} from "../eventSequences/event-sequences";
import {getProperty} from "../properties/methods";

Meteor.startup(function () {
    if (getProperty.call({propertyName: eventVersionPropertyName.call()}) !== eventVersion.call() || Events.find().count() === 0) {
        populateEventsCollection.call();
        populateEventSequences.call();
        populateRowsCollection.call();
    } else if (getProperty.call({propertyName: eventSequenceVersionPropertyName.call()}) !== eventSequenceVersion.call() || EventSequences.find().count() === 0) {
        populateEventSequences.call();
        populateRowsCollection.call();
    } else if (getProperty.call({propertyName: rowsVersionPropertyName.call()}) !== rowsVersion.call() || Rows.find().count() === 0) {
        populateRowsCollection.call();
    }

    // Uncomment to force repopulate collections

    // populateEventsCollection.call();
    // populateEventSequences.call();
    // populateRowsCollection.call();
});

export const generateAll = new ValidatedMethod({
    name: 'generateAll',
    validate: null,
    run(){
        populateEventsCollection.call();
        populateEventSequences.call();
        populateRowsCollection.call();
    }
});