'use strict';
import Tabular from "meteor/aldeed:tabular";
import {Rows} from "../../api/rows/rows";


new Tabular.Table({
    name: "Rows",
    collection: Rows,
    columns: [
        {data: "name", title: "Name"},
        {data: "type", title: "Type"},
        {data: "id", title: "ID"},
        {
            data: "timeStart",
            title: "Start time",
            // render: function (val, type, doc) {
            //     (new Date(val)).toString()
            // }
        },
        {
            data: "timeFinish",
            title: "End time",
            // render: function (val, type, doc) {
            //     (new Date(val)).toString()
            // }
        },
        {
            data: "timeExecution",
            title: "Execution time (ms)",
            // render: function (val, type, doc) {
            //     (new Date(val)).toString()
            // }
        },
        {data: "verdict", title: "Verdict"},
        {data: "conclusion", title: "Conclusion"},
    ],
    // destroy: true,
    lengthMenu: [[100, -1], [100, "All"]],
    scrollY: "600px",
    scrollCollapse: true,
    // paging: false,
    search: {
        // caseInsensitive: true,
        // smart: true,
        // onEnterOnly: true
    }
});