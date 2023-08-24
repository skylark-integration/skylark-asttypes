define([
    './operators/es2020',
    './es2019',
    '../types',
    '../shared'
], function (es2020OpsDef, es2019Def, typesPlugin, sharedPlugin) {
    'use strict';
    return function (fork) {
        fork.use(es2020OpsDef);
        fork.use(es2019Def);
        const types = fork.use(typesPlugin);
        const def = types.Type.def;
        const or = types.Type.or;
        const shared = fork.use(sharedPlugin);
        const defaults = shared.defaults;
        def('ImportExpression').bases('Expression').build('source').field('source', def('Expression'));
        def('ExportAllDeclaration').bases('Declaration').build('source', 'exported').field('source', def('Literal')).field('exported', or(def('Identifier'), null, void 0), defaults['null']);
        def('ChainElement').bases('Node').field('optional', Boolean, defaults['false']);
        def('CallExpression').bases('Expression', 'ChainElement');
        def('MemberExpression').bases('Expression', 'ChainElement');
        def('ChainExpression').bases('Expression').build('expression').field('expression', def('ChainElement'));
        def('OptionalCallExpression').bases('CallExpression').build('callee', 'arguments', 'optional').field('optional', Boolean, defaults['true']);
        def('OptionalMemberExpression').bases('MemberExpression').build('object', 'property', 'computed', 'optional').field('optional', Boolean, defaults['true']);
    };
});