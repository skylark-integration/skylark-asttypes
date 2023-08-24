define([
    './es-proposals',
    '../types'
], function (esProposalsDef, typesPlugin) {
    'use strict';
    return function (fork) {
        fork.use(esProposalsDef);
        const types = fork.use(typesPlugin);
        const defaults = fork.use(sharedPlugin).defaults;
        const def = types.Type.def;
        const or = types.Type.or;
        const {undefined: isUndefined} = types.builtInTypes;
        def('Noop').bases('Statement').build();
        def('DoExpression').bases('Expression').build('body').field('body', [def('Statement')]);
        def('BindExpression').bases('Expression').build('object', 'callee').field('object', or(def('Expression'), null)).field('callee', def('Expression'));
        def('ParenthesizedExpression').bases('Expression').build('expression').field('expression', def('Expression'));
        def('ExportNamespaceSpecifier').bases('Specifier').build('exported').field('exported', def('Identifier'));
        def('ExportDefaultSpecifier').bases('Specifier').build('exported').field('exported', def('Identifier'));
        def('CommentBlock').bases('Comment').build('value', 'leading', 'trailing');
        def('CommentLine').bases('Comment').build('value', 'leading', 'trailing');
        def('Directive').bases('Node').build('value').field('value', def('DirectiveLiteral'));
        def('DirectiveLiteral').bases('Node', 'Expression').build('value').field('value', String, defaults['use strict']);
        def('InterpreterDirective').bases('Node').build('value').field('value', String);
        def('BlockStatement').bases('Statement').build('body').field('body', [def('Statement')]).field('directives', [def('Directive')], defaults.emptyArray);
        def('Program').bases('Node').build('body').field('body', [def('Statement')]).field('directives', [def('Directive')], defaults.emptyArray).field('interpreter', or(def('InterpreterDirective'), null), defaults['null']);
        function makeLiteralExtra(rawValueType = String, toRaw) {
            return [
                'extra',
                {
                    rawValue: rawValueType,
                    raw: String
                },
                function getDefault() {
                    const value = types.getFieldValue(this, 'value');
                    return {
                        rawValue: value,
                        raw: toRaw ? toRaw(value) : String(value)
                    };
                }
            ];
        }
        def('StringLiteral').bases('Literal').build('value').field('value', String).field(...makeLiteralExtra(String, val => JSON.stringify(val)));
        def('NumericLiteral').bases('Literal').build('value').field('value', Number).field('raw', or(String, null), defaults['null']).field(...makeLiteralExtra(Number));
        def('BigIntLiteral').bases('Literal').build('value').field('value', or(String, Number)).field(...makeLiteralExtra(String, val => val + 'n'));
        def('DecimalLiteral').bases('Literal').build('value').field('value', String).field(...makeLiteralExtra(String, val => val + 'm'));
        def('NullLiteral').bases('Literal').build().field('value', null, defaults['null']);
        def('BooleanLiteral').bases('Literal').build('value').field('value', Boolean);
        def('RegExpLiteral').bases('Literal').build('pattern', 'flags').field('pattern', String).field('flags', String).field('value', RegExp, function () {
            return new RegExp(this.pattern, this.flags);
        }).field(...makeLiteralExtra(or(RegExp, isUndefined), exp => `/${ exp.pattern }/${ exp.flags || '' }`)).field('regex', {
            pattern: String,
            flags: String
        }, function () {
            return {
                pattern: this.pattern,
                flags: this.flags
            };
        });
        var ObjectExpressionProperty = or(def('Property'), def('ObjectMethod'), def('ObjectProperty'), def('SpreadProperty'), def('SpreadElement'));
        def('ObjectExpression').bases('Expression').build('properties').field('properties', [ObjectExpressionProperty]);
        def('ObjectMethod').bases('Node', 'Function').build('kind', 'key', 'params', 'body', 'computed').field('kind', or('method', 'get', 'set')).field('key', or(def('Literal'), def('Identifier'), def('Expression'))).field('params', [def('Pattern')]).field('body', def('BlockStatement')).field('computed', Boolean, defaults['false']).field('generator', Boolean, defaults['false']).field('async', Boolean, defaults['false']).field('accessibility', or(def('Literal'), null), defaults['null']).field('decorators', or([def('Decorator')], null), defaults['null']);
        def('ObjectProperty').bases('Node').build('key', 'value').field('key', or(def('Literal'), def('Identifier'), def('Expression'))).field('value', or(def('Expression'), def('Pattern'))).field('accessibility', or(def('Literal'), null), defaults['null']).field('computed', Boolean, defaults['false']);
        var ClassBodyElement = or(def('MethodDefinition'), def('VariableDeclarator'), def('ClassPropertyDefinition'), def('ClassProperty'), def('ClassPrivateProperty'), def('ClassMethod'), def('ClassPrivateMethod'), def('ClassAccessorProperty'), def('StaticBlock'));
        def('ClassBody').bases('Declaration').build('body').field('body', [ClassBodyElement]);
        def('ClassMethod').bases('Declaration', 'Function').build('kind', 'key', 'params', 'body', 'computed', 'static').field('key', or(def('Literal'), def('Identifier'), def('Expression')));
        def('ClassPrivateMethod').bases('Declaration', 'Function').build('key', 'params', 'body', 'kind', 'computed', 'static').field('key', def('PrivateName'));
        def('ClassAccessorProperty').bases('Declaration').build('key', 'value', 'decorators', 'computed', 'static').field('key', or(def('Literal'), def('Identifier'), def('PrivateName'), def('Expression'))).field('value', or(def('Expression'), null), defaults['null']);
        [
            'ClassMethod',
            'ClassPrivateMethod'
        ].forEach(typeName => {
            def(typeName).field('kind', or('get', 'set', 'method', 'constructor'), () => 'method').field('body', def('BlockStatement')).field('access', or('public', 'private', 'protected', null), defaults['null']);
        });
        [
            'ClassMethod',
            'ClassPrivateMethod',
            'ClassAccessorProperty'
        ].forEach(typeName => {
            def(typeName).field('computed', Boolean, defaults['false']).field('static', Boolean, defaults['false']).field('abstract', Boolean, defaults['false']).field('accessibility', or('public', 'private', 'protected', null), defaults['null']).field('decorators', or([def('Decorator')], null), defaults['null']).field('definite', Boolean, defaults['false']).field('optional', Boolean, defaults['false']).field('override', Boolean, defaults['false']).field('readonly', Boolean, defaults['false']);
        });
        var ObjectPatternProperty = or(def('Property'), def('PropertyPattern'), def('SpreadPropertyPattern'), def('SpreadProperty'), def('ObjectProperty'), def('RestProperty'), def('RestElement'));
        def('ObjectPattern').bases('Pattern').build('properties').field('properties', [ObjectPatternProperty]).field('decorators', or([def('Decorator')], null), defaults['null']);
        def('SpreadProperty').bases('Node').build('argument').field('argument', def('Expression'));
        def('RestProperty').bases('Node').build('argument').field('argument', def('Expression'));
        def('ForAwaitStatement').bases('Statement').build('left', 'right', 'body').field('left', or(def('VariableDeclaration'), def('Expression'))).field('right', def('Expression')).field('body', def('Statement'));
        def('Import').bases('Expression').build();
    };
    ;
});