'use strict';
import {Template} from "meteor/templating";
import "./details.html";
import "./button-row.html";

import {$} from "meteor/jquery";
import dataTablesBootstrap from "datatables.net-bs";
import "datatables.net-bs/css/dataTables.bootstrap.css";
import {Session} from "meteor/session";

dataTablesBootstrap(window, $);

Template.details.rendered = () => {
    // Runs when document is ready
    $(() => {
        $(function () {
            $('#details_toggle').change(function () {
                if ($(this).prop('checked')) {
                    $('#detailsTable').hide()
                } else {
                    $('#detailsTable').show()
                }
            });
        })
    });
};

Template.aggregation.events({
    'click .aggregation-tt-btn': function (event) {

        Session.set('nodeNameFilter', event.target.value);
        $('#table-level2-heading').html(Session.get('nodeNameFilter'));


        $('html, body').animate({
            scrollTop: $("#details").offset().top - 10
        }, "slow");
    }
});

Template.details.onCreated(function () {
    Session.set('nodeNameFilter');
    Session.set('displayedSequenceIds');
});
Template.details.helpers({
    selector() {
        return {name: Session.get('nodeNameFilter'), sequenceId: {$in: (Session.get('displayedSequenceIds'))}}
    }
});