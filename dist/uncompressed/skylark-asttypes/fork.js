define([
    './types',
    './path-visitor',
    './equiv',
    './path',
    './node-path'
], function (typesPlugin, pathVisitorPlugin, equivPlugin, pathPlugin, nodePathPlugin) {
    'use strict';
    function createFork() {
        const used = [];
        const usedResult = [];
        function use(plugin) {
            var idx = used.indexOf(plugin);
            if (idx === -1) {
                idx = used.length;
                used.push(plugin);
                usedResult[idx] = plugin(fork);
            }
            return usedResult[idx];
        }
        var fork = { use };
        return fork;
    }
    return function (plugins) {
        const fork = createFork();
        const types = fork.use(typesPlugin);
        plugins.forEach(fork.use);
        types.finalize();
        const PathVisitor = fork.use(pathVisitorPlugin);
        return {
            Type: types.Type,
            builtInTypes: types.builtInTypes,
            namedTypes: types.namedTypes,
            builders: types.builders,
            defineMethod: types.defineMethod,
            getFieldNames: types.getFieldNames,
            getFieldValue: types.getFieldValue,
            eachField: types.eachField,
            someField: types.someField,
            getSupertypeNames: types.getSupertypeNames,
            getBuilderName: types.getBuilderName,
            astNodesAreEquivalent: fork.use(equivPlugin),
            finalize: types.finalize,
            Path: fork.use(pathPlugin),
            NodePath: fork.use(nodePathPlugin),
            PathVisitor,
            use: fork.use,
            visit: PathVisitor.visit
        };
    };
    ;

});