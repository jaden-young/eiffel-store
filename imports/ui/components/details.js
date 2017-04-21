import {Template} from "meteor/templating";
import "./details.html";

import {$} from "meteor/jquery";
import dataTablesBootstrap from "datatables.net-bs";
import "datatables.net-bs/css/dataTables.bootstrap.css";
import dataTableButtons from 'datatables.net-buttons-bs';
import {Session} from "meteor/session";

dataTablesBootstrap(window, $);
dataTableButtons(window, $);

Template.aggregation.events({
    'click .aggregation-tt-btn': function (event) {

        Session.set('nodeNameFilter', event.target.value);
        $('#table-level2-heading').html(Session.get('nodeNameFilter'));


        $('html, body').animate({
            scrollTop: $("#details").offset().top - 10
        }, "slow");
    }
});

Template.details.events({
    'click .showEventChainButton': function (event) {

        $('html, body').animate({
            scrollTop: $("#eventchain").offset().top - 10
        }, "slow");
    }
});

Template.details.onCreated(function () {
    Session.set('nodeNameFilter');
    Session.set('displayedSequenceIds');
    Session.set('displayedSequenceId');
});
Template.details.helpers({
    selector() {
        return {name: Session.get('nodeNameFilter'), sequenceId: {$in: (Session.get('displayedSequenceIds'))}}
    }
});