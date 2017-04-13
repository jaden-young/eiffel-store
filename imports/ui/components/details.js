import {Template} from "meteor/templating";
import "./details.html";
import {getLevelTwoGraph} from "/imports/api/events/methods.js";

require('datatables.net-bs')(window, $);

$(document).ready(function () {
    $('#table-level2').DataTable();
});


Template.aggregation.events({
    'click .aggregation-tt-btn': function (event) {
        console.log(event.target.value);

        $('html, body').animate({
            scrollTop: $("#details-container").offset().top - 10
        }, "slow");


        Meteor.subscribe('events', function() {
            // let data = getLevelTwoGraph.call({nodeId: event.target.value});
            console.log(getLevelTwoGraph.call({nodeId: event.target.value}));
        });

        console.log("end");

    }
});