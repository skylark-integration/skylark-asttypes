define([
    './operators/core',
    '../types'
], function (coreOpsDef, typesPlugin) {
    'use strict';
    return function (fork) {
        var types = fork.use(typesPlugin);
        var Type = types.Type;
        var def = Type.def;
        var or = Type.or;
        var shared = fork.use(sharedPlugin);
        var defaults = shared.defaults;
        var geq = shared.geq;
        const {BinaryOperators, AssignmentOperators, LogicalOperators} = fork.use(coreOpsDef);
        def('Printable').field('loc', or(def('SourceLocation'), null), defaults['null'], true);
        def('Node').bases('Printable').field('type', String).field('comments', or([def('Comment')], null), defaults['null'], true);
        def('SourceLocation').field('start', def('Position')).field('end', def('Position')).field('source', or(String, null), defaults['null']);
        def('Position').field('line', geq(1)).field('column', geq(0));
        def('File').bases('Node').build('program', 'name').field('program', def('Program')).field('name', or(String, null), defaults['null']);
        def('Program').bases('Node').build('body').field('body', [def('Statement')]);
        def('Function').bases('Node').field('id', or(def('Identifier'), null), defaults['null']).field('params', [def('Pattern')]).field('body', def('BlockStatement')).field('generator', Boolean, defaults['false']).field('async', Boolean, defaults['false']);
        def('Statement').bases('Node');
        def('EmptyStatement').bases('Statement').build();
        def('BlockStatement').bases('Statement').build('body').field('body', [def('Statement')]);
        def('ExpressionStatement').bases('Statement').build('expression').field('expression', def('Expression'));
        def('IfStatement').bases('Statement').build('test', 'consequent', 'alternate').field('test', def('Expression')).field('consequent', def('Statement')).field('alternate', or(def('Statement'), null), defaults['null']);
        def('LabeledStatement').bases('Statement').build('label', 'body').field('label', def('Identifier')).field('body', def('Statement'));
        def('BreakStatement').bases('Statement').build('label').field('label', or(def('Identifier'), null), defaults['null']);
        def('ContinueStatement').bases('Statement').build('label').field('label', or(def('Identifier'), null), defaults['null']);
        def('WithStatement').bases('Statement').build('object', 'body').field('object', def('Expression')).field('body', def('Statement'));
        def('SwitchStatement').bases('Statement').build('discriminant', 'cases', 'lexical').field('discriminant', def('Expression')).field('cases', [def('SwitchCase')]).field('lexical', Boolean, defaults['false']);
        def('ReturnStatement').bases('Statement').build('argument').field('argument', or(def('Expression'), null));
        def('ThrowStatement').bases('Statement').build('argument').field('argument', def('Expression'));
        def('TryStatement').bases('Statement').build('block', 'handler', 'finalizer').field('block', def('BlockStatement')).field('handler', or(def('CatchClause'), null), function () {
            return this.handlers && this.handlers[0] || null;
        }).field('handlers', [def('CatchClause')], function () {
            return this.handler ? [this.handler] : [];
        }, true).field('guardedHandlers', [def('CatchClause')], defaults.emptyArray).field('finalizer', or(def('BlockStatement'), null), defaults['null']);
        def('CatchClause').bases('Node').build('param', 'guard', 'body').field('param', def('Pattern')).field('guard', or(def('Expression'), null), defaults['null']).field('body', def('BlockStatement'));
        def('WhileStatement').bases('Statement').build('test', 'body').field('test', def('Expression')).field('body', def('Statement'));
        def('DoWhileStatement').bases('Statement').build('body', 'test').field('body', def('Statement')).field('test', def('Expression'));
        def('ForStatement').bases('Statement').build('init', 'test', 'update', 'body').field('init', or(def('VariableDeclaration'), def('Expression'), null)).field('test', or(def('Expression'), null)).field('update', or(def('Expression'), null)).field('body', def('Statement'));
        def('ForInStatement').bases('Statement').build('left', 'right', 'body').field('left', or(def('VariableDeclaration'), def('Expression'))).field('right', def('Expression')).field('body', def('Statement'));
        def('DebuggerStatement').bases('Statement').build();
        def('Declaration').bases('Statement');
        def('FunctionDeclaration').bases('Function', 'Declaration').build('id', 'params', 'body').field('id', def('Identifier'));
        def('FunctionExpression').bases('Function', 'Expression').build('id', 'params', 'body');
        def('VariableDeclaration').bases('Declaration').build('kind', 'declarations').field('kind', or('var', 'let', 'const')).field('declarations', [def('VariableDeclarator')]);
        def('VariableDeclarator').bases('Node').build('id', 'init').field('id', def('Pattern')).field('init', or(def('Expression'), null), defaults['null']);
        def('Expression').bases('Node');
        def('ThisExpression').bases('Expression').build();
        def('ArrayExpression').bases('Expression').build('elements').field('elements', [or(def('Expression'), null)]);
        def('ObjectExpression').bases('Expression').build('properties').field('properties', [def('Property')]);
        def('Property').bases('Node').build('kind', 'key', 'value').field('kind', or('init', 'get', 'set')).field('key', or(def('Literal'), def('Identifier'))).field('value', def('Expression'));
        def('SequenceExpression').bases('Expression').build('expressions').field('expressions', [def('Expression')]);
        var UnaryOperator = or('-', '+', '!', '~', 'typeof', 'void', 'delete');
        def('UnaryExpression').bases('Expression').build('operator', 'argument', 'prefix').field('operator', UnaryOperator).field('argument', def('Expression')).field('prefix', Boolean, defaults['true']);
        const BinaryOperator = or(...BinaryOperators);
        def('BinaryExpression').bases('Expression').build('operator', 'left', 'right').field('operator', BinaryOperator).field('left', def('Expression')).field('right', def('Expression'));
        const AssignmentOperator = or(...AssignmentOperators);
        def('AssignmentExpression').bases('Expression').build('operator', 'left', 'right').field('operator', AssignmentOperator).field('left', or(def('Pattern'), def('MemberExpression'))).field('right', def('Expression'));
        var UpdateOperator = or('++', '--');
        def('UpdateExpression').bases('Expression').build('operator', 'argument', 'prefix').field('operator', UpdateOperator).field('argument', def('Expression')).field('prefix', Boolean);
        var LogicalOperator = or(...LogicalOperators);
        def('LogicalExpression').bases('Expression').build('operator', 'left', 'right').field('operator', LogicalOperator).field('left', def('Expression')).field('right', def('Expression'));
        def('ConditionalExpression').bases('Expression').build('test', 'consequent', 'alternate').field('test', def('Expression')).field('consequent', def('Expression')).field('alternate', def('Expression'));
        def('NewExpression').bases('Expression').build('callee', 'arguments').field('callee', def('Expression')).field('arguments', [def('Expression')]);
        def('CallExpression').bases('Expression').build('callee', 'arguments').field('callee', def('Expression')).field('arguments', [def('Expression')]);
        def('MemberExpression').bases('Expression').build('object', 'property', 'computed').field('object', def('Expression')).field('property', or(def('Identifier'), def('Expression'))).field('computed', Boolean, function () {
            var type = this.property.type;
            if (type === 'Literal' || type === 'MemberExpression' || type === 'BinaryExpression') {
                return true;
            }
            return false;
        });
        def('Pattern').bases('Node');
        def('SwitchCase').bases('Node').build('test', 'consequent').field('test', or(def('Expression'), null)).field('consequent', [def('Statement')]);
        def('Identifier').bases('Expression', 'Pattern').build('name').field('name', String).field('optional', Boolean, defaults['false']);
        def('Literal').bases('Expression').build('value').field('value', or(String, Boolean, null, Number, RegExp, BigInt));
        def('Comment').bases('Printable').field('value', String).field('leading', Boolean, defaults['true']).field('trailing', Boolean, defaults['false']);
    };
});