// let $ = jQuery.noConflict();

let cytoscape = require('cytoscape');

let cydagre = require('cytoscape-dagre');
cydagre(cytoscape); // register extension

// let panzoom = require('cytoscape-panzoom');
// panzoom(cytoscape); // register extension

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
    // console.log(jQuery.fn.jquery);
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
                    'target-arrow-color': '#ccc',
                    'target-arrow-shape': 'triangle'
                }
            }
        ],

        layout: {
            name: 'dagre',
            rankDir: 'LR'
        }
    });

    cy.on('tap', 'node', onClick);
    // cytoscape.panzoom(defaults);
}

export {renderGraph}