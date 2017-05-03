'use strict';
import cytoscape from "cytoscape";
import cydagre from "cytoscape-dagre";

import "cytoscape-panzoom/cytoscape.js-panzoom.css";
import panzoom from "cytoscape-panzoom";
import cyqtip from "cytoscape-qtip";

cydagre(cytoscape); // register extension
panzoom(cytoscape, $); // register extension
cyqtip(cytoscape); // register extension


/**
 * Renders a graph using Cytoscape, with provided graph
 * in the provided DOM element.
 * Expects provided graph to be in Cytoscape syntax.
 *
 * See http://js.cytoscape.org/ on notes
 * on how to to use Cytoscape.
 */
const PASS_COLOR = '#22b14c';
const FAIL_COLOR = '#af0020';
const ELSE_COLOR = '#666';
function renderGraph(graph, container, level) {
    let cy = cytoscape({

        container: container,

        elements: {
            nodes: graph.nodes,
            edges: graph.edges
        },

        style: [ // the stylesheet for the graph
            {
                selector: 'node',
                style: {
                    'background-color': ELSE_COLOR,
                    'label': 'data(label)'
                }
            },

            {
                selector: 'edge',
                style: {
                    'width': 3,
                    'line-color': '#ccc',
                    'curve-style': 'bezier', // To make sure edge arrows are supported
                    'target-arrow-color': '#ccc',
                    'target-arrow-shape': 'triangle'
                }
            },
            {
                selector: 'edge[label = "dangerous"]',
                style: {
                    'line-style': 'dashed',
                }
            },

            {
                selector: 'node[label ^= "CLM"]', // All nodes with ID == CLM (Confidence level)
                style: {
                    'background-color': '#fff',
                    'border-width': '1px', // The size of the node’s border.
                    'border-color': '#000',
                    'width': '70px',
                    'height': '70x',
                    'pie-size': '100%',
                    'pie-1-background-size': function (ele) {
                        return (ele.data("passed") * 100 / ele.data("length") ).toString() + '%';
                    },
                    'pie-1-background-color': PASS_COLOR,
                    'pie-2-background-size': function (ele) {
                        return (ele.data("failed") * 100 / ele.data("length") ).toString() + '%';
                    },
                    'pie-2-background-color': FAIL_COLOR,
                    'pie-3-background-size': function (ele) {
                        return (ele.data("inconclusive") * 100 / ele.data("length") ).toString() + '%';
                    },
                    'pie-3-background-color': ELSE_COLOR
                }
            },

            {
                selector: 'node[label ^= "TC"]', // All nodes with ID starting with TC(Test Case)
                style: {
                    'background-color': FAIL_COLOR,
                    'shape': 'rectangle',
                    'height': 50,
                    'width': 100,
                    'background-image': '/images/green.png',
                    'background-height': '100%',
                    'background-width': function (ele) {
                        return (ele.data("passed") * 100 / ele.data("length") ).toString() + '%';
                    },
                    'background-position-x': '0px'
                }
            },
            {
                selector: 'node[label ^= "TS"]', // All nodes with ID starting with TSF(Test Suite Finished)
                style: {
                    'shape': 'rectangle',
                    'border-style': 'double', // solid, dotted, dashed, or double.
                    'border-width': '6px', // The size of the node’s border.
                    'border-color': '#000',
                    'height': 50,
                    'width': 100,
                    'background-color': FAIL_COLOR,
                    'background-position-x': '0px',
                    'background-image': '/images/green.png',
                    'background-height': '100%',
                    'background-width': function (ele) {
                        return (ele.data("passed") * 100 / ele.data("length") ).toString() + '%';
                    },
                }
            },
            {
                selector: 'node[extra = "highlight"]', // All nodes with ID starting with TSF(Test Suite Finished)
                style: {
                    'border-width': '8px', // The size of the node’s border.
                    'border-color': '#ffea22',
                }
            }
        ],

        layout: {
            name: 'dagre',
            rankDir: 'RL'
        },

        // Higher = faster zoom
        wheelSensitivity: 0.075,
    });

    function toHMS(ms_num) {
        let hours = Math.floor(ms_num / 3600000);
        let minutes = Math.floor((ms_num - (hours * 3600000)) / 60000);
        let seconds = Math.floor((ms_num - (hours * 3600000) - (minutes * 60000)) / 1000);
        let ms = Math.floor(ms_num - (hours * 3600000) - (minutes * 60000) - (seconds * 1000));

        return hours + 'h ' + minutes + 'm ' + seconds + 's ' + ms + 'ms';
    }

    function getTooltipContent(nodeData) {
        let nodeLabel = nodeData.label;
        switch (true) {
            case /Act/.test(nodeLabel):
                return '<h4>' + nodeLabel + '</h4>' +
                    getTooltipButton(nodeData.id) +
                    '<table class="table table-bordered">' +
                    '<tr><th>Status</th><th colspan="2">No. of</th></tr>' + // table header
                    '<tr class="success"><td>Successful</td><td class="td-right">' + nodeData.successful + '</td><td class="td-right">' + Math.round(10 * (nodeData.successful / nodeData.length * 100) / 10) + '%</td></tr>' +
                    '<tr><td>Unsuccessful</td><td class="td-right">' + nodeData.unsuccessful + '</td><td class="td-right">' + Math.round(10 * (nodeData.unsuccessful / nodeData.length * 100) / 10) + '%</td></tr>' +
                    '<tr><td>Failed</td><td class="td-right">' + nodeData.failed + '</td><td class="td-right">' + Math.round(10 * (nodeData.failed / nodeData.length * 100) / 10) + '%</td></tr>' +
                    '<tr><td>Aborted</td><td class="td-right">' + nodeData.aborted + '</td><td class="td-right">' + Math.round(10 * (nodeData.aborted / nodeData.length) / 10) + '%</td></tr>' +
                    '<tr><td>Timed out</td><td class="td-right">' + nodeData.timedOut + '</td><td class="td-right">' + Math.round(10 * (nodeData.timedOut / nodeData.length * 100) / 10) + '%</td></tr>' +
                    '<tr><td>Inconclusive</td><td class="td-right">' + nodeData.inconclusive + '</td><td class="td-right">' + Math.round(10 * (nodeData.inconclusive / nodeData.length) / 10) + '%</td></tr>' +
                    '<tr><td>Total no. of events</td><td colspan="2" class="td-right">' + nodeData.length + '</td></tr>' +
                    '<tr class="info"><td>Avg queue time</td><td colspan="2" class="td-right">' + toHMS(nodeData.avgQueueTime) + '</td></tr>' +
                    '<tr class="info"><td>Avg run time</td><td colspan="2" class="td-right">' + toHMS(nodeData.avgRunTime) + '</td></tr>' +
                    '</table>';
            case /AP/.test(nodeLabel):
                return '<h4>' + nodeLabel + '</h4>' +
                    getTooltipButton(nodeData.id) +
                    '<table class="table table-bordered">' +
                    '<tr><th>Status</th><th colspan="2">No. of</th></tr>' + // table header
                    '<tr><td>Minor</td><td class="td-right">' + nodeData.minor + '</td><td class="td-right">' + Math.round(10 * (nodeData.minor / nodeData.length * 100) / 10) + '%</td></tr>' +
                    '<tr><td>Major</td><td class="td-right">' + nodeData.major + '</td><td class="td-right">' + Math.round(10 * (nodeData.major / nodeData.length * 100) / 10) + '%</td></tr>' +
                    '<tr><td>Critical</td><td class="td-right">' + nodeData.critical + '</td><td class="td-right">' + Math.round(10 * (nodeData.critical / nodeData.length * 100) / 10) + '%</td></tr>' +
                    '<tr><td>Blocker</td><td class="td-right">' + nodeData.blocker + '</td><td class="td-right">' + Math.round(10 * (nodeData.blocker / nodeData.length) / 10) + '%</td></tr>' +
                    '<tr><td>Closed</td><td class="td-right">' + nodeData.closed + '</td><td class="td-right">' + Math.round(10 * (nodeData.closed / nodeData.length * 100) / 10) + '%</td></tr>' +
                    '<tr><td>Canceled</td><td class="td-right">' + nodeData.canceled + '</td><td class="td-right">' + Math.round(10 * (nodeData.canceled / nodeData.length) / 10) + '%</td></tr>' +
                    '<tr><td>Total no. of events</td><td colspan="2" class="td-right">' + nodeData.length + '</td></tr>' +
                    '</table>';
            case /CLM/.test(nodeLabel):
                return '<h4>' + nodeLabel + '</h4>' +
                    getTooltipButton(nodeData.id) +
                    '<table class="table table-bordered">' +
                    '<tr><td colspan="3"><em>' + nodeData.name + '</em></td></tr>' +
                    '<tr><th>Status</th><th colspan="2">No. of</th></tr>' + // table header
                    '<tr class="success"><td>Passed</td><td class="td-right">' + nodeData.passed + '</td><td class="td-right">' + Math.floor(nodeData.passed / nodeData.length * 100) + '%</td></tr>' +
                    '<tr class="danger"><td>Failed</td><td class="td-right">' + nodeData.failed + '</td><td class="td-right">' + Math.floor(nodeData.failed / nodeData.length * 100) + '%</td></tr>' +
                    '<tr><td>Inconclusive</td><td class="td-right">' + nodeData.inconclusive + '</td><td class="td-right">' + Math.floor(nodeData.inconclusive / nodeData.length) + '%</td></tr>' +
                    '<tr><td>Total no. of events</td><td colspan="2" class="td-right">' + nodeData.length + '</td></tr>' +
                    '</table>';
            case /IV/.test(nodeLabel):
                return '<h4>' + nodeLabel + '</h4>' +
                    getTooltipButton(nodeData.id) +
                    '<table class="table table-bordered">' +
                    '<tr><th>Status</th><th colspan="2">No. of</th></tr>' + // table header
                    '<tr class="info"><td>Success</td><td class="td-right">' + nodeData.success + '</td><td class="td-right">' + Math.round(10 * (nodeData.passed / nodeData.length * 100) / 10) + '%</td></tr>' +
                    '<tr class="info"><td>Failure</td><td class="td-right">' + nodeData.failure + '</td><td class="td-right">' + Math.round(10 * (nodeData.failure / nodeData.length * 100) / 10) + '%</td></tr>' +
                    '<tr class="info"><td>Inconclusive</td><td class="td-right">' + nodeData.inconclusive + '</td><td class="td-right">' + Math.round(10 * (nodeData.inconclusive / nodeData.length) / 10) + '%</td></tr>' +
                    '<tr><td>Bug</td><td class="td-right">' + nodeData.bug + '</td><td class="td-right">' + Math.round(10 * (nodeData.bug / nodeData.length * 100) / 10) + '%</td></tr>' +
                    '<tr><td>Improvement</td><td class="td-right">' + nodeData.improvement + '</td><td class="td-right">' + Math.round(10 * (nodeData.improvement / nodeData.length * 100) / 10) + '%</td></tr>' +
                    '<tr><td>Feature</td><td class="td-right">' + nodeData.feature + '</td><td class="td-right">' + Math.round(10 * (nodeData.feature / nodeData.length) / 10) + '%</td></tr>' +
                    '<tr><td>Work Item</td><td class="td-right">' + nodeData.workItem + '</td><td class="td-right">' + Math.round(10 * (nodeData.workItem / nodeData.length * 100) / 10) + '%</td></tr>' +
                    '<tr><td>Requirement</td><td class="td-right">' + nodeData.requirement + '</td><td class="td-right">' + Math.round(10 * (nodeData.requirement / nodeData.length * 100) / 10) + '%</td></tr>' +
                    '<tr><td>Other</td><td class="td-right">' + nodeData.other + '</td><td class="td-right">' + Math.round(10 * (nodeData.other / nodeData.length) / 10) + '%</td></tr>' +
                    '<tr><td>Total no. of events</td><td colspan="2" class="td-right">' + nodeData.length + '</td></tr>' +
                    '</table>';
            case /TC/.test(nodeLabel):                                              // Checks if node_id starts with 'TSF'
                return '<h4>' + nodeLabel + '</h4>' +           // Tooltip-header (Node-ID)
                    getTooltipButton(nodeData.id) +          // Button will take user to level 2 - 'details'
                    '<table class="table table-bordered">' +
                    '<tr><th>Status</th><th colspan="2">No. of</th></tr>' +    // Table-header
                    '<tr class="success"><td>Passed</td><td class="td-right">' + nodeData.passed + '</td><td class="td-right">' + Math.round(10*(nodeData.passed / nodeData.length * 100) / 10) + '%</td></tr>' +
                    '<tr class="danger"><td>Failed</td><td class="td-right">' + nodeData.failed + '</td><td class="td-right">' + Math.round(10*(nodeData.failed / nodeData.length * 100) / 10) + '%</td></tr>' +
                    '<tr><td>Inconclusive</td><td class="td-right">' + nodeData.inconclusive + '</td><td class="td-right">' + Math.round(10*(nodeData.inconclusive / nodeData.length) / 10) + '%</td></tr>' +
                    '<tr><td>Total no. of events</td><td colspan="2" class="td-right">' + nodeData.length + '</td></tr>' +
                    '<tr class="info"><td>Avg run time</td><td colspan="2" class="td-right">' + toHMS(nodeData.avgRunTime) + '</td></tr>' +
                    '</table>'; // Row 3 - OTHER
            case /TS/.test(nodeLabel):                                              // Checks if node_id starts with 'TSF'
                return '<h4>' + nodeLabel + '</h4>' +           // Tooltip-header (Node-ID)
                    getTooltipButton(nodeData.id) +          // Button will take user to level 2 - 'details'
                    '<table class="table table-bordered">' +
                    '<tr><td colspan="3"><em>' + nodeData.name + '</em></td></tr>' +
                    '<tr><th>Status</th><th colspan="2">No. of</th></tr>' + // table header
                    '<tr class="success"><td>Passed</td><td class="td-right">' + nodeData.passed + '</td><td class="td-right">' + Math.round(10*(nodeData.passed / nodeData.length * 100) / 10) + '%</td></tr>' +
                    '<tr class="danger"><td>Failed</td><td class="td-right">' + nodeData.failed + '</td><td class="td-right">' + Math.round(10*(nodeData.failed / nodeData.length * 100) / 10) + '%</td></tr>' +
                    '<tr><td>Inconclusive</td><td class="td-right">' + nodeData.inconclusive + '</td><td class="td-right">' + Math.round(10*(nodeData.inconclusive / nodeData.length) / 10) + '%</td></tr>' +
                    '<tr><td>Total no. of events</td><td colspan="2" class="td-right">' + nodeData.length + '</td></tr>' +
                    '<tr class="info"><td>Avg run time</td><td colspan="2" class="td-right">' + toHMS(nodeData.avgRunTime) + '</td></tr>' +
                    '</table>'; // Row 3 - OTHER
            default:
                return '<h4 id="tt_header">' + nodeLabel + '</h4>' +
                    getTooltipButton(nodeData.id) +
                    '<table class="table table-bordered">' +
                    '<tr><td>Total no. of events</td><td class="td-right">' + nodeData.length + '</td></tr>' +
                    '</table>';

        }
    }

    function getLevelThreeContent(nodeData) {
        let nodeLabel = nodeData.label;
        let possible_jenkins = nodeData.eventData.executionUri;
        switch (true) {
            case /Act/.test(nodeLabel):                                              // Checks if node_id starts with 'TSF'
                if (typeof possible_jenkins === 'string' || possible_jenkins instanceof String){
                    return '<h4>' + nodeLabel + '</h4>' +           // Tooltip-header (Node-ID)
                        getTooltipButton(nodeData.id) +          // Button will take user to level 2 - ‘details’
                        '<table class="table table-bordered">' +
                        '<tr><th>Status</th><th colspan="2">No. of</th></tr>' +    // Table-header
                        '<tr><td>Jenkins:</td><td>' + possible_jenkins + '</td></tr>' + //this should show a stringified link to a homepage once data exists
                        '</table>'; // Row 3 - OTHER
                }
                else{
                    return '<h4>' + nodeLabel + '</h4>' +           // Tooltip-header (Node-ID)
                        getTooltipButton(nodeData.id) +          // Button will take user to level 2 - ‘details’
                        '<table class="table table-bordered">' +
                        '<tr><th>Status</th><th colspan="2">No. of</th></tr>' +    // Table-header
                        '</table>'; // Row 3 - OTHER
                }
            default:
                return '<h4 id="tt_header">' + nodeLabel + '</h4>' +
                    getTooltipButton(nodeData.id) +
                    '<table class="table table-bordered">' +
                    '<tr><td>Total no. of events</td><td class="td-right">' + nodeData.length + '</td></tr>' +
                    '</table>';

        }
    }

    function getTooltipButton(eiffelId) {
        return '<button type="button" class="btn btn-block btn-info aggregation-tt-btn" value="' + eiffelId + '"> Show all events </button>'
    }

    cy.nodes().qtip({
        content: function () {
            if (level === "aggregation") {
                return getTooltipContent(this.data()); // Ändra här för att ändra vad som ska vara i den
                //return 'Example qTip on ele ' + this.id() + '<div class="alert alert-success" role="alert"><strong>Well done!</strong> You successfully read this important alert message. (bootstrap)</div>' // Ändra här för att ändra vad som ska vara i den
            } else if (level === "eventchain"){
                return getLevelThreeContent(this.data());
            }
        },
        position: {
            my: 'bottom center',
            at: 'top center',
            container: $('#aggregation-tt')
        },
        show: {
            //event: 'mouseover',
            event: 'click', //om den ska trigga på klick istället
            solo: true,
        },
        hide: {
            //event: 'mouseout'
            event: 'unfocus'
        },
        style: {
            classes: 'qtip-viswiz qtip-shadow',
            tip: {
                width: 16,
                height: 8
            }
        },
    });

    // Settings for panzoom
    let defaults = {
        zoomFactor: 0.05, // zoom factor per zoom tick
        zoomDelay: 45, // how many ms between zoom ticks
        minZoom: 0.1, // min zoom level
        maxZoom: 10, // max zoom level
        fitPadding: 50, // padding when fitting
        panSpeed: 10, // how many ms in between pan ticks
        panDistance: 10, // max pan distance per tick
        panDragAreaSize: 75, // the length of the pan drag box in which the vector for panning is calculated (bigger = finer control of pan speed and direction)
        panMinPercentSpeed: 0.25, // the slowest speed we can pan by (as a percent of panSpeed)
        panInactiveArea: 8, // radius of inactive area in pan drag box
        panIndicatorMinOpacity: 0.5, // min opacity of pan indicator (the draggable nib); scales from this to 1.0
        zoomOnly: false, // a minimal version of the ui only with zooming (useful on systems with bad mousewheel resolution)
        fitSelector: undefined, // selector of elements to fit
        animateOnFit: function () { // whether to animate on fit
            return false;
        },
        fitAnimationDuration: 1000, // duration of animation on fit

        // icon class names
        sliderHandleIcon: 'fa fa-minus',
        zoomInIcon: 'fa fa-plus',
        zoomOutIcon: 'fa fa-minus',
        resetIcon: 'fa fa-expand'
    };

    cy.panzoom(defaults);

    cy.nodes().ungrabify();     //Makes nodes ungrabbable
    cy.maxZoom(10); //same setting as panzoom for Krav 2
    cy.minZoom(0.1); //same setting as panzoom for Krav 2
}

export {renderGraph}