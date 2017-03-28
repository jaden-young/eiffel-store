import { Template } from "meteor/templating";
import { renderGraph } from "./graph.js";

import './helpbutton.html';
import { getAggregatedGraph } from '/imports/api/events/methods.js';

Template.aggregation.rendered = () => {
    $(() => {

    });
}

