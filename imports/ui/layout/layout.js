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

/**
 * Callback function for keydown events. Displays/hides <div>'s containing the different levels
 */
$(document).keydown(function (e) {
    switch (e.which) {
        case 49: // Nummer 1
            viewLevel(1);
            break;
        case 50: // Nummer 2
            viewLevel(2);
            break;
        case 51: // Nummer 3
            viewLevel(3);
            break;
        default:
            return; // exit this handler for other keys
    }
    e.preventDefault(); // prevent the default action (scroll / move caret)
});

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
    }

    /*
    'keydown #aggregation' : function(event){
        event.preventDefault();
        console.log('Keydown', 'It worked!');
    }*/
});