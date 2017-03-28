import { Template } from "meteor/templating";
import { renderGraph } from "./graph.js";

import './helpbutton.html';
import { getAggregatedGraph } from '/imports/api/events/methods.js';

Template.aggregation.rendered = () => {
    $(() => {

    });
}

display_help = function (buttonId) {
    document.getElementById('cy-help-button').style.display = 'block';
    console.log("Clicked", "Clicked help button");
};