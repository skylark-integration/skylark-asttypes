define([
    './es2021',
    '../types'
], function (es2021Def, typesPlugin) {
    'use strict';
    return function (fork) {
        fork.use(es2021Def);
        const types = fork.use(typesPlugin);
        const def = types.Type.def;
        def('StaticBlock').bases('Declaration').build('body').field('body', [def('Statement')]);
    };
});