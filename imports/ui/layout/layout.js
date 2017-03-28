/**
 * Created by seba on 2017-03-25.
 */

import './layout.html';
import '../components/aggregation.html';
import '../components/details.html';
import '../components/eventchain.html';


/**
 * Shows the level provided
 * @param level Level to be viewed
 */
viewLevel = function (level) {
    switch (level) {
        case 1:
            document.getElementById('eventchain').style.display = 'none';
            document.getElementById('details').style.display = 'none';
            document.getElementById('aggregation').style.display = 'block';
            break;
        case 2:
            document.getElementById('aggregation').style.display = 'none';
            document.getElementById('eventchain').style.display = 'none';
            document.getElementById('details').style.display = 'block';
            break;
        case 3:
            document.getElementById('aggregation').style.display = 'none';
            document.getElementById('details').style.display = 'none';
            document.getElementById('eventchain').style.display = 'block';
            break;
        default:
            break;
    }
};

display_help = function () {
    //document.getElementById('cy-help-button').style.display = 'block';
    console.log("Clicked help button"); //Need to call for a help display here instead!
};

/**
 *  Meteor event handler to handle events in the layout-template
 */
Template.layout.events({
    'click #level1_button' : function(event) {
        event.preventDefault();
        viewLevel(1);
    },

    'click #level2_button' : function (event) {
        event.preventDefault();
        viewLevel(2);
    },

    'click #level3_button' : function(event){
        event.preventDefault();
        viewLevel(3);
    },
    'click #cy_help_button' : function(event){
        display_help();
    }
});


