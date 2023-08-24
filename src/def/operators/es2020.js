define(['./es2016'], function (es2016OpsDef) {
    'use strict';
    return function (fork) {
        const result = fork.use(es2016OpsDef);
        if (result.LogicalOperators.indexOf('??') < 0) {
            result.LogicalOperators.push('??');
        }
        return result;
    };
});