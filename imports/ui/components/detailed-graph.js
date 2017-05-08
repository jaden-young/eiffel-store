import vis from "vis";

function renderDetailedGraph(graph, data) {
    if (graph === undefined || data === undefined) {
        return false;
    }

    let groups = new vis.DataSet();

    groups.add({
        id: 0,
        content: 'Passed',
        style: 'stroke:green;',
        options: {
            drawPoints: false,
            shaded: {
                orientation: 'zero',
                style: 'fill:green;'
            }
        }
    });

    groups.add({
        id: 1,
        content: 'Failed',
        style: 'stroke:red;',
        options: {
            drawPoints: false,
            shaded: {
                orientation: 'zero',
                style: 'fill:red;'
            }
        }
    });

    groups.add({
        id: 2,
        content: 'Ground',
        style: 'stroke:black;',
        options: {
            drawPoints: false,
        }
    });

    groups.add({
        id: 3,
        content: 'Result',
        style: 'stroke:black;',
        options: {
            style: 'points',
            drawPoints: {
                styles: 'stroke:black;fill:none;'
            }
        }
    });

    let container = graph[0];

    let dataset = new vis.DataSet(data.items);
    let options = {
        start: data.time.start,
        end: data.time.end,
        dataAxis: {
            left: {
                format: function (value) {
                    if (value === Math.floor(value)) {
                        switch (value) {
                            case -1:
                                return 'Failed';
                            case 0:
                                return 'Inconclusive';
                            case 1:
                                return 'Passed';
                            default:
                                break;
                        }
                    }
                    return '';
                }
            }
        },
        interpolation: false,
        sort: false,

    };
    let Graph2d = new vis.Graph2d(container, dataset, groups, options);
}

export {renderDetailedGraph}