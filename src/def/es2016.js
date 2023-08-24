define([
    './operators/es2016',
    './es6'
], function (es2016OpsDef, es6Def) {
    'use strict';
    return function (fork) {
        fork.use(es2016OpsDef);
        fork.use(es6Def);
    };
});