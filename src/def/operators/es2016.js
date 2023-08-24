define(['./core'], function (coreOpsDef) {
    'use strict';
    return function (fork) {
        const result = fork.use(coreOpsDef);
        if (result.BinaryOperators.indexOf('**') < 0) {
            result.BinaryOperators.push('**');
        }
        if (result.AssignmentOperators.indexOf('**=') < 0) {
            result.AssignmentOperators.push('**=');
        }
        return result;
    };
});