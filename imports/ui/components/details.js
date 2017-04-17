import {Template} from "meteor/templating";
import "./details.html";

import {$} from "meteor/jquery";
import dataTablesBootstrap from "datatables.net-bs";
import "datatables.net-bs/css/dataTables.bootstrap.css";
import {Session} from "meteor/session";

dataTablesBootstrap(window, $);

Template.aggregation.events({
    'click .aggregation-tt-btn': function (event) {

        Session.set('nodeNameFilter', event.target.value);
        $('#table-level2-heading').html(Session.get('nodeNameFilter'));


        $('html, body').animate({
            scrollTop: $("#details-container").offset().top - 10
        }, "slow");
    }
});

Template.details.onCreated(function () {

    Session.set('nodeNameFilter');
});
Template.details.helpers({
    selector() {
        return {name: Session.get('nodeNameFilter')}; // this could be pulled from a Session var or something that is reactive
    }
});