import Tabular from "meteor/aldeed:tabular";
import {Rows} from "./rows";


new Tabular.Table({
    name: "Rows",
    collection: Rows,
    columns: [
        {data: "sequenceId", title: "sequenceId", visible: false},
        {
            tmpl: Meteor.isClient && Template.button_row
        },
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
    },
    sub: subs = new SubsManager({
        // maximum number of cache subscriptions
        cacheLimit: 1000,
        // any subscription will be expire after 5 minute, if it's not subscribed again
        expireIn: 5
    })
});