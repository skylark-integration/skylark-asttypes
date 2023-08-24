define([
    '../types',
    './babel-core',
    './flow'
], function (typesPlugin, babelCoreDef, flowDef) {
    'use strict';
    return function (fork) {
        const types = fork.use(typesPlugin);
        const def = types.Type.def;
        fork.use(babelCoreDef);
        fork.use(flowDef);
        def('V8IntrinsicIdentifier').bases('Expression').build('name').field('name', String);
        def('TopicReference').bases('Expression').build();
    };
});