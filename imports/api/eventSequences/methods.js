import {ValidatedMethod} from "meteor/mdg:validated-method";
import {Events} from "../events/events";
import {EventSequences} from "../eventSequences/eventSequences";

function getEventSequenceVersion() {
    return '0.2';
}

export const eventSequenceVersion = new ValidatedMethod({
    name: 'eventSequenceVersion',
    validate: null,
    run(){
        return getEventSequenceVersion();
    }
});

export const populateEventSequences = new ValidatedMethod({
    name: 'populateEventSequences',
    validate: null,
    run(){
        console.log("Removing old events-sequences collection.");
        EventSequences.remove({});

        let total = Events.find().count();
        let done = 0;
        let lastPrint = ((done / total) * 100);

        console.log('Fetching ' + total + ' events from database. Please wait.');
        let events = Events.find().fetch();

        console.log('Processing events from database. Please wait.');

        let illegalBridgeTypes = [
            'EiffelArtifactCreatedEvent',
            'EiffelDocumentationCreatedEvent',
            'EiffelCompositionDefinedEvent',
            'EiffelEnvironmentDefinedEvent',
            'EiffelSourceChangeCreatedEvent',
            'EiffelSourceChangeSubmittedEvent'
        ];

        let legalTypes = [
            'CAUSE',
            'CONTEXT',
            'FLOW_CONTEXT',
            'ACTIVITY_EXECUTION',
            'PREVIOUS_ACTIVITY_EXECUTION',
            // 'PREVIOUS_VERSION', RangeError: Maximum call stack size exceeded
            'COMPOSITION',
            // 'ENVIRONMENT', MongoError: document is larger than the maximum size 16777216
            'ARTIFACT',
            'SUBJECT',
            // 'ELEMENT' MongoError: document is larger than the maximum size 16777216
            // 'BASE', RangeError: Maximum call stack size exceeded
            'CHANGE',
            'TEST_SUITE_EXECUTION',
            'TEST_CASE_EXECUTION',
            'IUT',
            'TERC',
            'MODIFIED_ANNOUNCEMENT',
            'SUB_CONFIDENCE_LEVEL',
            'REUSED_ARTIFACT',
            'VERIFICATION_BASIS',
        ];

        // Populate map
        let eventMap = {};
        _.each(events, (event) => {
            // Filtering links that would make us jump between sequences.
            event.targets = _.pluck(_.filter(event.links, function (link) {

                return _.contains(legalTypes, link.type);

                // return !(_.contains(illegalBridgeTypes, event.type));

                // return true;
            }), 'target');
            event.targetedBy = [];
            event.dev.checked = false;
            event.dev.stop = _.contains(illegalBridgeTypes, event.type);
            eventMap[event.id] = event;
        });

        // Find targetedBy
        _.each(events, (event) => {
            _.each(eventMap[event.id].targets, (target) => {
                let exists = _.find(eventMap[target].targetedBy, function (id) {
                    return id === event.id;
                });
                if (!exists) { //  && !(_.contains(illegalBridgeTypes, event.type))
                    (eventMap[target].targetedBy).push(event.id)
                }
            });
            eventMap[event.id] = event;

            done++;
            let print = Math.floor((done / total) * 100);
            if (print >= (lastPrint + 20)) {
                console.log("Finding event parents progress: " + print + '% (' + done + '/' + total + ')');
                lastPrint = print;
            }
        });

        function getAllLinked(eventId) {
            // if(eventMap[eventId].dev.stop === true){
            //     let linkedEvents = [];
            //     linkedEvents.push(eventId);
            //     return linkedEvents;
            // }
            if (eventMap[eventId].dev.checked === true) {
                return [];
            }
            eventMap[eventId].dev.checked = true;

            let linkedEvents = [];
            linkedEvents.push(eventId);

            let targets = eventMap[eventId].targets;
            for (let index = 0; index < targets.length; index++) {
                linkedEvents = linkedEvents.concat(getAllLinked(targets[index]));
            }

            let targetedBys = eventMap[eventId].targetedBy;
            for (let index = 0; index < targetedBys.length; index++) {
                linkedEvents = linkedEvents.concat(getAllLinked(targetedBys[index]));
            }
            return linkedEvents;
        }

        let sequences = _.sortBy(_.reduce(events, function (memo, event) {
            let sequence = getAllLinked(event.id);
            if (sequence.length > 0) { // 10
                memo.push(sequence);
            }
            return memo;
        }, []), 'timeFinish').reverse();


        done = 0;
        lastPrint = ((done / total) * 100);

        _.each(sequences, (sequence) => {
            let timeStart = undefined;
            let timeFinish = undefined;

            let sequenceEvents = _.reduce(sequence, function (memo, eventId) {
                let event = eventMap[eventId];
                if (timeStart === undefined || event.timeStart < timeStart) {
                    timeStart = event.timeStart;
                }
                if (timeFinish === undefined || event.timeFinish > timeFinish) {
                    timeFinish = event.timeFinish;
                }
                memo.push(eventMap[eventId]);
                return memo;
            }, []);

            EventSequences.insert({
                timeStart: timeStart,
                timeFinish: timeFinish,
                events: sequenceEvents,
                dev: {
                    version: getEventSequenceVersion()
                }
            });

            done = done + sequenceEvents.length;
            let print = Math.floor((done / total) * 100);
            if (print >= (lastPrint + 5)) {
                console.log("Populating event-sequence collection progress: " + print + '% (' + done + '/' + total + ')');
                lastPrint = print;
            }
        });
        let print = Math.floor((done / total) * 100);
        console.log("Event-sequence collection populated. [" + print + "%] (" + done + "/" + total + ")");
    }
});

