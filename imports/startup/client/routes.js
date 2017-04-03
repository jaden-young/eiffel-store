/**
 * Created by seba on 2017-03-25.
 */

import '../../ui/layout/layout.js';
import '../../ui/pages/home.js';


Router.configure({
    layoutTemplate: 'layout'
});

Router.route('/', {
    template: 'home'
});