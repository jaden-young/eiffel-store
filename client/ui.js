import cytoscape from "cytoscape";
import cydagre from "cytoscape-dagre";
import "cytoscape-panzoom/cytoscape.js-panzoom.css";
import panzoom from "cytoscape-panzoom";

cydagre(cytoscape); // register extension
panzoom(cytoscape, $); // register extension

// TODO: Is comment section below still valid? If not, remove. /Joanthan W
/**
 * Renders a graph using Vis, with provided graph
 * in the provided DOM element.
 * Expects provided graph to be in Vis syntax and
 * that an element with id 'network' exists in the DOM.
 *
 * See http://visjs.org/docs/network/ on notes
 * on how to to use Vis.
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
                    'curve-style': 'bezier', // To make sure egde arrows are supported
                    'source-arrow-color': '#ccc',
                    'source-arrow-shape': 'triangle'
                }
            },

            {
                selector: 'node[id ^= "TCS"]', // All nodes with ID starting with TCS
                style: {
                    'background-color': '#466641',
                    'label': 'data(id)',
                    'shape': 'rectangle',
                    'height': 50,
                    'width': 100
                }
            },

            {
                selector: 'node[id ^= "TCF"]', // All nodes with ID starting with TCF
                style: {
                    'background-color': '#466641',
                    'label': 'data(id)',
                    'shape': 'rectangle',
                    'height': 50,
                    'width': 100
                }
            },

            {
                selector: 'node[id ^= "TSS"]', // All nodes with ID starting with TSS
                style: {
                    'background-color': '#3d5966',
                    'label': 'data(id)',
                    'shape': 'rectangle',
                    'height': 50,
                    'width': 100
                }
            },

            {
                selector: 'node[id ^= "TSF"]', // All nodes with ID starting with TSF
                style: {
                    'background-color': '#3d5966',
                    'label': 'data(id)',
                    'shape': 'rectangle',
                    'height': 50,
                    'width': 100
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