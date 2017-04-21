'use strict';
import {Template} from "meteor/templating";
import {Session} from "meteor/session";

import {getEventChainGraph} from "/imports/api/eventSequences/methods";

import {renderGraph} from "./graph.js";

import "./eventchain.html";


// import {Session} from "meteor/session";

Template.eventchain.rendered = () => {
    // Runs when document is ready
    $(() => {
        $('#graph-level3-heading').hide();
        $("time.timeago").timeago();
    });
};

Template.button_row.events({
    'click .showEventChainButton': function (event) {

        // showEventChain(this.sequenceId);
        // Session.set('selectedSequenceId', this.sequenceId);


        $('html, body').animate({
            scrollTop: $("#eventchain").offset().top - 10
        }, "slow");

        updateSequenceGraph(this.sequenceId);
    }
});

Template.details.onCreated(function () {
    Session.set('selectedSequenceId');
});

function updateSequenceGraph(sequenceId) {
    $('#graph-level3-heading').hide();
    $('#graph-level3-heading-alt').hide();
    getEventChainGraph.call({sequenceId: sequenceId}, function (error, graph) {
        if (error) {
            console.log(error);
        } else {
            let container = $('#cy-event-chain');
            // console.log(graph);
            if (graph !== undefined) {
                renderGraph(graph, container);
                $("time#selectedSequenceUpdatedTime").timeago("update", new Date());
                $('#graph-level3-heading').show();
            } else {
                $('#graph-level3-heading-alt').show();
            }

        }
    })
}
