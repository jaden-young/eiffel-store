import {Template} from "meteor/templating";
import "./details.html";

require('datatables.net-bs')(window, $);

$(document).ready(function () {
    $('#table_id').DataTable();
});

Template.aggregation.events({
    'click .aggregation-tt-btn': function (event) {
        console.log(event.target.value);

        $('html, body').animate({
            scrollTop: $("#details-container").offset().top - 10
        }, "slow");
    }
});