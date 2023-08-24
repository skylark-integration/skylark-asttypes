define([
    './es-proposals',
    '../types',
    '../shared'
], function (esProposalsDef, typesPlugin, sharedPlugin) {
    'use strict';
    return function (fork) {
        fork.use(esProposalsDef);
        const types = fork.use(typesPlugin);
        const def = types.Type.def;
        const or = types.Type.or;
        const defaults = fork.use(sharedPlugin).defaults;
        def('JSXAttribute').bases('Node').build('name', 'value').field('name', or(def('JSXIdentifier'), def('JSXNamespacedName'))).field('value', or(def('Literal'), def('JSXExpressionContainer'), def('JSXElement'), def('JSXFragment'), null), defaults['null']);
        def('JSXIdentifier').bases('Identifier').build('name').field('name', String);
        def('JSXNamespacedName').bases('Node').build('namespace', 'name').field('namespace', def('JSXIdentifier')).field('name', def('JSXIdentifier'));
        def('JSXMemberExpression').bases('MemberExpression').build('object', 'property').field('object', or(def('JSXIdentifier'), def('JSXMemberExpression'))).field('property', def('JSXIdentifier')).field('computed', Boolean, defaults.false);
        const JSXElementName = or(def('JSXIdentifier'), def('JSXNamespacedName'), def('JSXMemberExpression'));
        def('JSXSpreadAttribute').bases('Node').build('argument').field('argument', def('Expression'));
        const JSXAttributes = [or(def('JSXAttribute'), def('JSXSpreadAttribute'))];
        def('JSXExpressionContainer').bases('Expression').build('expression').field('expression', or(def('Expression'), def('JSXEmptyExpression')));
        const JSXChildren = [or(def('JSXText'), def('JSXExpressionContainer'), def('JSXSpreadChild'), def('JSXElement'), def('JSXFragment'), def('Literal'))];
        def('JSXElement').bases('Expression').build('openingElement', 'closingElement', 'children').field('openingElement', def('JSXOpeningElement')).field('closingElement', or(def('JSXClosingElement'), null), defaults['null']).field('children', JSXChildren, defaults.emptyArray).field('name', JSXElementName, function () {
            return this.openingElement.name;
        }, true).field('selfClosing', Boolean, function () {
            return this.openingElement.selfClosing;
        }, true).field('attributes', JSXAttributes, function () {
            return this.openingElement.attributes;
        }, true);
        def('JSXOpeningElement').bases('Node').build('name', 'attributes', 'selfClosing').field('name', JSXElementName).field('attributes', JSXAttributes, defaults.emptyArray).field('selfClosing', Boolean, defaults['false']);
        def('JSXClosingElement').bases('Node').build('name').field('name', JSXElementName);
        def('JSXFragment').bases('Expression').build('openingFragment', 'closingFragment', 'children').field('openingFragment', def('JSXOpeningFragment')).field('closingFragment', def('JSXClosingFragment')).field('children', JSXChildren, defaults.emptyArray);
        def('JSXOpeningFragment').bases('Node').build();
        def('JSXClosingFragment').bases('Node').build();
        def('JSXText').bases('Literal').build('value', 'raw').field('value', String).field('raw', String, function () {
            return this.value;
        });
        def('JSXEmptyExpression').bases('Node').build();
        def('JSXSpreadChild').bases('Node').build('expression').field('expression', def('Expression'));
    };
});