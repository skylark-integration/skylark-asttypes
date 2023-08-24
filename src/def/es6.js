define([
    './core',
    '../types',
    '../shared'
], function (coreDef, typesPlugin, sharedPlugin) {
    'use strict';
    return function (fork) {
        fork.use(coreDef);
        const types = fork.use(typesPlugin);
        const def = types.Type.def;
        const or = types.Type.or;
        const defaults = fork.use(sharedPlugin).defaults;
        def('Function').field('generator', Boolean, defaults['false']).field('expression', Boolean, defaults['false']).field('defaults', [or(def('Expression'), null)], defaults.emptyArray).field('rest', or(def('Identifier'), null), defaults['null']);
        def('RestElement').bases('Pattern').build('argument').field('argument', def('Pattern')).field('typeAnnotation', or(def('TypeAnnotation'), def('TSTypeAnnotation'), null), defaults['null']);
        def('SpreadElementPattern').bases('Pattern').build('argument').field('argument', def('Pattern'));
        def('FunctionDeclaration').build('id', 'params', 'body', 'generator', 'expression').field('id', or(def('Identifier'), null));
        def('FunctionExpression').build('id', 'params', 'body', 'generator', 'expression');
        def('ArrowFunctionExpression').bases('Function', 'Expression').build('params', 'body', 'expression').field('id', null, defaults['null']).field('body', or(def('BlockStatement'), def('Expression'))).field('generator', false, defaults['false']);
        def('ForOfStatement').bases('Statement').build('left', 'right', 'body').field('left', or(def('VariableDeclaration'), def('Pattern'))).field('right', def('Expression')).field('body', def('Statement'));
        def('YieldExpression').bases('Expression').build('argument', 'delegate').field('argument', or(def('Expression'), null)).field('delegate', Boolean, defaults['false']);
        def('GeneratorExpression').bases('Expression').build('body', 'blocks', 'filter').field('body', def('Expression')).field('blocks', [def('ComprehensionBlock')]).field('filter', or(def('Expression'), null));
        def('ComprehensionExpression').bases('Expression').build('body', 'blocks', 'filter').field('body', def('Expression')).field('blocks', [def('ComprehensionBlock')]).field('filter', or(def('Expression'), null));
        def('ComprehensionBlock').bases('Node').build('left', 'right', 'each').field('left', def('Pattern')).field('right', def('Expression')).field('each', Boolean);
        def('Property').field('key', or(def('Literal'), def('Identifier'), def('Expression'))).field('value', or(def('Expression'), def('Pattern'))).field('method', Boolean, defaults['false']).field('shorthand', Boolean, defaults['false']).field('computed', Boolean, defaults['false']);
        def('ObjectProperty').field('shorthand', Boolean, defaults['false']);
        def('PropertyPattern').bases('Pattern').build('key', 'pattern').field('key', or(def('Literal'), def('Identifier'), def('Expression'))).field('pattern', def('Pattern')).field('computed', Boolean, defaults['false']);
        def('ObjectPattern').bases('Pattern').build('properties').field('properties', [or(def('PropertyPattern'), def('Property'))]);
        def('ArrayPattern').bases('Pattern').build('elements').field('elements', [or(def('Pattern'), null)]);
        def('SpreadElement').bases('Node').build('argument').field('argument', def('Expression'));
        def('ArrayExpression').field('elements', [or(def('Expression'), def('SpreadElement'), def('RestElement'), null)]);
        def('NewExpression').field('arguments', [or(def('Expression'), def('SpreadElement'))]);
        def('CallExpression').field('arguments', [or(def('Expression'), def('SpreadElement'))]);
        def('AssignmentPattern').bases('Pattern').build('left', 'right').field('left', def('Pattern')).field('right', def('Expression'));
        def('MethodDefinition').bases('Declaration').build('kind', 'key', 'value', 'static').field('kind', or('constructor', 'method', 'get', 'set')).field('key', def('Expression')).field('value', def('Function')).field('computed', Boolean, defaults['false']).field('static', Boolean, defaults['false']);
        const ClassBodyElement = or(def('MethodDefinition'), def('VariableDeclarator'), def('ClassPropertyDefinition'), def('ClassProperty'), def('StaticBlock'));
        def('ClassProperty').bases('Declaration').build('key').field('key', or(def('Literal'), def('Identifier'), def('Expression'))).field('computed', Boolean, defaults['false']);
        def('ClassPropertyDefinition').bases('Declaration').build('definition').field('definition', ClassBodyElement);
        def('ClassBody').bases('Declaration').build('body').field('body', [ClassBodyElement]);
        def('ClassDeclaration').bases('Declaration').build('id', 'body', 'superClass').field('id', or(def('Identifier'), null)).field('body', def('ClassBody')).field('superClass', or(def('Expression'), null), defaults['null']);
        def('ClassExpression').bases('Expression').build('id', 'body', 'superClass').field('id', or(def('Identifier'), null), defaults['null']).field('body', def('ClassBody')).field('superClass', or(def('Expression'), null), defaults['null']);
        def('Super').bases('Expression').build();
        def('Specifier').bases('Node');
        def('ModuleSpecifier').bases('Specifier').field('local', or(def('Identifier'), null), defaults['null']).field('id', or(def('Identifier'), null), defaults['null']).field('name', or(def('Identifier'), null), defaults['null']);
        def('ImportSpecifier').bases('ModuleSpecifier').build('imported', 'local').field('imported', def('Identifier'));
        def('ImportDefaultSpecifier').bases('ModuleSpecifier').build('local');
        def('ImportNamespaceSpecifier').bases('ModuleSpecifier').build('local');
        def('ImportDeclaration').bases('Declaration').build('specifiers', 'source', 'importKind').field('specifiers', [or(def('ImportSpecifier'), def('ImportNamespaceSpecifier'), def('ImportDefaultSpecifier'))], defaults.emptyArray).field('source', def('Literal')).field('importKind', or('value', 'type'), function () {
            return 'value';
        });
        def('ExportNamedDeclaration').bases('Declaration').build('declaration', 'specifiers', 'source').field('declaration', or(def('Declaration'), null)).field('specifiers', [def('ExportSpecifier')], defaults.emptyArray).field('source', or(def('Literal'), null), defaults['null']);
        def('ExportSpecifier').bases('ModuleSpecifier').build('local', 'exported').field('exported', def('Identifier'));
        def('ExportDefaultDeclaration').bases('Declaration').build('declaration').field('declaration', or(def('Declaration'), def('Expression')));
        def('ExportAllDeclaration').bases('Declaration').build('source').field('source', def('Literal'));
        def('TaggedTemplateExpression').bases('Expression').build('tag', 'quasi').field('tag', def('Expression')).field('quasi', def('TemplateLiteral'));
        def('TemplateLiteral').bases('Expression').build('quasis', 'expressions').field('quasis', [def('TemplateElement')]).field('expressions', [def('Expression')]);
        def('TemplateElement').bases('Node').build('value', 'tail').field('value', {
            'cooked': String,
            'raw': String
        }).field('tail', Boolean);
        def('MetaProperty').bases('Expression').build('meta', 'property').field('meta', def('Identifier')).field('property', def('Identifier'));
    };
});