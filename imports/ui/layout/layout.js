import "./layout.html";
import "../components/aggregation.html";
import "../components/details.html";
import "../components/eventchain.html";


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
