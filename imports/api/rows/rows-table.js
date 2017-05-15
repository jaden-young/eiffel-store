'use strict';
import Tabular from "meteor/aldeed:tabular";
import {Rows} from "./rows";


new Tabular.Table({
    name: "Rows",
    collection: Rows,
    columns: [
        {data: "sequenceId", title: "sequenceId", visible: false},
        {data: "id", title: "id", visible: false},
        {
            tmpl: Meteor.isClient && Template.button_row
        },
        // {data: "name", title: "Name"},
        // {data: "type", title: "Type"},
        {
            data: "time.started",
            title: "Start time",
            // render: function (val, type, doc) {
            //     (new Date(val)).toString()
            // }
        },
        {
            data: "time.finished",
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
    lengthMenu: [[10, 50, 100, -1], [10, 50, 100, "All"]],
    scrollY: "500px",
    scrollCollapse: true,
    // paging: false,
    search: {
        // caseInsensitive: true,
        // smart: true,
        // onEnterOnly: true
    },
    sub: new SubsManager({
        // maximum number of cache subscriptions
        cacheLimit: 1000,
        // any subscription will be expire after 5 minute, if it's not subscribed again
        expireIn: 5
    })
});