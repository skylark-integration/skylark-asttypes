define(['./types'], function (typesPlugin) {
    'use strict';
    return function (fork) {
        var types = fork.use(typesPlugin);
        var Type = types.Type;
        var builtin = types.builtInTypes;
        var isNumber = builtin.number;
        function geq(than) {
            return Type.from(value => isNumber.check(value) && value >= than, isNumber + ' >= ' + than);
        }
        ;
        const defaults = {
            'null': function () {
                return null;
            },
            'emptyArray': function () {
                return [];
            },
            'false': function () {
                return false;
            },
            'true': function () {
                return true;
            },
            'undefined': function () {
            },
            'use strict': function () {
                return 'use strict';
            }
        };
        var naiveIsPrimitive = Type.or(builtin.string, builtin.number, builtin.boolean, builtin.null, builtin.undefined);
        const isPrimitive = Type.from(value => {
            if (value === null)
                return true;
            var type = typeof value;
            if (type === 'object' || type === 'function') {
                return false;
            }
            return true;
        }, naiveIsPrimitive.toString());
        return {
            geq,
            defaults,
            isPrimitive
        };
    };

});