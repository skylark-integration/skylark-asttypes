define([
    './es2016',
    '../types',
    '../shared'
], function (es2016Def, typesPlugin, sharedPlugin) {
    'use strict';
    return function (fork) {
        fork.use(es2016Def);
        const types = fork.use(typesPlugin);
        const def = types.Type.def;
        const defaults = fork.use(sharedPlugin).defaults;
        def('Function').field('async', Boolean, defaults['false']);
        def('AwaitExpression').bases('Expression').build('argument').field('argument', def('Expression'));
    };
});