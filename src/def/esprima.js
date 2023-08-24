define([
    './es-proposals',
    '../types',
    '../shared'
], function (esProposalsDef, typesPlugin, sharedPlugin) {
    'use strict';
    return function (fork) {
        fork.use(esProposalsDef);
        var types = fork.use(typesPlugin);
        var defaults = fork.use(sharedPlugin).defaults;
        var def = types.Type.def;
        var or = types.Type.or;
        def('VariableDeclaration').field('declarations', [or(def('VariableDeclarator'), def('Identifier'))]);
        def('Property').field('value', or(def('Expression'), def('Pattern')));
        def('ArrayPattern').field('elements', [or(def('Pattern'), def('SpreadElement'), null)]);
        def('ObjectPattern').field('properties', [or(def('Property'), def('PropertyPattern'), def('SpreadPropertyPattern'), def('SpreadProperty'))]);
        def('ExportSpecifier').bases('ModuleSpecifier').build('id', 'name');
        def('ExportBatchSpecifier').bases('Specifier').build();
        def('ExportDeclaration').bases('Declaration').build('default', 'declaration', 'specifiers', 'source').field('default', Boolean).field('declaration', or(def('Declaration'), def('Expression'), null)).field('specifiers', [or(def('ExportSpecifier'), def('ExportBatchSpecifier'))], defaults.emptyArray).field('source', or(def('Literal'), null), defaults['null']);
        def('Block').bases('Comment').build('value', 'leading', 'trailing');
        def('Line').bases('Comment').build('value', 'leading', 'trailing');
    };
});