import cytoscape from "cytoscape";
import cydagre from "cytoscape-dagre";

import "cytoscape-panzoom/cytoscape.js-panzoom.css";
import "font-awesome/css/font-awesome.css";
import panzoom from "cytoscape-panzoom";
// import "/styles/jquery.qtip.min.css";
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
                    'label': 'data(id)'
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
                selector: 'node[id ^= "CLM"]', // All nodes with ID == CLM (Confidence level)
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
                selector: 'node[id ^= "TC"]', // All nodes with ID starting with TC(Test Case)
                style: {
                    'background-color': FAIL_COLOR,
                    'shape': 'rectangle',
                    'border-style': 'solid',
                    'border-width': '1px',
                    'border-color': '#000',
                    'height': 50,
                    'width': 100
                }
            },

            {
                selector: 'node[id ^= "TCF"]', // All nodes with ID starting with TCF(Test Case Finished)
                style: {
                    'background-image': '/images/green.png',
                    'background-height': '100%',
                    'background-width': function (ele) {
                        return (ele.data("passed") * 100).toString() + '%';
                    },
                    'background-position-x': '0px'
                }
            },

            {
                selector: 'node[id ^= "TS"]', // All nodes with ID starting with TS(Test Suite)
                style: {
                    'background-color': FAIL_COLOR,
                    'shape': 'rectangle',
                    'border-style': 'double', // solid, dotted, dashed, or double.
                    'border-width': '6px', // The size of the node’s border.
                    'border-color': '#000',
                    'height': 50,
                    'width': 100
                }
            },

            {
                selector: 'node[id ^= "TSF"]', // All nodes with ID starting with TSF(Test Suite Finished)
                style: {
                    'background-position-x': '0px',
                    'background-image': '/images/green.png',
                    'background-height': '100%',
                    'background-width': function (ele) {
                        return (ele.data("passed") * 100).toString() + '%';
                    }
                }
            },

            {
                selector: 'node[id ^= "CDef"]', // All nodes with ID starting with CD (Composition Defined)
                style: {
                    'background-color': ELSE_COLOR,
                    'shape': 'polygon',
                    'shape-polygon-points': '-0.1 1 -0.17 0.77 -0.32 0.72 -0.53 0.87 -0.68 0.77 -0.6 0.53 -0.68 0.38 -0.94 0.39 -1 0.22 -0.79 0.08 -0.79 -0.08 -1 -0.22 -0.94 -0.39 -0.68 -0.38 -0.6 -0.53 -0.68 -0.77 -0.53 -0.87 -0.32 -0.72 -0.17 -0.77 -0.1 -1 0.1 -1 0.17 -0.77 0.32 -0.72 0.53 -0.87 0.68 -0.77 0.6 -0.53 0.68 -0.38 0.94 -0.39 1 -0.22 0.79 -0.08 0.79 0.08 1 0.22 0.94 0.39 0.68 0.38 0.6 0.53 0.68 0.77 0.53 0.87 0.32 0.72 0.17 0.77 0.1 1',
                    'border-style': 'solid', // solid, dotted, dashed, or double.
                    'border-width': '1px',
                    'border-color': '#000',
                    'height': 70,
                    'width': 70,
                    'pie-size': '40%',
                    'pie-1-background-size': '100%',
                    'pie-1-background-color': '#fff',
                }
            },

            {
                selector: 'node[id ^= "Act"]', // All nodes with ID starting with Act (Activity)
                style: {
                    'background-color': '#ffd908',
                    'shape': 'triangle',
                    'border-style': 'solid', // solid, dotted, dashed, or double.
                    'border-width': '6px',
                    'border-color': '#f14c53',
                    'height': 60,
                    'width': 70,
                }
            },

            {
                selector: 'node[id ^= "Art"]', // All nodes with ID starting with (Artifact)
                style: {
                    'background-color': ELSE_COLOR,
                    'shape': 'polygon',
                    'shape-polygon-points': '-0.3 0 -0.95 -0.48 -0.88 -0.64 -0.77 -0.78 -0.63 -0.89 -0.46 -0.96 -0.28 -1 -0.09 0 -0.99 0.11 -0.95 0.3 0 -0.88 0.48 -0.77 0.64 -0.63 0.78 -0.46 0.89 -0.28 0.96 -0.09 0 1 0.11 0.99 0.3 0 0.95 0.48 0.88 0.64 0.77 0.78 0.63 0.89 0.46 0.96 0.28 1 0.09 0 1 -0.09 0 0.96 -0.28 0.89 -0.46 0.78 -0.63 0.64 -0.77 0.48 -0.88 0.3 0 -0.95 0.3 0 0.5 0 0 0.6 -0.5 0 -0.3 0',
                    'border-style': 'solid', // solid, dotted, dashed, or double.
                    'border-width': '1px',
                    'border-color': '#000',
                    'height': 70,
                    'width': 70,
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

    cy.elements().qtip({
        content: function () {
            return 'Example qTip on ele ' + this.id() + '<p>man kan ha html i denna ruta</p>' // Ändra här för att ändra vad som ska vara i den
        },
        position: {
            my: 'center center',
            at: 'center center',
        },
        show: {
            event: 'mouseover',
            // event: 'click', om den ska trigga på klick istället
            solo: true,
        },
        hide: {
            event: 'mouseout'
        },
        style: {
            classes: 'qtip-bootstrap qtip-shadow',
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