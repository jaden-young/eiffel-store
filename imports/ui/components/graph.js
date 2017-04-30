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
function renderGraph(graph, container) {
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
                    'border-color': '#000',
                    'border-width': '1px',
                    'border-style': 'solid',
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
                selector: 'node[label ^= "CLM"]', // All nodes with ID == CLM (Confidence level)
                style: {
                    'background-color': '#fff',
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
                selector: 'node[id ^= "SCC"]', // All nodes with ID starting with CD (Composition Defined)
                style: {
                    'shape': 'polygon',
                    'shape-polygon-points': '-0.1 1 -0.17 0.77 -0.32 0.72 -0.53 0.87 -0.68 0.77 -0.6 0.53 -0.68 0.38 -0.94 0.39 -1 0.22 -0.79 0.08 -0.79 -0.08 -1 -0.22 -0.94 -0.39 -0.68 -0.38 -0.6 -0.53 -0.68 -0.77 -0.53 -0.87 -0.32 -0.72 -0.17 -0.77 -0.1 -1 0.1 -1 0.17 -0.77 0.32 -0.72 0.53 -0.87 0.68 -0.77 0.6 -0.53 0.68 -0.38 0.94 -0.39 1 -0.22 0.79 -0.08 0.79 0.08 1 0.22 0.94 0.39 0.68 0.38 0.6 0.53 0.68 0.77 0.53 0.87 0.32 0.72 0.17 0.77 0.1 1',
                    'height': 70,
                    'width': 70,
                    'pie-size': '40%',
                    'pie-1-background-size': '100%',
                    'pie-1-background-color': '#fff',
                }
            },

            {
                selector: 'node[id ^= "Art"]', // All nodes with ID starting with Act (Activity)
                style: {
                    'shape': 'polygon',
                    'shape-polygon-points': '0.9 -0.4 0 -0.8 -0.9 -0.4 -0.9 0.6 0 1 0.9 0.6 0.9 -0.4 0 0 -0.9 -0.4 0 0 0 0.2 -0.9 0.6 0 0.2 0.9 0.6 0 0.2 0 1 0.9 0.6 0.9 -0.4',
                    'height': 60,
                    'width': 60,
                }
            },

            {
                selector: 'node[id ^= "ArtC"]', // All nodes with ID starting with Act (Activity)
                style: {
                    'background-color': '#0F0',
                }
            },

            {
                selector: 'node[id ^= "ArtP"]', // All nodes with ID starting with Act (Activity)
                style: {
                    'background-color': '#0000ff',
                }
            },

            {
                selector: 'node[id ^= "ArtR"]', // All nodes with ID starting with Act (Activity)
                style: {
                    'background-color': '#ff0000',
                }
            },

            {
                selector: 'node[id ^= "SCS"]', // All nodes with ID Sourcs Change Submitted
                style: {
                    'background-color': '#ff7e37',
                    'shape': 'polygon',
                    'shape-polygon-points': '-0.2 0.98 -0.39 0.92 -0.56 0.83 -0.71 0.7 -0.83 0.55 -0.92 0.38 -0.98 0.19 -1 0 -0.98 -0.2 -0.92 -0.38 -0.83 -0.56 -0.71 -0.71 -0.55 -0.83 -0.38 -0.92 -0.19 -0.98 0 -1 0.19 -0.98 0.38 -0.92 0.55 -0.83 0.71 -0.71 0.83 -0.56 0.92 -0.38 0.98 -0.2 1 0 1 0 0.98 0.19 0.92 0.38 0.83 0.55 0.71 0.71 0.56 0.83 0.38 0.92 0.2 0.98 0.2 0.1 0.5 0.1 0 -0.5 -0.5 0.1 -0.2 0.1',
                    'height': 70,
                    'width': 70,
                }
            },

            {
                selector: 'node[id ^= "CDef"]', // All nodes with ID Sourcs Change Submitted
                style: {
                    'shape': 'polygon',
                    'shape-polygon-points': '1 0 1 0.6 0.5 0.8 0 0.6 -0.5 0.8 -1 0.6 -1 0 -0.5 -0.2 -0.5 -0.8 0 -1 0.5 -0.8 0.5 -0.2 1 0  0.5 0.2 0.5 0.8 0.5 0.2 0 0 0 0.6 0 0 -0.5 0.2 -0.5 0.8 -0.5 0.2 -1 0 -0.5 -0.2 0 0 0.5 -0.2 0 0 0 -0.6 -0.5 -0.8 0 -0.6 0.5 -0.8 0.5 -0.2 1 0',
                    'height': 90,
                    'width': 90,
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

    function getTooltipContent(nodeData) {
        let nodeLabel = nodeData.label;

        switch (true) {
            case /TS/.test(nodeLabel):                                              // Checks if node_id starts with 'TSF'
                return '<h4>' + nodeLabel + '</h4>' +           // Tooltip-header (Node-ID)
                    getTooltipButton(nodeData.id) +          // Button will take user to level 2 - 'details'
                    '<table class="table table-bordered">' +
                    '<tr><th>Status</th><th colspan="2">No. of</th></tr>' +    // Table-header
                    '<tr class="success"><td>Passed</td><td class="td-right">' + nodeData.passed + '</td><td class="td-right">' + Math.floor(nodeData.passed / nodeData.length * 100) + '%</td></tr>' +
                    '<tr class="danger"><td>Failed</td><td class="td-right">' + nodeData.failed + '</td><td class="td-right">' + Math.floor(nodeData.failed / nodeData.length * 100) + '%</td></tr>' +
                    '<tr><td>Inconclusive</td><td class="td-right">' + nodeData.inconclusive + '</td><td class="td-right">' + Math.floor(nodeData.inconclusive / nodeData.length) + '%</td></tr>' +
                    '<tr><td>Total no. of events</td><td colspan="2" class="td-right">' + nodeData.length + '</td></tr>' +
                    '</table>'; // Row 3 - OTHER

            case /TC/.test(nodeLabel):                                              // Checks if node_id starts with 'TSF'
                return '<h4>' + nodeLabel + '</h4>' +           // Tooltip-header (Node-ID)
                    getTooltipButton(nodeData.id) +          // Button will take user to level 2 - 'details'
                    '<table class="table table-bordered">' +
                    '<tr><th>Status</th><th colspan="2">No. of</th></tr>' +    // Table-header
                    '<tr class="success"><td>Passed</td><td class="td-right">' + nodeData.passed + '</td><td class="td-right">' + Math.floor(nodeData.passed / nodeData.length * 100) + '%</td></tr>' +
                    '<tr class="danger"><td>Failed</td><td class="td-right">' + nodeData.failed + '</td><td class="td-right">' + Math.floor(nodeData.failed / nodeData.length * 100) + '%</td></tr>' +
                    '<tr><td>Inconclusive</td><td class="td-right">' + nodeData.inconclusive + '</td><td class="td-right">' + Math.floor(nodeData.inconclusive / nodeData.length) + '%</td></tr>' +
                    '<tr><td>Total no. of events</td><td colspan="2" class="td-right">' + nodeData.length + '</td></tr>' +
                    '</table>'; // Row 3 - OTHER

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
            return getTooltipContent(this.data()); // Ändra här för att ändra vad som ska vara i den
            //return 'Example qTip on ele ' + this.id() + '<div class="alert alert-success" role="alert"><strong>Well done!</strong> You successfully read this important alert message. (bootstrap)</div>' // Ändra här för att ändra vad som ska vara i den
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