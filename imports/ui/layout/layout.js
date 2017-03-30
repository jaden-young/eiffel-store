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
 *  Meteor event handler to handle events in the layout-template
 */
Template.layout.events({
    'click #level1_button' : function(event) {
        event.preventDefault();
        document.getElementById('aggregation').style.display = 'block';

        document.querySelector('#aggregation.section').scrollIntoView({
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

    }
});