'use strict';
import "./layout.html";
import "../components/aggregation.html";
import "../components/details.html";
import "../components/eventchain.html";

import {isAlive} from "/imports/api/utils/methods"

$(document).ready(function () {
    $(document.body).attr('data-spy', 'scroll');
    $(document.body).attr('data-target', '#navscrollspy');
    $(document.body).scrollspy({offset: 200});
    $('[data-spy="scroll"]').each(function () {
        $(this).scrollspy('refresh');
    });

});


//jQuery for page scrolling feature - requires jQuery Easing plugin
$(function () {
    $(document).on('click', 'a.page-scroll', function (event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top - 10
        }, 300, 'easeInOutExpo');
        event.preventDefault();
    });
});



/**
 *  Meteor event handler to handle events in the layout-template
 */
Template.layout.events({
    'click #level1_button': function (event) {
        event.preventDefault();
        document.getElementById('aggregation').style.display = 'block';

        document.querySelector('#aggregation.section').scrollIntoView({
            behavior: 'smooth'
        });
    },

    'click #level2_button': function (event) {
        event.preventDefault();
        document.getElementById('details').style.display = 'block';
        document.querySelector('#details.section').scrollIntoView({
            behavior: 'smooth'
        });
    },

    'click #level3_button': function (event) {
        event.preventDefault();
        document.getElementById('details').style.display = 'block';
        document.querySelector('#eventchain.section').scrollIntoView({
            behavior: 'smooth'
        });

    },

    'click #cy_help_button': function (event) {
        event.preventDefault();
        if (document.getElementById('cy_help_popup').style.display === 'block') {
            document.getElementById('cy_help_popup').style.display = 'none';
        } else {

            document.getElementById('cy_help_popup').style.display = 'block';
        }
    },

});

let timer = null;


Template.layout.rendered = function() {
  this.timer = setInterval(checkConnection, 5000);
};

Template.layout.onDestroyed = function(){
    clearInterval(timer);
}

function checkConnection() {
    isAlive.call(function (e, result) {
        if (e) {
            $('#lost-connection-modal').modal('show');
        } else {
            $('#lost-connection-modal').modal('hide');

        }
    });
}
