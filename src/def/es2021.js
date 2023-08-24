define([
    './operators/es2021',
    './es2020'
], function (es2021OpsDef, es2020Def) {
    'use strict';
    return function (fork) {
        fork.use(es2021OpsDef);
        fork.use(es2020Def);
    };
});