import {ValidatedMethod} from "meteor/mdg:validated-method";
import {Events} from "../events/events";
import {EventSequences} from "../eventSequences/eventSequences";

export const populateEventSequences = new ValidatedMethod({
    name: 'populateEventSequences',
    validate: null,
    run(){
        console.log("Removing old events sequences collection.");
        EventSequences.remove({});

        let total = Events.find().count();
        let done = 0;
        let lastPrint = ((done / total) * 100);

        console.log('Fetching ' + total + ' events from database. Please wait.');
        let events = Events.find().fetch();

        console.log('Processing events from database. Please wait.');

        let eventMap = {};

        _.each(events, (event) => {
            eventMap[event.feedId] = event;
        });

        let undefinedParents = 0;

        _.each(events, (event) => {
            let parents = _.pluck(event.links, 'target');
            _.each(parents, (parent) => {
                if (eventMap[parent] === undefined) {
                    undefinedParents++;
                } else {
                    eventMap[parent].children.push(event.feedId)
                }
            })
        });

        let endNodes = [];

        _.each(eventMap, (event) => {
            if (event.children.length === 0) {
                endNodes.push(event);
            }
        });

        console.log('Found ' + undefinedParents + ' undefined parents.');


        _.each(endNodes, (endNode) => {
            let timeStart = endNode.timeStart;
            let timeFinish = endNode.timeFinish;

            function getParents(child) {
                let parents = [];
                _.each(_.pluck(child.links, 'target'), (parentId) => {
                    if (eventMap[parentId] === undefined) {
                        // nothing
                    } else {
                        let childEvent = eventMap[parentId];
                        if (!childEvent.hidden.checked) {
                            childEvent.hidden.checked = true;

                            if (childEvent.timeStart < timeStart) {
                                timeStart = childEvent.timeStart;
                            }
                            if (childEvent.timeFinish > timeFinish) {
                                timeFinish = childEvent.timeFinish;
                            }

                            parents.push(childEvent);
                            parents.concat(getParents(_.pluck(childEvent.links, 'target')));
                        }
                    }
                });
                return parents;
            }


            let sequence = getParents(endNode);
            sequence.push(endNode);

            EventSequences.insert({
                timeStart: timeStart,
                timeFinish: timeFinish,
                events: sequence
            });


            done = done + sequence.length;
            let print = Math.floor((done / total) * 100);
            if (print >= (lastPrint + 5)) {
                console.log("Finding end-nodes progress: " + print + '% (' + done + '/' + total + ')');
                lastPrint = print;
            }
        });
        console.log("End-nodes found.");
    }
});

