import cytoscape from "cytoscape";
import cydagre from "cytoscape-dagre";

import "cytoscape-panzoom/cytoscape.js-panzoom.css";
import panzoom from "cytoscape-panzoom";

import cyqtip from "cytoscape-qtip";

cydagre(cytoscape); // register extension
panzoom(cytoscape, $); // register extension
cyqtip( cytoscape ); // register extension

/**
 * Renders a graph using Cytoscape, with provided graph
 * in the provided DOM element.
 * Expects provided graph to be in Cytoscape syntax.
 *
 * See http://js.cytoscape.org/ on notes
 * on how to to use Cytoscape.
 */
function renderGraph(graph, container, onClick) {
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
                    'background-color': '#666', 
                    'label': 'data(id)'
                }
            },

            {
                selector: 'edge',
                style: {
                    'width': 3,
                    'line-color': '#ccc',
                    'curve-style': 'bezier', // To make sure edge arrows are supported
                    'source-arrow-color': '#ccc',
                    'source-arrow-shape': 'triangle'
                }
            },

            {
                selector: 'node[id ^= "TC"]', // All nodes with ID starting with TC(Test Case)
                style: {
                    'background-color': '#af0020',
                    'shape': 'rectangle',
                    'height': 50,
                    'width': 100
                }
            },

            {
                selector: 'node[id ^= "TCF"]', // All nodes with ID starting with TCF(Test Case Finished)
                style: {
                    'background-image': '/images/green.png',
                    'background-height': '100%',
                    'background-width': function(ele){
                        return (ele.data("passed") * 100).toString() + '%';
                    },
                    'background-position-x':'0px'
                }
            },

            {
                selector: 'node[id ^= "TS"]', // All nodes with ID starting with TS(Test Suite)
                style: {
                    'background-color': '#af0020',
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
                    'background-position-x':'0px',
                    'background-image': '/images/green.png',
                    'background-height': '100%',
                    'background-width': function(ele){
                        return (ele.data("passed") * 100).toString() + '%';
                    }
                }
            }
        ],

        layout: {
            name: 'dagre',
            rankDir: 'LR'
        },

        // Higher = faster zoom
        wheelSensitivity: 0.075,
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

    cy.on('tap', 'node', onClick);
}

export {renderGraph}