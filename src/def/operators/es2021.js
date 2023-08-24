define(['./es2020'], function (es2020OpsDef) {
    'use strict';
    return function (fork) {
        const result = fork.use(es2020OpsDef);
        result.LogicalOperators.forEach(op => {
            const assignOp = op + '=';
            if (result.AssignmentOperators.indexOf(assignOp) < 0) {
                result.AssignmentOperators.push(assignOp);
            }
        });
        return result;
    };
});