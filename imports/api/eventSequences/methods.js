import {ValidatedMethod} from "meteor/mdg:validated-method";
import {Events} from "../events/events";
import {EventSequences} from "../eventSequences/eventSequences";

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

        let eventMap = {};
        _.each(events, (event) => {
            event.targetedBy = [];
            eventMap[event.feedId[0]] = event;
        });

        let lastTarget;
        _.each(events, (event) => {
            _.each(_.pluck(event.links, 'target'), (target) => {
                lastTarget = target;
                let exists = _.find(eventMap[target].targetedBy, function(id){ return id === event.feedId[0]; });
                if(!exists){
                    (eventMap[target].targetedBy).push(event.feedId[0])
                }
            });
            eventMap[event.feedId[0]] = event;

            done++;

            let print = Math.floor((done / total) * 100);
            if (print >= (lastPrint + 10)) {

                console.log("Finding event parents progress: " + print + '% (' + done + '/' + total + ')');
                lastPrint = print;
            }
        });

        // console.log(eventMap[lastTarget]);


        done = 0;
        lastPrint = ((done / total) * 100);

        let sequences = [];

        function newSequence(linkedEvents) {
            sequences.push(linkedEvents);
        }

        let count = 0;
        function getAll(eventId) {
            if (eventMap[eventId].hidden.checked === true) {
                console.log('checked');
                return [];
            }
            count ++;
            console.log(count);
            eventMap[eventId].hidden.checked = true;
            // console.log(eventMap[eventId]);

            let linkedEvents = [];
            linkedEvents.push(eventId);

            let targets = eventMap[eventId].links;
            targets = _.pluck(targets, 'target');
            targets = _.uniq(targets);

            _.each(targets, (target) => {
                linkedEvents = linkedEvents.concat(getAll(eventMap[target].feedId[0]));
            });

            let targetedBy = eventMap[eventId].targetedBy;
            targetedBy = _.uniq(targetedBy);

            _.each(targetedBy, (attacker) => {
                linkedEvents = linkedEvents.concat(getAll(eventMap[attacker].feedId[0]));
            });

            return linkedEvents;
        }

        _.each(events, (event) => {
            let linkedEvents = getAll(event.feedId[0]);
            if(linkedEvents.length > 0){
                newSequence(linkedEvents);
            }

            done++;
            console.log(done);
            let print = Math.floor((done / total) * 100);
            if (print >= (lastPrint + 10)) {

                console.log("Linking events progress: " + print + '% (' + done + '/' + total + ')');
                lastPrint = print;
            }
        });

        console.log(sequences[0]);
        console.log(sequences.length);

        // let groups = [];
        //
        // _.each(events, (event) => {
        //     eventMap[event.feedId[0]] = event;
        // });
        //
        // function newGroup(evts) {
        //     let ids = [];
        //     _.each(evts, (evt) => {
        //         _.each(evt.feedId, (id) => {
        //             ids.push(id);
        //         });
        //     });
        //     ids = _.uniq(ids);
        //
        //     let targets = [];
        //     _.each(evts, (evt) => {
        //         _.each(_.pluck(evt.links, 'target'), (target) => {
        //             targets.push(target);
        //         });
        //     });
        //     targets = _.uniq(targets);
        //
        //     groups.push({
        //         ids: ids,
        //         targets: targets,
        //         events: evts
        //     })
        // }
        //
        // function mergeGroups(grp1, grp2) {
        //     let ids = (grp1.ids).concat(grp2.ids);
        //     let targets = (grp1.targets).concat(grp2.targets);
        //     let evts = (grp1.evts).concat(grp2.evts);
        //
        //     groups.push({
        //         ids: ids,
        //         targets: targets,
        //         events: evts
        //     })
        // }
        //
        // function checkEvent(evt) {
        //     if(eventMap[evt.feedId[0]].hidden.checked === true){
        //         return [];
        //     }
        //     eventMap[evt.feedId[0]].hidden.checked = true;
        //
        //     let targets = [];
        //     let targetsIds = _.pluck(evt.links, 'target');
        //     _.each(targetsIds, (targetId) => {
        //         let target = eventMap[targetId];
        //         targets.push(target);
        //         targets = targets.concat(checkEvent(target))
        //     });
        //
        //     return targets;
        // }
        //
        // _.each(events, (event) => {
        //     newGroup(checkEvent(event));
        //     console.log(event);
        // });
        //
        // console.log(groups.length);
        // console.log(groups[0]);
        // console.log(groups[1]);

        // let eventMap = {};
        //
        // _.each(events, (event) => {
        //     eventMap[event.feedId[0]] = event;
        //     // _.each(event.feedId, (id) =>{
        //     //     eventMap[id] = event;
        //     // });
        // });
        //
        // let sequences = [];
        //
        // function newSequence() {
        //     let newIndex = sequences.length;
        //     sequences.push([]);
        //     return newIndex;
        // }
        //
        // function findSequenceIndex(target) {
        //     for (let sIndex = 0; sIndex < sequences.length; sIndex++) {
        //         for (let index = 0; index < sequences[sIndex].length; index++) {
        //             for (let fIndex = 0; fIndex < sequences[sIndex][index].feedId.length; fIndex++) {
        //                 if (sequences[sIndex][index].feedId[fIndex] === target) {
        //                     return sIndex;
        //                 }
        //             }
        //         }
        //     }
        //     return undefined;
        // }
        //
        // function getAllLinkedEvents(evt) {
        //     let parents = [];
        //     let parentIds = _.pluck(evt.links, 'target');
        //     _.each(parentIds, (parentId) => {
        //         if (eventMap[parentId].hidden.checked === false) {
        //             let parent = eventMap[parentId];
        //             parents.push(parent);
        //             parents = parents.concat(getAllLinkedEvents(parentId));
        //             eventMap[parentId].hidden.checked = true;
        //         }
        //     });
        //     return parents;
        // }
        //
        // function createGroup(evt) {
        //     eventMap[evt.feedId[0]].checked = true;
        //     let targets = _.pluck(evt.links, 'target');
        //     let sequenceIndex = undefined;
        //     let evts = [evt];
        //
        //     for (let tIndex = 0; tIndex < targets.length; tIndex++) {
        //         if (sequenceIndex === undefined) {
        //             sequenceIndex = findSequenceIndex(targets[tIndex]);
        //         }
        //         evts = evts.concat(getAllLinkedEvents(eventMap[targets[tIndex]]));
        //     }
        //     if (sequenceIndex === undefined) {
        //         sequenceIndex = newSequence();
        //     }
        //     sequences[sequenceIndex] = sequences[sequenceIndex].concat(evts);
        // }

        // _.each(events, (event) => {
        //     // createGroup(event);
        //     done++;
        //
        //     let print = Math.floor((done / total) * 100);
        //     if (print >= (lastPrint + 5)) {
        //
        //         console.log("Finding end-nodes progress: " + print + '% (' + done + '/' + total + ')');
        //         console.log(sequences.length);
        //         console.log(sequences[0].length);
        //         lastPrint = print;
        //     }
        // });
        //
        // console.log(sequences.length);
        // console.log(sequences[0].length);


        // let sequences = {};

        // function getStartEvent(evt) {
        //     let parents = _.pluck(event.links, 'target');
        //     if(parents.length === 0){
        //         return evt;
        //     }
        //     return getStartEvent(parents[0]);
        // }

        // _.each(events, (event) => {
        //     let startEvent = getStartEvent(event);
        //     if(sequences[startEvent.feedId[0]] === undefined){
        //         sequences[getStartEvent(event)] =
        //     }
        //     sequences[getStartEvent(event)].
        // })


        //
        //
        // let eventMap = {};
        // let endNodesMap = {};
        //
        // _.each(events, (event) => {
        //     eventMap[event.feedId[0]] = event;
        //     endNodesMap[event.feedId[0]] = event;
        // });
        //
        // let undefinedParents = [];
        //
        // _.each(eventMap, (event, id) => {
        //     let parents = _.pluck(event.links, 'target');
        //     _.each(parents, (parent) => {
        //         if (eventMap[parent] === undefined) {
        //             undefinedParents.push(parent);
        //         } else {
        //             if (endNodesMap[parent] !== undefined) {
        //                 delete endNodesMap[id];
        //             }
        //         }
        //     })
        // });
        //
        // console.log('Found ' + undefinedParents.length + ' undefined parents.');
        //
        // let endNodes = [];
        //
        // // console.log(endNodesMap);
        //
        // _.each(endNodesMap, (event) => {
        //     endNodes.push(event);
        // });
        //
        //
        // endNodes = _.sortBy(endNodes, 'timeStart');
        //
        // _.each(endNodes, (endNode) => {
        //     let timeStart = endNode.timeStart;
        //     let timeFinish = endNode.timeFinish;
        //
        //     function getParents(child) {
        //         // console.log("getting parents");
        //         let parents = [];
        //         let parentIds = _.pluck(child.links, 'target');
        //         _.each(parentIds, (parentId) => {
        //             if (eventMap[parentId] === undefined) {
        //                 // console.log('found undefined')
        //             } else {
        //                 let childEvent = eventMap[parentId];
        //                 if (!childEvent.hidden.checked) {
        //                     childEvent.hidden.checked = true;
        //
        //                     if (childEvent.timeStart < timeStart) {
        //                         timeStart = childEvent.timeStart;
        //                     }
        //                     if (childEvent.timeFinish > timeFinish) {
        //                         timeFinish = childEvent.timeFinish;
        //                     }
        //
        //                     parents.push(childEvent);
        //                     let newParents = getParents(_.pluck(childEvent.links, 'target'));
        //                     parents.concat(newParents);
        //                 }
        //             }
        //         });
        //         return parents;
        //     }
        //
        //     let sequence = [endNode];
        //     sequence = sequence.concat(getParents(endNode));
        //
        //     EventSequences.insert({
        //         timeStart: timeStart,
        //         timeFinish: timeFinish,
        //         events: sequence
        //     });
        //
        //     done = done + sequence.length;
        //     let print = Math.floor((done / total) * 100);
        //     if (print >= (lastPrint + 5)) {
        //         console.log("Finding end-nodes progress: " + print + '% (' + done + '/' + total + ')');
        //         lastPrint = print;
        //     }
        // });
        // console.log("End-nodes found.");
    }
});

