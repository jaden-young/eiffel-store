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
        $("time.timeago").timeago();
        show(1);
    });
};

Template.button_row.events({
    'click .showEventChainButton': function (event) {
        updateSequenceGraph(this.sequenceId);
    }
});

Template.details.onCreated(function () {
    Session.set('selectedSequenceId');
});

function showNon() {
    $('#level3_heading_select').hide();
    $('#level3_heading_loading').hide();
    $('#level3_heading_updated').hide();

    $('#sequence_loader').hide();

    $('#level3_footer_select').hide();
    $('#level3_footer_loading').hide();
    $('#level3_footer_updated').hide();
}

function show(state) {
    showNon();

    switch (state) {
        case 1:
            $('#level3_heading_select').show();
            $('#level3_footer_select').show();
            break;
        case 2:
            $('#level3_heading_loading').show();

            $('#sequence_loader').show();

            $('#level3_footer_loading').show();
            break;
        case 3:
            $("time#sequence_updated_time").timeago("update", new Date());
            $('#level3_heading_updated').show();

            $('#level3_footer_updated').show();
            break;
        default:
            break;
    }
}

function updateSequenceGraph(sequenceId) {
    show(2);
    $('html, body').animate({
        scrollTop: $("#eventchain").offset().top - 10
    }, "slow");
    getEventChainGraph.call({sequenceId: sequenceId}, function (error, graph) {
        if (error) {
            console.log(error);
        } else {
            let container = $('#cy-event-chain');
            if (graph !== undefined) {
                renderGraph(graph, container);
                $('#level3_footer_updated').html('Showing a sequence with time span ' +
                    formatDate(new Date(graph.timeStart)) + ' - ' +
                    formatDate(new Date(graph.timeFinish)) + " and its connected sequences.").show();
                show(3);
            } else {
                show(1);
            }
        }
    })
}

function formatDate(timestamp) {
    console.log('formatdate', timestamp);
    console.log(timestamp.getFullYear());
    let day = timestamp.getDate(),
        month = timestamp.getMonth() + 1,
        year = timestamp.getFullYear();
    return year + "-" + month + "-" + day;
}