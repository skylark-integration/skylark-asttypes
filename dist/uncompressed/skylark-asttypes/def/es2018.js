define([
    './es2017',
    '../types',
    '../shared'
], function (es2017Def, typesPlugin, sharedPlugin) {
    'use strict';
    return function (fork) {
        fork.use(es2017Def);
        const types = fork.use(typesPlugin);
        const def = types.Type.def;
        const or = types.Type.or;
        const defaults = fork.use(sharedPlugin).defaults;
        def('ForOfStatement').field('await', Boolean, defaults['false']);
        def('SpreadProperty').bases('Node').build('argument').field('argument', def('Expression'));
        def('ObjectExpression').field('properties', [or(def('Property'), def('SpreadProperty'), def('SpreadElement'))]);
        def('TemplateElement').field('value', {
            'cooked': or(String, null),
            'raw': String
        });
        def('SpreadPropertyPattern').bases('Pattern').build('argument').field('argument', def('Pattern'));
        def('ObjectPattern').field('properties', [or(def('PropertyPattern'), def('Property'), def('RestElement'), def('SpreadPropertyPattern'))]);
    };
});