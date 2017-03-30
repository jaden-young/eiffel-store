/**
 * Created by seba on 2017-03-25.
 */

import './layout.html';
import '../components/aggregation.html';
import '../components/details.html';
import '../components/eventchain.html';




display_help = function () {
    if (document.getElementById('cy_help_popup').style.display === 'none'){
        document.getElementById('cy_help_popup').style.display = 'block';
    } else {
        document.getElementById('cy_help_popup').style.display = 'none';
    }
    console.log("Clicked help button");
};


/**
 *  Meteor event handler to handle events in the layout-template
 */
Template.layout.events({
    'click #level1_button' : function(event) {
        event.preventDefault();
        document.getElementById('aggregation').style.display = 'block';
        document.querySelector('#pageTop').scrollIntoView({ //Should be aggregation.section for it to scroll right
            behavior: 'smooth'
        });
    },

    'click #level2_button' : function (event) {
        event.preventDefault();
        document.getElementById('details').style.display = 'block';
        document.querySelector('#details.section').scrollIntoView({
            behavior: 'smooth'
        });
    },

    'click #level3_button' : function(event){
        event.preventDefault();
        document.getElementById('details').style.display = 'block';
        document.querySelector('#eventchain.section').scrollIntoView({
            behavior: 'smooth'
        });

    },
    'click #cy_help_button' : function(event){
        event.preventDefault();
        display_help();
    }

});