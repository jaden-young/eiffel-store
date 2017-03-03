/**
 * Created by seba on 2017-03-03.
 */
let cy = require('cytoscape');
let cydagre = require('cytoscape-dagre');

cydagre( cytoscape ); // register extension

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
}

export { renderGraph }