define(function () {
    'use strict';
    return function () {
        return {
            BinaryOperators: [
                '==',
                '!=',
                '===',
                '!==',
                '<',
                '<=',
                '>',
                '>=',
                '<<',
                '>>',
                '>>>',
                '+',
                '-',
                '*',
                '/',
                '%',
                '&',
                '|',
                '^',
                'in',
                'instanceof'
            ],
            AssignmentOperators: [
                '=',
                '+=',
                '-=',
                '*=',
                '/=',
                '%=',
                '<<=',
                '>>=',
                '>>>=',
                '|=',
                '^=',
                '&='
            ],
            LogicalOperators: [
                '||',
                '&&'
            ]
        };
    };
});