define(function () {
    'use strict';
    const Op = Object.prototype;
    const objToStr = Op.toString;
    const hasOwn = Op.hasOwnProperty;
    class BaseType {
        assert(value, deep) {
            if (!this.check(value, deep)) {
                var str = shallowStringify(value);
                throw new Error(str + ' does not match type ' + this);
            }
            return true;
        }
        arrayOf() {
            const elemType = this;
            return new ArrayType(elemType);
        }
    }
    class ArrayType extends BaseType {
        constructor(elemType) {
            super();
            this.elemType = elemType;
            this.kind = 'ArrayType';
        }
        toString() {
            return '[' + this.elemType + ']';
        }
        check(value, deep) {
            return Array.isArray(value) && value.every(elem => this.elemType.check(elem, deep));
        }
    }
    class IdentityType extends BaseType {
        constructor(value) {
            super();
            this.value = value;
            this.kind = 'IdentityType';
        }
        toString() {
            return String(this.value);
        }
        check(value, deep) {
            const result = value === this.value;
            if (!result && typeof deep === 'function') {
                deep(this, value);
            }
            return result;
        }
    }
    class ObjectType extends BaseType {
        constructor(fields) {
            super();
            this.fields = fields;
            this.kind = 'ObjectType';
        }
        toString() {
            return '{ ' + this.fields.join(', ') + ' }';
        }
        check(value, deep) {
            return objToStr.call(value) === objToStr.call({}) && this.fields.every(field => {
                return field.type.check(value[field.name], deep);
            });
        }
    }
    class OrType extends BaseType {
        constructor(types) {
            super();
            this.types = types;
            this.kind = 'OrType';
        }
        toString() {
            return this.types.join(' | ');
        }
        check(value, deep) {
            if (this.types.some(type => type.check(value, !!deep))) {
                return true;
            }
            if (typeof deep === 'function') {
                deep(this, value);
            }
            return false;
        }
    }
    class PredicateType extends BaseType {
        constructor(name, predicate) {
            super();
            this.name = name;
            this.predicate = predicate;
            this.kind = 'PredicateType';
        }
        toString() {
            return this.name;
        }
        check(value, deep) {
            const result = this.predicate(value, deep);
            if (!result && typeof deep === 'function') {
                deep(this, value);
            }
            return result;
        }
    }
    class Def {
        constructor(type, typeName) {
            this.type = type;
            this.typeName = typeName;
            this.baseNames = [];
            this.ownFields = Object.create(null);
            this.allSupertypes = Object.create(null);
            this.supertypeList = [];
            this.allFields = Object.create(null);
            this.fieldNames = [];
            this.finalized = false;
            this.buildable = false;
            this.buildParams = [];
        }
        isSupertypeOf(that) {
            if (that instanceof Def) {
                if (this.finalized !== true || that.finalized !== true) {
                    throw new Error('');
                }
                return hasOwn.call(that.allSupertypes, this.typeName);
            } else {
                throw new Error(that + ' is not a Def');
            }
        }
        checkAllFields(value, deep) {
            var allFields = this.allFields;
            if (this.finalized !== true) {
                throw new Error('' + this.typeName);
            }
            function checkFieldByName(name) {
                var field = allFields[name];
                var type = field.type;
                var child = field.getValue(value);
                return type.check(child, deep);
            }
            return value !== null && typeof value === 'object' && Object.keys(allFields).every(checkFieldByName);
        }
        bases(...supertypeNames) {
            var bases = this.baseNames;
            if (this.finalized) {
                if (supertypeNames.length !== bases.length) {
                    throw new Error('');
                }
                for (var i = 0; i < supertypeNames.length; i++) {
                    if (supertypeNames[i] !== bases[i]) {
                        throw new Error('');
                    }
                }
                return this;
            }
            supertypeNames.forEach(baseName => {
                if (bases.indexOf(baseName) < 0) {
                    bases.push(baseName);
                }
            });
            return this;
        }
    }
    class Field {
        constructor(name, type, defaultFn, hidden) {
            this.name = name;
            this.type = type;
            this.defaultFn = defaultFn;
            this.hidden = !!hidden;
        }
        toString() {
            return JSON.stringify(this.name) + ': ' + this.type;
        }
        getValue(obj) {
            var value = obj[this.name];
            if (typeof value !== 'undefined') {
                return value;
            }
            if (typeof this.defaultFn === 'function') {
                value = this.defaultFn.call(obj);
            }
            return value;
        }
    }
    function shallowStringify(value) {
        if (Array.isArray(value)) {
            return '[' + value.map(shallowStringify).join(', ') + ']';
        }
        if (value && typeof value === 'object') {
            return '{ ' + Object.keys(value).map(function (key) {
                return key + ': ' + value[key];
            }).join(', ') + ' }';
        }
        return JSON.stringify(value);
    }
    
    function typesPlugin(_fork) {
        const Type = {
            or(...types) {
                return new OrType(types.map(type => Type.from(type)));
            },
            from(value, name) {
                if (value instanceof ArrayType || value instanceof IdentityType || value instanceof ObjectType || value instanceof OrType || value instanceof PredicateType) {
                    return value;
                }
                if (value instanceof Def) {
                    return value.type;
                }
                if (isArray.check(value)) {
                    if (value.length !== 1) {
                        throw new Error('only one element type is permitted for typed arrays');
                    }
                    return new ArrayType(Type.from(value[0]));
                }
                if (isObject.check(value)) {
                    return new ObjectType(Object.keys(value).map(name => {
                        return new Field(name, Type.from(value[name], name));
                    }));
                }
                if (typeof value === 'function') {
                    var bicfIndex = builtInCtorFns.indexOf(value);
                    if (bicfIndex >= 0) {
                        return builtInCtorTypes[bicfIndex];
                    }
                    if (typeof name !== 'string') {
                        throw new Error('missing name');
                    }
                    return new PredicateType(name, value);
                }
                return new IdentityType(value);
            },
            def(typeName) {
                return hasOwn.call(defCache, typeName) ? defCache[typeName] : defCache[typeName] = new DefImpl(typeName);
            },
            hasDef(typeName) {
                return hasOwn.call(defCache, typeName);
            }
        };
        var builtInCtorFns = [];
        var builtInCtorTypes = [];
        function defBuiltInType(name, example) {
            const objStr = objToStr.call(example);
            const type = new PredicateType(name, value => objToStr.call(value) === objStr);
            if (example && typeof example.constructor === 'function') {
                builtInCtorFns.push(example.constructor);
                builtInCtorTypes.push(type);
            }
            return type;
        }
        const isString = defBuiltInType('string', 'truthy');
        const isFunction = defBuiltInType('function', function () {
        });
        const isArray = defBuiltInType('array', []);
        const isObject = defBuiltInType('object', {});
        const isRegExp = defBuiltInType('RegExp', /./);
        const isDate = defBuiltInType('Date', new Date());
        const isNumber = defBuiltInType('number', 3);
        const isBoolean = defBuiltInType('boolean', true);
        const isNull = defBuiltInType('null', null);
        const isUndefined = defBuiltInType('undefined', undefined);
        const isBigInt = typeof BigInt === 'function' ? defBuiltInType('BigInt', BigInt(1234)) : new PredicateType('BigInt', () => false);
        const builtInTypes = {
            string: isString,
            function: isFunction,
            array: isArray,
            object: isObject,
            RegExp: isRegExp,
            Date: isDate,
            number: isNumber,
            boolean: isBoolean,
            null: isNull,
            undefined: isUndefined,
            BigInt: isBigInt
        };
        var defCache = Object.create(null);
        function defFromValue(value) {
            if (value && typeof value === 'object') {
                var type = value.type;
                if (typeof type === 'string' && hasOwn.call(defCache, type)) {
                    var d = defCache[type];
                    if (d.finalized) {
                        return d;
                    }
                }
            }
            return null;
        }
        class DefImpl extends Def {
            constructor(typeName) {
                super(new PredicateType(typeName, (value, deep) => this.check(value, deep)), typeName);
            }
            check(value, deep) {
                if (this.finalized !== true) {
                    throw new Error('prematurely checking unfinalized type ' + this.typeName);
                }
                if (value === null || typeof value !== 'object') {
                    return false;
                }
                var vDef = defFromValue(value);
                if (!vDef) {
                    if (this.typeName === 'SourceLocation' || this.typeName === 'Position') {
                        return this.checkAllFields(value, deep);
                    }
                    return false;
                }
                if (deep && vDef === this) {
                    return this.checkAllFields(value, deep);
                }
                if (!this.isSupertypeOf(vDef)) {
                    return false;
                }
                if (!deep) {
                    return true;
                }
                return vDef.checkAllFields(value, deep) && this.checkAllFields(value, false);
            }
            build(...buildParams) {
                this.buildParams = buildParams;
                if (this.buildable) {
                    return this;
                }
                this.field('type', String, () => this.typeName);
                this.buildable = true;
                const addParam = (built, param, arg, isArgAvailable) => {
                    if (hasOwn.call(built, param))
                        return;
                    var all = this.allFields;
                    if (!hasOwn.call(all, param)) {
                        throw new Error('' + param);
                    }
                    var field = all[param];
                    var type = field.type;
                    var value;
                    if (isArgAvailable) {
                        value = arg;
                    } else if (field.defaultFn) {
                        value = field.defaultFn.call(built);
                    } else {
                        var message = 'no value or default function given for field ' + JSON.stringify(param) + ' of ' + this.typeName + '(' + this.buildParams.map(function (name) {
                            return all[name];
                        }).join(', ') + ')';
                        throw new Error(message);
                    }
                    if (!type.check(value)) {
                        throw new Error(shallowStringify(value) + ' does not match field ' + field + ' of type ' + this.typeName);
                    }
                    built[param] = value;
                };
                const builder = (...args) => {
                    var argc = args.length;
                    if (!this.finalized) {
                        throw new Error('attempting to instantiate unfinalized type ' + this.typeName);
                    }
                    var built = Object.create(nodePrototype);
                    this.buildParams.forEach(function (param, i) {
                        if (i < argc) {
                            addParam(built, param, args[i], true);
                        } else {
                            addParam(built, param, null, false);
                        }
                    });
                    Object.keys(this.allFields).forEach(function (param) {
                        addParam(built, param, null, false);
                    });
                    if (built.type !== this.typeName) {
                        throw new Error('');
                    }
                    return built;
                };
                builder.from = obj => {
                    if (!this.finalized) {
                        throw new Error('attempting to instantiate unfinalized type ' + this.typeName);
                    }
                    var built = Object.create(nodePrototype);
                    Object.keys(this.allFields).forEach(function (param) {
                        if (hasOwn.call(obj, param)) {
                            addParam(built, param, obj[param], true);
                        } else {
                            addParam(built, param, null, false);
                        }
                    });
                    if (built.type !== this.typeName) {
                        throw new Error('');
                    }
                    return built;
                };
                Object.defineProperty(builders, getBuilderName(this.typeName), {
                    enumerable: true,
                    value: builder
                });
                return this;
            }
            field(name, type, defaultFn, hidden) {
                if (this.finalized) {
                    console.error('Ignoring attempt to redefine field ' + JSON.stringify(name) + ' of finalized type ' + JSON.stringify(this.typeName));
                    return this;
                }
                this.ownFields[name] = new Field(name, Type.from(type), defaultFn, hidden);
                return this;
            }
            finalize() {
                if (!this.finalized) {
                    var allFields = this.allFields;
                    var allSupertypes = this.allSupertypes;
                    this.baseNames.forEach(name => {
                        var def = defCache[name];
                        if (def instanceof Def) {
                            def.finalize();
                            extend(allFields, def.allFields);
                            extend(allSupertypes, def.allSupertypes);
                        } else {
                            var message = 'unknown supertype name ' + JSON.stringify(name) + ' for subtype ' + JSON.stringify(this.typeName);
                            throw new Error(message);
                        }
                    });
                    extend(allFields, this.ownFields);
                    allSupertypes[this.typeName] = this;
                    this.fieldNames.length = 0;
                    for (var fieldName in allFields) {
                        if (hasOwn.call(allFields, fieldName) && !allFields[fieldName].hidden) {
                            this.fieldNames.push(fieldName);
                        }
                    }
                    Object.defineProperty(namedTypes, this.typeName, {
                        enumerable: true,
                        value: this.type
                    });
                    this.finalized = true;
                    populateSupertypeList(this.typeName, this.supertypeList);
                    if (this.buildable && this.supertypeList.lastIndexOf('Expression') >= 0) {
                        wrapExpressionBuilderWithStatement(this.typeName);
                    }
                }
            }
        }
        function getSupertypeNames(typeName) {
            if (!hasOwn.call(defCache, typeName)) {
                throw new Error('');
            }
            var d = defCache[typeName];
            if (d.finalized !== true) {
                throw new Error('');
            }
            return d.supertypeList.slice(1);
        }
        function computeSupertypeLookupTable(candidates) {
            var table = {};
            var typeNames = Object.keys(defCache);
            var typeNameCount = typeNames.length;
            for (var i = 0; i < typeNameCount; ++i) {
                var typeName = typeNames[i];
                var d = defCache[typeName];
                if (d.finalized !== true) {
                    throw new Error('' + typeName);
                }
                for (var j = 0; j < d.supertypeList.length; ++j) {
                    var superTypeName = d.supertypeList[j];
                    if (hasOwn.call(candidates, superTypeName)) {
                        table[typeName] = superTypeName;
                        break;
                    }
                }
            }
            return table;
        }
        var builders = Object.create(null);
        var nodePrototype = {};
        function defineMethod(name, func) {
            var old = nodePrototype[name];
            if (isUndefined.check(func)) {
                delete nodePrototype[name];
            } else {
                isFunction.assert(func);
                Object.defineProperty(nodePrototype, name, {
                    enumerable: true,
                    configurable: true,
                    value: func
                });
            }
            return old;
        }
        function getBuilderName(typeName) {
            return typeName.replace(/^[A-Z]+/, function (upperCasePrefix) {
                var len = upperCasePrefix.length;
                switch (len) {
                case 0:
                    return '';
                case 1:
                    return upperCasePrefix.toLowerCase();
                default:
                    return upperCasePrefix.slice(0, len - 1).toLowerCase() + upperCasePrefix.charAt(len - 1);
                }
            });
        }
        function getStatementBuilderName(typeName) {
            typeName = getBuilderName(typeName);
            return typeName.replace(/(Expression)?$/, 'Statement');
        }
        var namedTypes = {};
        function getFieldNames(object) {
            var d = defFromValue(object);
            if (d) {
                return d.fieldNames.slice(0);
            }
            if ('type' in object) {
                throw new Error('did not recognize object of type ' + JSON.stringify(object.type));
            }
            return Object.keys(object);
        }
        function getFieldValue(object, fieldName) {
            var d = defFromValue(object);
            if (d) {
                var field = d.allFields[fieldName];
                if (field) {
                    return field.getValue(object);
                }
            }
            return object && object[fieldName];
        }
        function eachField(object, callback, context) {
            getFieldNames(object).forEach(function (name) {
                callback.call(this, name, getFieldValue(object, name));
            }, context);
        }
        function someField(object, callback, context) {
            return getFieldNames(object).some(function (name) {
                return callback.call(this, name, getFieldValue(object, name));
            }, context);
        }
        function wrapExpressionBuilderWithStatement(typeName) {
            var wrapperName = getStatementBuilderName(typeName);
            if (builders[wrapperName])
                return;
            var wrapped = builders[getBuilderName(typeName)];
            if (!wrapped)
                return;
            const builder = function (...args) {
                return builders.expressionStatement(wrapped.apply(builders, args));
            };
            builder.from = function (...args) {
                return builders.expressionStatement(wrapped.from.apply(builders, args));
            };
            builders[wrapperName] = builder;
        }
        function populateSupertypeList(typeName, list) {
            list.length = 0;
            list.push(typeName);
            var lastSeen = Object.create(null);
            for (var pos = 0; pos < list.length; ++pos) {
                typeName = list[pos];
                var d = defCache[typeName];
                if (d.finalized !== true) {
                    throw new Error('');
                }
                if (hasOwn.call(lastSeen, typeName)) {
                    delete list[lastSeen[typeName]];
                }
                lastSeen[typeName] = pos;
                list.push.apply(list, d.baseNames);
            }
            for (var to = 0, from = to, len = list.length; from < len; ++from) {
                if (hasOwn.call(list, from)) {
                    list[to++] = list[from];
                }
            }
            list.length = to;
        }
        function extend(into, from) {
            Object.keys(from).forEach(function (name) {
                into[name] = from[name];
            });
            return into;
        }
        function finalize() {
            Object.keys(defCache).forEach(function (name) {
                defCache[name].finalize();
            });
        }
        return {
            Type,
            builtInTypes,
            getSupertypeNames,
            computeSupertypeLookupTable,
            builders,
            defineMethod,
            getBuilderName,
            getStatementBuilderName,
            namedTypes,
            getFieldNames,
            getFieldValue,
            eachField,
            someField,
            finalize,
        };
    };
    
    return typesPlugin;
});