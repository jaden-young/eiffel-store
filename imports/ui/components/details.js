import {Template} from "meteor/templating";
import "./details.html";

require( 'datatables.net-bs' )( window, $ );
import {getTableData} from "./table.js";

$(document).ready( function () {
    $('#table_id').DataTable();
} );

// Template.aggregation.events({
//     'click .tt_button': function(e){
//         console.log("clicked");
//     }
// });
