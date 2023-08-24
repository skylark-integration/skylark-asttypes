define([
    './es2018',
    '../types',
    '../shared'
], function (es2018Def, typesPlugin, sharedPlugin) {
    'use strict';
    return function (fork) {
        fork.use(es2018Def);
        const types = fork.use(typesPlugin);
        const def = types.Type.def;
        const or = types.Type.or;
        const defaults = fork.use(sharedPlugin).defaults;
        def('CatchClause').field('param', or(def('Pattern'), null), defaults['null']);
    };
});