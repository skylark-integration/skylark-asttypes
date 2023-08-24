/**
 * skylark-asttypes - A version of asttypes that ported to running on skylarkjs.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
(function(factory,globals) {
  var define = globals.define,
      require = globals.require,
      isAmd = (typeof define === 'function' && define.amd),
      isCmd = (!isAmd && typeof exports !== 'undefined');

  if (!isAmd && !define) {
    var map = {};
    function absolute(relative, base) {
        if (relative[0]!==".") {
          return relative;
        }
        var stack = base.split("/"),
            parts = relative.split("/");
        stack.pop(); 
        for (var i=0; i<parts.length; i++) {
            if (parts[i] == ".")
                continue;
            if (parts[i] == "..")
                stack.pop();
            else
                stack.push(parts[i]);
        }
        return stack.join("/");
    }
    define = globals.define = function(id, deps, factory) {
        if (typeof factory == 'function') {
            map[id] = {
                factory: factory,
                deps: deps.map(function(dep){
                  return absolute(dep,id);
                }),
                resolved: false,
                exports: null
            };
            require(id);
        } else {
            map[id] = {
                factory : null,
                resolved : true,
                exports : factory
            };
        }
    };
    require = globals.require = function(id) {
        if (!map.hasOwnProperty(id)) {
            throw new Error('Module ' + id + ' has not been defined');
        }
        var module = map[id];
        if (!module.resolved) {
            var args = [];

            module.deps.forEach(function(dep){
                args.push(require(dep));
            })

            module.exports = module.factory.apply(globals, args) || null;
            module.resolved = true;
        }
        return module.exports;
    };
  }
  
  if (!define) {
     throw new Error("The module utility (ex: requirejs or skylark-utils) is not loaded!");
  }

  factory(define,require);

  if (!isAmd) {
    var skylarkjs = require("skylark-langx-ns");

    if (isCmd) {
      module.exports = skylarkjs;
    } else {
      globals.skylarkjs  = skylarkjs;
    }
  }

})(function(define,require) {

define('skylark-asttypes/types',[],function () {
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
define('skylark-asttypes/path',['./types'], function (typesPlugin) {
    'use strict';
    var Op = Object.prototype;
    var hasOwn = Op.hasOwnProperty;
    return function pathPlugin(fork) {
        var types = fork.use(typesPlugin);
        var isArray = types.builtInTypes.array;
        var isNumber = types.builtInTypes.number;
        const Path = function Path(value, parentPath, name) {
            if (!(this instanceof Path)) {
                throw new Error("Path constructor cannot be invoked without 'new'");
            }
            if (parentPath) {
                if (!(parentPath instanceof Path)) {
                    throw new Error('');
                }
            } else {
                parentPath = null;
                name = null;
            }
            this.value = value;
            this.parentPath = parentPath;
            this.name = name;
            this.__childCache = null;
        };
        var Pp = Path.prototype;
        function getChildCache(path) {
            return path.__childCache || (path.__childCache = Object.create(null));
        }
        function getChildPath(path, name) {
            var cache = getChildCache(path);
            var actualChildValue = path.getValueProperty(name);
            var childPath = cache[name];
            if (!hasOwn.call(cache, name) || childPath.value !== actualChildValue) {
                childPath = cache[name] = new path.constructor(actualChildValue, path, name);
            }
            return childPath;
        }
        Pp.getValueProperty = function getValueProperty(name) {
            return this.value[name];
        };
        Pp.get = function get(...names) {
            var path = this;
            var count = names.length;
            for (var i = 0; i < count; ++i) {
                path = getChildPath(path, names[i]);
            }
            return path;
        };
        Pp.each = function each(callback, context) {
            var childPaths = [];
            var len = this.value.length;
            var i = 0;
            for (var i = 0; i < len; ++i) {
                if (hasOwn.call(this.value, i)) {
                    childPaths[i] = this.get(i);
                }
            }
            context = context || this;
            for (i = 0; i < len; ++i) {
                if (hasOwn.call(childPaths, i)) {
                    callback.call(context, childPaths[i]);
                }
            }
        };
        Pp.map = function map(callback, context) {
            var result = [];
            this.each(function (childPath) {
                result.push(callback.call(this, childPath));
            }, context);
            return result;
        };
        Pp.filter = function filter(callback, context) {
            var result = [];
            this.each(function (childPath) {
                if (callback.call(this, childPath)) {
                    result.push(childPath);
                }
            }, context);
            return result;
        };
        function emptyMoves() {
        }
        function getMoves(path, offset, start, end) {
            isArray.assert(path.value);
            if (offset === 0) {
                return emptyMoves;
            }
            var length = path.value.length;
            if (length < 1) {
                return emptyMoves;
            }
            var argc = arguments.length;
            if (argc === 2) {
                start = 0;
                end = length;
            } else if (argc === 3) {
                start = Math.max(start, 0);
                end = length;
            } else {
                start = Math.max(start, 0);
                end = Math.min(end, length);
            }
            isNumber.assert(start);
            isNumber.assert(end);
            var moves = Object.create(null);
            var cache = getChildCache(path);
            for (var i = start; i < end; ++i) {
                if (hasOwn.call(path.value, i)) {
                    var childPath = path.get(i);
                    if (childPath.name !== i) {
                        throw new Error('');
                    }
                    var newIndex = i + offset;
                    childPath.name = newIndex;
                    moves[newIndex] = childPath;
                    delete cache[i];
                }
            }
            delete cache.length;
            return function () {
                for (var newIndex in moves) {
                    var childPath = moves[newIndex];
                    if (childPath.name !== +newIndex) {
                        throw new Error('');
                    }
                    cache[newIndex] = childPath;
                    path.value[newIndex] = childPath.value;
                }
            };
        }
        Pp.shift = function shift() {
            var move = getMoves(this, -1);
            var result = this.value.shift();
            move();
            return result;
        };
        Pp.unshift = function unshift(...args) {
            var move = getMoves(this, args.length);
            var result = this.value.unshift.apply(this.value, args);
            move();
            return result;
        };
        Pp.push = function push(...args) {
            isArray.assert(this.value);
            delete getChildCache(this).length;
            return this.value.push.apply(this.value, args);
        };
        Pp.pop = function pop() {
            isArray.assert(this.value);
            var cache = getChildCache(this);
            delete cache[this.value.length - 1];
            delete cache.length;
            return this.value.pop();
        };
        Pp.insertAt = function insertAt(index) {
            var argc = arguments.length;
            var move = getMoves(this, argc - 1, index);
            if (move === emptyMoves && argc <= 1) {
                return this;
            }
            index = Math.max(index, 0);
            for (var i = 1; i < argc; ++i) {
                this.value[index + i - 1] = arguments[i];
            }
            move();
            return this;
        };
        Pp.insertBefore = function insertBefore(...args) {
            var pp = this.parentPath;
            var argc = args.length;
            var insertAtArgs = [this.name];
            for (var i = 0; i < argc; ++i) {
                insertAtArgs.push(args[i]);
            }
            return pp.insertAt.apply(pp, insertAtArgs);
        };
        Pp.insertAfter = function insertAfter(...args) {
            var pp = this.parentPath;
            var argc = args.length;
            var insertAtArgs = [this.name + 1];
            for (var i = 0; i < argc; ++i) {
                insertAtArgs.push(args[i]);
            }
            return pp.insertAt.apply(pp, insertAtArgs);
        };
        function repairRelationshipWithParent(path) {
            if (!(path instanceof Path)) {
                throw new Error('');
            }
            var pp = path.parentPath;
            if (!pp) {
                return path;
            }
            var parentValue = pp.value;
            var parentCache = getChildCache(pp);
            if (parentValue[path.name] === path.value) {
                parentCache[path.name] = path;
            } else if (isArray.check(parentValue)) {
                var i = parentValue.indexOf(path.value);
                if (i >= 0) {
                    parentCache[path.name = i] = path;
                }
            } else {
                parentValue[path.name] = path.value;
                parentCache[path.name] = path;
            }
            if (parentValue[path.name] !== path.value) {
                throw new Error('');
            }
            if (path.parentPath.get(path.name) !== path) {
                throw new Error('');
            }
            return path;
        }
        Pp.replace = function replace(replacement) {
            var results = [];
            var parentValue = this.parentPath.value;
            var parentCache = getChildCache(this.parentPath);
            var count = arguments.length;
            repairRelationshipWithParent(this);
            if (isArray.check(parentValue)) {
                var originalLength = parentValue.length;
                var move = getMoves(this.parentPath, count - 1, this.name + 1);
                var spliceArgs = [
                    this.name,
                    1
                ];
                for (var i = 0; i < count; ++i) {
                    spliceArgs.push(arguments[i]);
                }
                var splicedOut = parentValue.splice.apply(parentValue, spliceArgs);
                if (splicedOut[0] !== this.value) {
                    throw new Error('');
                }
                if (parentValue.length !== originalLength - 1 + count) {
                    throw new Error('');
                }
                move();
                if (count === 0) {
                    delete this.value;
                    delete parentCache[this.name];
                    this.__childCache = null;
                } else {
                    if (parentValue[this.name] !== replacement) {
                        throw new Error('');
                    }
                    if (this.value !== replacement) {
                        this.value = replacement;
                        this.__childCache = null;
                    }
                    for (i = 0; i < count; ++i) {
                        results.push(this.parentPath.get(this.name + i));
                    }
                    if (results[0] !== this) {
                        throw new Error('');
                    }
                }
            } else if (count === 1) {
                if (this.value !== replacement) {
                    this.__childCache = null;
                }
                this.value = parentValue[this.name] = replacement;
                results.push(this);
            } else if (count === 0) {
                delete parentValue[this.name];
                delete this.value;
                this.__childCache = null;
            } else {
                throw new Error('Could not replace path');
            }
            return results;
        };
        return Path;
    };
});
define('skylark-asttypes/scope',['./types'], function (typesPlugin) {
    'use strict';
    var hasOwn = Object.prototype.hasOwnProperty;
    return function scopePlugin(fork) {
        var types = fork.use(typesPlugin);
        var Type = types.Type;
        var namedTypes = types.namedTypes;
        var Node = namedTypes.Node;
        var Expression = namedTypes.Expression;
        var isArray = types.builtInTypes.array;
        var b = types.builders;
        const Scope = function Scope(path, parentScope) {
            if (!(this instanceof Scope)) {
                throw new Error("Scope constructor cannot be invoked without 'new'");
            }
            if (!TypeParameterScopeType.check(path.value)) {
                ScopeType.assert(path.value);
            }
            var depth;
            if (parentScope) {
                if (!(parentScope instanceof Scope)) {
                    throw new Error('');
                }
                depth = parentScope.depth + 1;
            } else {
                parentScope = null;
                depth = 0;
            }
            Object.defineProperties(this, {
                path: { value: path },
                node: { value: path.value },
                isGlobal: {
                    value: !parentScope,
                    enumerable: true
                },
                depth: { value: depth },
                parent: { value: parentScope },
                bindings: { value: {} },
                types: { value: {} }
            });
        };
        var ScopeType = Type.or(namedTypes.Program, namedTypes.Function, namedTypes.CatchClause);
        var TypeParameterScopeType = Type.or(namedTypes.Function, namedTypes.ClassDeclaration, namedTypes.ClassExpression, namedTypes.InterfaceDeclaration, namedTypes.TSInterfaceDeclaration, namedTypes.TypeAlias, namedTypes.TSTypeAliasDeclaration);
        var FlowOrTSTypeParameterType = Type.or(namedTypes.TypeParameter, namedTypes.TSTypeParameter);
        Scope.isEstablishedBy = function (node) {
            return ScopeType.check(node) || TypeParameterScopeType.check(node);
        };
        var Sp = Scope.prototype;
        Sp.didScan = false;
        Sp.declares = function (name) {
            this.scan();
            return hasOwn.call(this.bindings, name);
        };
        Sp.declaresType = function (name) {
            this.scan();
            return hasOwn.call(this.types, name);
        };
        Sp.declareTemporary = function (prefix) {
            if (prefix) {
                if (!/^[a-z$_]/i.test(prefix)) {
                    throw new Error('');
                }
            } else {
                prefix = 't$';
            }
            prefix += this.depth.toString(36) + '$';
            this.scan();
            var index = 0;
            while (this.declares(prefix + index)) {
                ++index;
            }
            var name = prefix + index;
            return this.bindings[name] = types.builders.identifier(name);
        };
        Sp.injectTemporary = function (identifier, init) {
            identifier || (identifier = this.declareTemporary());
            var bodyPath = this.path.get('body');
            if (namedTypes.BlockStatement.check(bodyPath.value)) {
                bodyPath = bodyPath.get('body');
            }
            bodyPath.unshift(b.variableDeclaration('var', [b.variableDeclarator(identifier, init || null)]));
            return identifier;
        };
        Sp.scan = function (force) {
            if (force || !this.didScan) {
                for (var name in this.bindings) {
                    delete this.bindings[name];
                }
                for (var name in this.types) {
                    delete this.types[name];
                }
                scanScope(this.path, this.bindings, this.types);
                this.didScan = true;
            }
        };
        Sp.getBindings = function () {
            this.scan();
            return this.bindings;
        };
        Sp.getTypes = function () {
            this.scan();
            return this.types;
        };
        function scanScope(path, bindings, scopeTypes) {
            var node = path.value;
            if (TypeParameterScopeType.check(node)) {
                const params = path.get('typeParameters', 'params');
                if (isArray.check(params.value)) {
                    params.each(childPath => {
                        addTypeParameter(childPath, scopeTypes);
                    });
                }
            }
            if (ScopeType.check(node)) {
                if (namedTypes.CatchClause.check(node)) {
                    addPattern(path.get('param'), bindings);
                } else {
                    recursiveScanScope(path, bindings, scopeTypes);
                }
            }
        }
        function recursiveScanScope(path, bindings, scopeTypes) {
            var node = path.value;
            if (path.parent && namedTypes.FunctionExpression.check(path.parent.node) && path.parent.node.id) {
                addPattern(path.parent.get('id'), bindings);
            }
            if (!node) {
            } else if (isArray.check(node)) {
                path.each(childPath => {
                    recursiveScanChild(childPath, bindings, scopeTypes);
                });
            } else if (namedTypes.Function.check(node)) {
                path.get('params').each(paramPath => {
                    addPattern(paramPath, bindings);
                });
                recursiveScanChild(path.get('body'), bindings, scopeTypes);
                recursiveScanScope(path.get('typeParameters'), bindings, scopeTypes);
            } else if (namedTypes.TypeAlias && namedTypes.TypeAlias.check(node) || namedTypes.InterfaceDeclaration && namedTypes.InterfaceDeclaration.check(node) || namedTypes.TSTypeAliasDeclaration && namedTypes.TSTypeAliasDeclaration.check(node) || namedTypes.TSInterfaceDeclaration && namedTypes.TSInterfaceDeclaration.check(node)) {
                addTypePattern(path.get('id'), scopeTypes);
            } else if (namedTypes.VariableDeclarator.check(node)) {
                addPattern(path.get('id'), bindings);
                recursiveScanChild(path.get('init'), bindings, scopeTypes);
            } else if (node.type === 'ImportSpecifier' || node.type === 'ImportNamespaceSpecifier' || node.type === 'ImportDefaultSpecifier') {
                addPattern(path.get(node.local ? 'local' : node.name ? 'name' : 'id'), bindings);
            } else if (Node.check(node) && !Expression.check(node)) {
                types.eachField(node, function (name, child) {
                    var childPath = path.get(name);
                    if (!pathHasValue(childPath, child)) {
                        throw new Error('');
                    }
                    recursiveScanChild(childPath, bindings, scopeTypes);
                });
            }
        }
        function pathHasValue(path, value) {
            if (path.value === value) {
                return true;
            }
            if (Array.isArray(path.value) && path.value.length === 0 && Array.isArray(value) && value.length === 0) {
                return true;
            }
            return false;
        }
        function recursiveScanChild(path, bindings, scopeTypes) {
            var node = path.value;
            if (!node || Expression.check(node)) {
            } else if (namedTypes.FunctionDeclaration.check(node) && node.id !== null) {
                addPattern(path.get('id'), bindings);
            } else if (namedTypes.ClassDeclaration && namedTypes.ClassDeclaration.check(node) && node.id !== null) {
                addPattern(path.get('id'), bindings);
                recursiveScanScope(path.get('typeParameters'), bindings, scopeTypes);
            } else if (namedTypes.InterfaceDeclaration && namedTypes.InterfaceDeclaration.check(node) || namedTypes.TSInterfaceDeclaration && namedTypes.TSInterfaceDeclaration.check(node)) {
                addTypePattern(path.get('id'), scopeTypes);
            } else if (ScopeType.check(node)) {
                if (namedTypes.CatchClause.check(node) && namedTypes.Identifier.check(node.param)) {
                    var catchParamName = node.param.name;
                    var hadBinding = hasOwn.call(bindings, catchParamName);
                    recursiveScanScope(path.get('body'), bindings, scopeTypes);
                    if (!hadBinding) {
                        delete bindings[catchParamName];
                    }
                }
            } else {
                recursiveScanScope(path, bindings, scopeTypes);
            }
        }
        function addPattern(patternPath, bindings) {
            var pattern = patternPath.value;
            namedTypes.Pattern.assert(pattern);
            if (namedTypes.Identifier.check(pattern)) {
                if (hasOwn.call(bindings, pattern.name)) {
                    bindings[pattern.name].push(patternPath);
                } else {
                    bindings[pattern.name] = [patternPath];
                }
            } else if (namedTypes.AssignmentPattern && namedTypes.AssignmentPattern.check(pattern)) {
                addPattern(patternPath.get('left'), bindings);
            } else if (namedTypes.ObjectPattern && namedTypes.ObjectPattern.check(pattern)) {
                patternPath.get('properties').each(function (propertyPath) {
                    var property = propertyPath.value;
                    if (namedTypes.Pattern.check(property)) {
                        addPattern(propertyPath, bindings);
                    } else if (namedTypes.Property.check(property) || namedTypes.ObjectProperty && namedTypes.ObjectProperty.check(property)) {
                        addPattern(propertyPath.get('value'), bindings);
                    } else if (namedTypes.SpreadProperty && namedTypes.SpreadProperty.check(property)) {
                        addPattern(propertyPath.get('argument'), bindings);
                    }
                });
            } else if (namedTypes.ArrayPattern && namedTypes.ArrayPattern.check(pattern)) {
                patternPath.get('elements').each(function (elementPath) {
                    var element = elementPath.value;
                    if (namedTypes.Pattern.check(element)) {
                        addPattern(elementPath, bindings);
                    } else if (namedTypes.SpreadElement && namedTypes.SpreadElement.check(element)) {
                        addPattern(elementPath.get('argument'), bindings);
                    }
                });
            } else if (namedTypes.PropertyPattern && namedTypes.PropertyPattern.check(pattern)) {
                addPattern(patternPath.get('pattern'), bindings);
            } else if (namedTypes.SpreadElementPattern && namedTypes.SpreadElementPattern.check(pattern) || namedTypes.RestElement && namedTypes.RestElement.check(pattern) || namedTypes.SpreadPropertyPattern && namedTypes.SpreadPropertyPattern.check(pattern)) {
                addPattern(patternPath.get('argument'), bindings);
            }
        }
        function addTypePattern(patternPath, types) {
            var pattern = patternPath.value;
            namedTypes.Pattern.assert(pattern);
            if (namedTypes.Identifier.check(pattern)) {
                if (hasOwn.call(types, pattern.name)) {
                    types[pattern.name].push(patternPath);
                } else {
                    types[pattern.name] = [patternPath];
                }
            }
        }
        function addTypeParameter(parameterPath, types) {
            var parameter = parameterPath.value;
            FlowOrTSTypeParameterType.assert(parameter);
            if (hasOwn.call(types, parameter.name)) {
                types[parameter.name].push(parameterPath);
            } else {
                types[parameter.name] = [parameterPath];
            }
        }
        Sp.lookup = function (name) {
            for (var scope = this; scope; scope = scope.parent)
                if (scope.declares(name))
                    break;
            return scope;
        };
        Sp.lookupType = function (name) {
            for (var scope = this; scope; scope = scope.parent)
                if (scope.declaresType(name))
                    break;
            return scope;
        };
        Sp.getGlobalScope = function () {
            var scope = this;
            while (!scope.isGlobal)
                scope = scope.parent;
            return scope;
        };
        return Scope;
    };
});
define('skylark-asttypes/node-path',[
    './types',
    './path',
    './scope'
], function (typesPlugin, pathPlugin, scopePlugin) {
    'use strict';
    return function nodePathPlugin(fork) {
        var types = fork.use(typesPlugin);
        var n = types.namedTypes;
        var b = types.builders;
        var isNumber = types.builtInTypes.number;
        var isArray = types.builtInTypes.array;
        var Path = fork.use(pathPlugin);
        var Scope = fork.use(scopePlugin);
        const NodePath = function NodePath(value, parentPath, name) {
            if (!(this instanceof NodePath)) {
                throw new Error("NodePath constructor cannot be invoked without 'new'");
            }
            Path.call(this, value, parentPath, name);
        };
        var NPp = NodePath.prototype = Object.create(Path.prototype, {
            constructor: {
                value: NodePath,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        Object.defineProperties(NPp, {
            node: {
                get: function () {
                    Object.defineProperty(this, 'node', {
                        configurable: true,
                        value: this._computeNode()
                    });
                    return this.node;
                }
            },
            parent: {
                get: function () {
                    Object.defineProperty(this, 'parent', {
                        configurable: true,
                        value: this._computeParent()
                    });
                    return this.parent;
                }
            },
            scope: {
                get: function () {
                    Object.defineProperty(this, 'scope', {
                        configurable: true,
                        value: this._computeScope()
                    });
                    return this.scope;
                }
            }
        });
        NPp.replace = function () {
            delete this.node;
            delete this.parent;
            delete this.scope;
            return Path.prototype.replace.apply(this, arguments);
        };
        NPp.prune = function () {
            var remainingNodePath = this.parent;
            this.replace();
            return cleanUpNodesAfterPrune(remainingNodePath);
        };
        NPp._computeNode = function () {
            var value = this.value;
            if (n.Node.check(value)) {
                return value;
            }
            var pp = this.parentPath;
            return pp && pp.node || null;
        };
        NPp._computeParent = function () {
            var value = this.value;
            var pp = this.parentPath;
            if (!n.Node.check(value)) {
                while (pp && !n.Node.check(pp.value)) {
                    pp = pp.parentPath;
                }
                if (pp) {
                    pp = pp.parentPath;
                }
            }
            while (pp && !n.Node.check(pp.value)) {
                pp = pp.parentPath;
            }
            return pp || null;
        };
        NPp._computeScope = function () {
            var value = this.value;
            var pp = this.parentPath;
            var scope = pp && pp.scope;
            if (n.Node.check(value) && Scope.isEstablishedBy(value)) {
                scope = new Scope(this, scope);
            }
            return scope || null;
        };
        NPp.getValueProperty = function (name) {
            return types.getFieldValue(this.value, name);
        };
        NPp.needsParens = function (assumeExpressionContext) {
            var pp = this.parentPath;
            if (!pp) {
                return false;
            }
            var node = this.value;
            if (!n.Expression.check(node)) {
                return false;
            }
            if (node.type === 'Identifier') {
                return false;
            }
            while (!n.Node.check(pp.value)) {
                pp = pp.parentPath;
                if (!pp) {
                    return false;
                }
            }
            var parent = pp.value;
            switch (node.type) {
            case 'UnaryExpression':
            case 'SpreadElement':
            case 'SpreadProperty':
                return parent.type === 'MemberExpression' && this.name === 'object' && parent.object === node;
            case 'BinaryExpression':
            case 'LogicalExpression':
                switch (parent.type) {
                case 'CallExpression':
                    return this.name === 'callee' && parent.callee === node;
                case 'UnaryExpression':
                case 'SpreadElement':
                case 'SpreadProperty':
                    return true;
                case 'MemberExpression':
                    return this.name === 'object' && parent.object === node;
                case 'BinaryExpression':
                case 'LogicalExpression': {
                        const n = node;
                        const po = parent.operator;
                        const pp = PRECEDENCE[po];
                        const no = n.operator;
                        const np = PRECEDENCE[no];
                        if (pp > np) {
                            return true;
                        }
                        if (pp === np && this.name === 'right') {
                            if (parent.right !== n) {
                                throw new Error('Nodes must be equal');
                            }
                            return true;
                        }
                    }
                default:
                    return false;
                }
            case 'SequenceExpression':
                switch (parent.type) {
                case 'ForStatement':
                    return false;
                case 'ExpressionStatement':
                    return this.name !== 'expression';
                default:
                    return true;
                }
            case 'YieldExpression':
                switch (parent.type) {
                case 'BinaryExpression':
                case 'LogicalExpression':
                case 'UnaryExpression':
                case 'SpreadElement':
                case 'SpreadProperty':
                case 'CallExpression':
                case 'MemberExpression':
                case 'NewExpression':
                case 'ConditionalExpression':
                case 'YieldExpression':
                    return true;
                default:
                    return false;
                }
            case 'Literal':
                return parent.type === 'MemberExpression' && isNumber.check(node.value) && this.name === 'object' && parent.object === node;
            case 'AssignmentExpression':
            case 'ConditionalExpression':
                switch (parent.type) {
                case 'UnaryExpression':
                case 'SpreadElement':
                case 'SpreadProperty':
                case 'BinaryExpression':
                case 'LogicalExpression':
                    return true;
                case 'CallExpression':
                    return this.name === 'callee' && parent.callee === node;
                case 'ConditionalExpression':
                    return this.name === 'test' && parent.test === node;
                case 'MemberExpression':
                    return this.name === 'object' && parent.object === node;
                default:
                    return false;
                }
            default:
                if (parent.type === 'NewExpression' && this.name === 'callee' && parent.callee === node) {
                    return containsCallExpression(node);
                }
            }
            if (assumeExpressionContext !== true && !this.canBeFirstInStatement() && this.firstInStatement())
                return true;
            return false;
        };
        function isBinary(node) {
            return n.BinaryExpression.check(node) || n.LogicalExpression.check(node);
        }
        function isUnaryLike(node) {
            return n.UnaryExpression.check(node) || n.SpreadElement && n.SpreadElement.check(node) || n.SpreadProperty && n.SpreadProperty.check(node);
        }
        var PRECEDENCE = {};
        [
            ['||'],
            ['&&'],
            ['|'],
            ['^'],
            ['&'],
            [
                '==',
                '===',
                '!=',
                '!=='
            ],
            [
                '<',
                '>',
                '<=',
                '>=',
                'in',
                'instanceof'
            ],
            [
                '>>',
                '<<',
                '>>>'
            ],
            [
                '+',
                '-'
            ],
            [
                '*',
                '/',
                '%'
            ]
        ].forEach(function (tier, i) {
            tier.forEach(function (op) {
                PRECEDENCE[op] = i;
            });
        });
        function containsCallExpression(node) {
            if (n.CallExpression.check(node)) {
                return true;
            }
            if (isArray.check(node)) {
                return node.some(containsCallExpression);
            }
            if (n.Node.check(node)) {
                return types.someField(node, function (_name, child) {
                    return containsCallExpression(child);
                });
            }
            return false;
        }
        NPp.canBeFirstInStatement = function () {
            var node = this.node;
            return !n.FunctionExpression.check(node) && !n.ObjectExpression.check(node);
        };
        NPp.firstInStatement = function () {
            return firstInStatement(this);
        };
        function firstInStatement(path) {
            for (var node, parent; path.parent; path = path.parent) {
                node = path.node;
                parent = path.parent.node;
                if (n.BlockStatement.check(parent) && path.parent.name === 'body' && path.name === 0) {
                    if (parent.body[0] !== node) {
                        throw new Error('Nodes must be equal');
                    }
                    return true;
                }
                if (n.ExpressionStatement.check(parent) && path.name === 'expression') {
                    if (parent.expression !== node) {
                        throw new Error('Nodes must be equal');
                    }
                    return true;
                }
                if (n.SequenceExpression.check(parent) && path.parent.name === 'expressions' && path.name === 0) {
                    if (parent.expressions[0] !== node) {
                        throw new Error('Nodes must be equal');
                    }
                    continue;
                }
                if (n.CallExpression.check(parent) && path.name === 'callee') {
                    if (parent.callee !== node) {
                        throw new Error('Nodes must be equal');
                    }
                    continue;
                }
                if (n.MemberExpression.check(parent) && path.name === 'object') {
                    if (parent.object !== node) {
                        throw new Error('Nodes must be equal');
                    }
                    continue;
                }
                if (n.ConditionalExpression.check(parent) && path.name === 'test') {
                    if (parent.test !== node) {
                        throw new Error('Nodes must be equal');
                    }
                    continue;
                }
                if (isBinary(parent) && path.name === 'left') {
                    if (parent.left !== node) {
                        throw new Error('Nodes must be equal');
                    }
                    continue;
                }
                if (n.UnaryExpression.check(parent) && !parent.prefix && path.name === 'argument') {
                    if (parent.argument !== node) {
                        throw new Error('Nodes must be equal');
                    }
                    continue;
                }
                return false;
            }
            return true;
        }
        function cleanUpNodesAfterPrune(remainingNodePath) {
            if (n.VariableDeclaration.check(remainingNodePath.node)) {
                var declarations = remainingNodePath.get('declarations').value;
                if (!declarations || declarations.length === 0) {
                    return remainingNodePath.prune();
                }
            } else if (n.ExpressionStatement.check(remainingNodePath.node)) {
                if (!remainingNodePath.get('expression').value) {
                    return remainingNodePath.prune();
                }
            } else if (n.IfStatement.check(remainingNodePath.node)) {
                cleanUpIfStatementAfterPrune(remainingNodePath);
            }
            return remainingNodePath;
        }
        function cleanUpIfStatementAfterPrune(ifStatement) {
            var testExpression = ifStatement.get('test').value;
            var alternate = ifStatement.get('alternate').value;
            var consequent = ifStatement.get('consequent').value;
            if (!consequent && !alternate) {
                var testExpressionStatement = b.expressionStatement(testExpression);
                ifStatement.replace(testExpressionStatement);
            } else if (!consequent && alternate) {
                var negatedTestExpression = b.unaryExpression('!', testExpression, true);
                if (n.UnaryExpression.check(testExpression) && testExpression.operator === '!') {
                    negatedTestExpression = testExpression.argument;
                }
                ifStatement.get('test').replace(negatedTestExpression);
                ifStatement.get('consequent').replace(alternate);
                ifStatement.get('alternate').replace();
            }
        }
        return NodePath;
    };
});
define('skylark-asttypes/path-visitor',[
    './types',
    './node-path'
], function (typesPlugin, nodePathPlugin) {
    'use strict';
    var hasOwn = Object.prototype.hasOwnProperty;
    return function pathVisitorPlugin(fork) {
        var types = fork.use(typesPlugin);
        var NodePath = fork.use(nodePathPlugin);
        var isArray = types.builtInTypes.array;
        var isObject = types.builtInTypes.object;
        var isFunction = types.builtInTypes.function;
        var undefined;
        const PathVisitor = function PathVisitor() {
            if (!(this instanceof PathVisitor)) {
                throw new Error("PathVisitor constructor cannot be invoked without 'new'");
            }
            this._reusableContextStack = [];
            this._methodNameTable = computeMethodNameTable(this);
            this._shouldVisitComments = hasOwn.call(this._methodNameTable, 'Block') || hasOwn.call(this._methodNameTable, 'Line');
            this.Context = makeContextConstructor(this);
            this._visiting = false;
            this._changeReported = false;
        };
        function computeMethodNameTable(visitor) {
            var typeNames = Object.create(null);
            for (var methodName in visitor) {
                if (/^visit[A-Z]/.test(methodName)) {
                    typeNames[methodName.slice('visit'.length)] = true;
                }
            }
            var supertypeTable = types.computeSupertypeLookupTable(typeNames);
            var methodNameTable = Object.create(null);
            var typeNameKeys = Object.keys(supertypeTable);
            var typeNameCount = typeNameKeys.length;
            for (var i = 0; i < typeNameCount; ++i) {
                var typeName = typeNameKeys[i];
                methodName = 'visit' + supertypeTable[typeName];
                if (isFunction.check(visitor[methodName])) {
                    methodNameTable[typeName] = methodName;
                }
            }
            return methodNameTable;
        }
        PathVisitor.fromMethodsObject = function fromMethodsObject(methods) {
            if (methods instanceof PathVisitor) {
                return methods;
            }
            if (!isObject.check(methods)) {
                return new PathVisitor();
            }
            const Visitor = function Visitor() {
                if (!(this instanceof Visitor)) {
                    throw new Error("Visitor constructor cannot be invoked without 'new'");
                }
                PathVisitor.call(this);
            };
            var Vp = Visitor.prototype = Object.create(PVp);
            Vp.constructor = Visitor;
            extend(Vp, methods);
            extend(Visitor, PathVisitor);
            isFunction.assert(Visitor.fromMethodsObject);
            isFunction.assert(Visitor.visit);
            return new Visitor();
        };
        function extend(target, source) {
            for (var property in source) {
                if (hasOwn.call(source, property)) {
                    target[property] = source[property];
                }
            }
            return target;
        }
        PathVisitor.visit = function visit(node, methods) {
            return PathVisitor.fromMethodsObject(methods).visit(node);
        };
        var PVp = PathVisitor.prototype;
        PVp.visit = function () {
            if (this._visiting) {
                throw new Error('Recursively calling visitor.visit(path) resets visitor state. ' + 'Try this.visit(path) or this.traverse(path) instead.');
            }
            this._visiting = true;
            this._changeReported = false;
            this._abortRequested = false;
            var argc = arguments.length;
            var args = new Array(argc);
            for (var i = 0; i < argc; ++i) {
                args[i] = arguments[i];
            }
            if (!(args[0] instanceof NodePath)) {
                args[0] = new NodePath({ root: args[0] }).get('root');
            }
            this.reset.apply(this, args);
            var didNotThrow;
            try {
                var root = this.visitWithoutReset(args[0]);
                didNotThrow = true;
            } finally {
                this._visiting = false;
                if (!didNotThrow && this._abortRequested) {
                    return args[0].value;
                }
            }
            return root;
        };
        PVp.AbortRequest = function AbortRequest() {
        };
        PVp.abort = function () {
            var visitor = this;
            visitor._abortRequested = true;
            var request = new visitor.AbortRequest();
            request.cancel = function () {
                visitor._abortRequested = false;
            };
            throw request;
        };
        PVp.reset = function (_path) {
        };
        PVp.visitWithoutReset = function (path) {
            if (this instanceof this.Context) {
                return this.visitor.visitWithoutReset(path);
            }
            if (!(path instanceof NodePath)) {
                throw new Error('');
            }
            var value = path.value;
            var methodName = value && typeof value === 'object' && typeof value.type === 'string' && this._methodNameTable[value.type];
            if (methodName) {
                var context = this.acquireContext(path);
                try {
                    return context.invokeVisitorMethod(methodName);
                } finally {
                    this.releaseContext(context);
                }
            } else {
                return visitChildren(path, this);
            }
        };
        function visitChildren(path, visitor) {
            if (!(path instanceof NodePath)) {
                throw new Error('');
            }
            if (!(visitor instanceof PathVisitor)) {
                throw new Error('');
            }
            var value = path.value;
            if (isArray.check(value)) {
                path.each(visitor.visitWithoutReset, visitor);
            } else if (!isObject.check(value)) {
            } else {
                var childNames = types.getFieldNames(value);
                if (visitor._shouldVisitComments && value.comments && childNames.indexOf('comments') < 0) {
                    childNames.push('comments');
                }
                var childCount = childNames.length;
                var childPaths = [];
                for (var i = 0; i < childCount; ++i) {
                    var childName = childNames[i];
                    if (!hasOwn.call(value, childName)) {
                        value[childName] = types.getFieldValue(value, childName);
                    }
                    childPaths.push(path.get(childName));
                }
                for (var i = 0; i < childCount; ++i) {
                    visitor.visitWithoutReset(childPaths[i]);
                }
            }
            return path.value;
        }
        PVp.acquireContext = function (path) {
            if (this._reusableContextStack.length === 0) {
                return new this.Context(path);
            }
            return this._reusableContextStack.pop().reset(path);
        };
        PVp.releaseContext = function (context) {
            if (!(context instanceof this.Context)) {
                throw new Error('');
            }
            this._reusableContextStack.push(context);
            context.currentPath = null;
        };
        PVp.reportChanged = function () {
            this._changeReported = true;
        };
        PVp.wasChangeReported = function () {
            return this._changeReported;
        };
        function makeContextConstructor(visitor) {
            function Context(path) {
                if (!(this instanceof Context)) {
                    throw new Error('');
                }
                if (!(this instanceof PathVisitor)) {
                    throw new Error('');
                }
                if (!(path instanceof NodePath)) {
                    throw new Error('');
                }
                Object.defineProperty(this, 'visitor', {
                    value: visitor,
                    writable: false,
                    enumerable: true,
                    configurable: false
                });
                this.currentPath = path;
                this.needToCallTraverse = true;
                Object.seal(this);
            }
            if (!(visitor instanceof PathVisitor)) {
                throw new Error('');
            }
            var Cp = Context.prototype = Object.create(visitor);
            Cp.constructor = Context;
            extend(Cp, sharedContextProtoMethods);
            return Context;
        }
        var sharedContextProtoMethods = Object.create(null);
        sharedContextProtoMethods.reset = function reset(path) {
            if (!(this instanceof this.Context)) {
                throw new Error('');
            }
            if (!(path instanceof NodePath)) {
                throw new Error('');
            }
            this.currentPath = path;
            this.needToCallTraverse = true;
            return this;
        };
        sharedContextProtoMethods.invokeVisitorMethod = function invokeVisitorMethod(methodName) {
            if (!(this instanceof this.Context)) {
                throw new Error('');
            }
            if (!(this.currentPath instanceof NodePath)) {
                throw new Error('');
            }
            var result = this.visitor[methodName].call(this, this.currentPath);
            if (result === false) {
                this.needToCallTraverse = false;
            } else if (result !== undefined) {
                this.currentPath = this.currentPath.replace(result)[0];
                if (this.needToCallTraverse) {
                    this.traverse(this.currentPath);
                }
            }
            if (this.needToCallTraverse !== false) {
                throw new Error('Must either call this.traverse or return false in ' + methodName);
            }
            var path = this.currentPath;
            return path && path.value;
        };
        sharedContextProtoMethods.traverse = function traverse(path, newVisitor) {
            if (!(this instanceof this.Context)) {
                throw new Error('');
            }
            if (!(path instanceof NodePath)) {
                throw new Error('');
            }
            if (!(this.currentPath instanceof NodePath)) {
                throw new Error('');
            }
            this.needToCallTraverse = false;
            return visitChildren(path, PathVisitor.fromMethodsObject(newVisitor || this.visitor));
        };
        sharedContextProtoMethods.visit = function visit(path, newVisitor) {
            if (!(this instanceof this.Context)) {
                throw new Error('');
            }
            if (!(path instanceof NodePath)) {
                throw new Error('');
            }
            if (!(this.currentPath instanceof NodePath)) {
                throw new Error('');
            }
            this.needToCallTraverse = false;
            return PathVisitor.fromMethodsObject(newVisitor || this.visitor).visitWithoutReset(path);
        };
        sharedContextProtoMethods.reportChanged = function reportChanged() {
            this.visitor.reportChanged();
        };
        sharedContextProtoMethods.abort = function abort() {
            this.needToCallTraverse = false;
            this.visitor.abort();
        };
        return PathVisitor;
    };
});
define('skylark-asttypes/equiv',['./types'], function (typesPlugin) {
    'use strict';
    return function (fork) {
        var types = fork.use(typesPlugin);
        var getFieldNames = types.getFieldNames;
        var getFieldValue = types.getFieldValue;
        var isArray = types.builtInTypes.array;
        var isObject = types.builtInTypes.object;
        var isDate = types.builtInTypes.Date;
        var isRegExp = types.builtInTypes.RegExp;
        var hasOwn = Object.prototype.hasOwnProperty;
        function astNodesAreEquivalent(a, b, problemPath) {
            if (isArray.check(problemPath)) {
                problemPath.length = 0;
            } else {
                problemPath = null;
            }
            return areEquivalent(a, b, problemPath);
        }
        astNodesAreEquivalent.assert = function (a, b) {
            var problemPath = [];
            if (!astNodesAreEquivalent(a, b, problemPath)) {
                if (problemPath.length === 0) {
                    if (a !== b) {
                        throw new Error('Nodes must be equal');
                    }
                } else {
                    throw new Error('Nodes differ in the following path: ' + problemPath.map(subscriptForProperty).join(''));
                }
            }
        };
        function subscriptForProperty(property) {
            if (/[_$a-z][_$a-z0-9]*/i.test(property)) {
                return '.' + property;
            }
            return '[' + JSON.stringify(property) + ']';
        }
        function areEquivalent(a, b, problemPath) {
            if (a === b) {
                return true;
            }
            if (isArray.check(a)) {
                return arraysAreEquivalent(a, b, problemPath);
            }
            if (isObject.check(a)) {
                return objectsAreEquivalent(a, b, problemPath);
            }
            if (isDate.check(a)) {
                return isDate.check(b) && +a === +b;
            }
            if (isRegExp.check(a)) {
                return isRegExp.check(b) && (a.source === b.source && a.global === b.global && a.multiline === b.multiline && a.ignoreCase === b.ignoreCase);
            }
            return a == b;
        }
        function arraysAreEquivalent(a, b, problemPath) {
            isArray.assert(a);
            var aLength = a.length;
            if (!isArray.check(b) || b.length !== aLength) {
                if (problemPath) {
                    problemPath.push('length');
                }
                return false;
            }
            for (var i = 0; i < aLength; ++i) {
                if (problemPath) {
                    problemPath.push(i);
                }
                if (i in a !== i in b) {
                    return false;
                }
                if (!areEquivalent(a[i], b[i], problemPath)) {
                    return false;
                }
                if (problemPath) {
                    var problemPathTail = problemPath.pop();
                    if (problemPathTail !== i) {
                        throw new Error('' + problemPathTail);
                    }
                }
            }
            return true;
        }
        function objectsAreEquivalent(a, b, problemPath) {
            isObject.assert(a);
            if (!isObject.check(b)) {
                return false;
            }
            if (a.type !== b.type) {
                if (problemPath) {
                    problemPath.push('type');
                }
                return false;
            }
            var aNames = getFieldNames(a);
            var aNameCount = aNames.length;
            var bNames = getFieldNames(b);
            var bNameCount = bNames.length;
            if (aNameCount === bNameCount) {
                for (var i = 0; i < aNameCount; ++i) {
                    var name = aNames[i];
                    var aChild = getFieldValue(a, name);
                    var bChild = getFieldValue(b, name);
                    if (problemPath) {
                        problemPath.push(name);
                    }
                    if (!areEquivalent(aChild, bChild, problemPath)) {
                        return false;
                    }
                    if (problemPath) {
                        var problemPathTail = problemPath.pop();
                        if (problemPathTail !== name) {
                            throw new Error('' + problemPathTail);
                        }
                    }
                }
                return true;
            }
            if (!problemPath) {
                return false;
            }
            var seenNames = Object.create(null);
            for (i = 0; i < aNameCount; ++i) {
                seenNames[aNames[i]] = true;
            }
            for (i = 0; i < bNameCount; ++i) {
                name = bNames[i];
                if (!hasOwn.call(seenNames, name)) {
                    problemPath.push(name);
                    return false;
                }
                delete seenNames[name];
            }
            for (name in seenNames) {
                problemPath.push(name);
                break;
            }
            return false;
        }
        return astNodesAreEquivalent;
    };
});
define('skylark-asttypes/fork',[
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
define('skylark-asttypes/def/operators/core',[],function () {
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
define('skylark-asttypes/def/operators/es2016',['./core'], function (coreOpsDef) {
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
define('skylark-asttypes/def/operators/es2020',['./es2016'], function (es2016OpsDef) {
    'use strict';
    return function (fork) {
        const result = fork.use(es2016OpsDef);
        if (result.LogicalOperators.indexOf('??') < 0) {
            result.LogicalOperators.push('??');
        }
        return result;
    };
});
define('skylark-asttypes/def/operators/es2021',['./es2020'], function (es2020OpsDef) {
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
define('skylark-asttypes/def/core',[
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
define('skylark-asttypes/shared',['./types'], function (typesPlugin) {
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
define('skylark-asttypes/def/es6',[
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
define('skylark-asttypes/def/es2016',[
    './operators/es2016',
    './es6'
], function (es2016OpsDef, es6Def) {
    'use strict';
    return function (fork) {
        fork.use(es2016OpsDef);
        fork.use(es6Def);
    };
});
define('skylark-asttypes/def/es2017',[
    './es2016',
    '../types',
    '../shared'
], function (es2016Def, typesPlugin, sharedPlugin) {
    'use strict';
    return function (fork) {
        fork.use(es2016Def);
        const types = fork.use(typesPlugin);
        const def = types.Type.def;
        const defaults = fork.use(sharedPlugin).defaults;
        def('Function').field('async', Boolean, defaults['false']);
        def('AwaitExpression').bases('Expression').build('argument').field('argument', def('Expression'));
    };
});
define('skylark-asttypes/def/es2018',[
    './es2017',
    '../types',
    '../shared'
], function (es2017Def, typesPlugin, sharedPlugin) {
    'use strict';
    return function (fork) {
        fork.use(es2017Def);
        const types = fork.use(typesPlugin);
        const def = types.Type.def;
        const or = types.Type.or;
        const defaults = fork.use(sharedPlugin).defaults;
        def('ForOfStatement').field('await', Boolean, defaults['false']);
        def('SpreadProperty').bases('Node').build('argument').field('argument', def('Expression'));
        def('ObjectExpression').field('properties', [or(def('Property'), def('SpreadProperty'), def('SpreadElement'))]);
        def('TemplateElement').field('value', {
            'cooked': or(String, null),
            'raw': String
        });
        def('SpreadPropertyPattern').bases('Pattern').build('argument').field('argument', def('Pattern'));
        def('ObjectPattern').field('properties', [or(def('PropertyPattern'), def('Property'), def('RestElement'), def('SpreadPropertyPattern'))]);
    };
});
define('skylark-asttypes/def/es2019',[
    './es2018',
    '../types',
    '../shared'
], function (es2018Def, typesPlugin, sharedPlugin) {
    'use strict';
    return function (fork) {
        fork.use(es2018Def);
        const types = fork.use(typesPlugin);
        const def = types.Type.def;
        const or = types.Type.or;
        const defaults = fork.use(sharedPlugin).defaults;
        def('CatchClause').field('param', or(def('Pattern'), null), defaults['null']);
    };
});
define('skylark-asttypes/def/es2020',[
    './operators/es2020',
    './es2019',
    '../types',
    '../shared'
], function (es2020OpsDef, es2019Def, typesPlugin, sharedPlugin) {
    'use strict';
    return function (fork) {
        fork.use(es2020OpsDef);
        fork.use(es2019Def);
        const types = fork.use(typesPlugin);
        const def = types.Type.def;
        const or = types.Type.or;
        const shared = fork.use(sharedPlugin);
        const defaults = shared.defaults;
        def('ImportExpression').bases('Expression').build('source').field('source', def('Expression'));
        def('ExportAllDeclaration').bases('Declaration').build('source', 'exported').field('source', def('Literal')).field('exported', or(def('Identifier'), null, void 0), defaults['null']);
        def('ChainElement').bases('Node').field('optional', Boolean, defaults['false']);
        def('CallExpression').bases('Expression', 'ChainElement');
        def('MemberExpression').bases('Expression', 'ChainElement');
        def('ChainExpression').bases('Expression').build('expression').field('expression', def('ChainElement'));
        def('OptionalCallExpression').bases('CallExpression').build('callee', 'arguments', 'optional').field('optional', Boolean, defaults['true']);
        def('OptionalMemberExpression').bases('MemberExpression').build('object', 'property', 'computed', 'optional').field('optional', Boolean, defaults['true']);
    };
});
define('skylark-asttypes/def/es2021',[
    './operators/es2021',
    './es2020'
], function (es2021OpsDef, es2020Def) {
    'use strict';
    return function (fork) {
        fork.use(es2021OpsDef);
        fork.use(es2020Def);
    };
});
define('skylark-asttypes/def/es2022',[
    './es2021',
    '../types'
], function (es2021Def, typesPlugin) {
    'use strict';
    return function (fork) {
        fork.use(es2021Def);
        const types = fork.use(typesPlugin);
        const def = types.Type.def;
        def('StaticBlock').bases('Declaration').build('body').field('body', [def('Statement')]);
    };
});
define('skylark-asttypes/def/es-proposals',[
    '../types',
    './es2022'
], function (typesPlugin, es2022Def) {
    'use strict';
    return function (fork) {
        fork.use(es2022Def);
        const types = fork.use(typesPlugin);
        const Type = types.Type;
        const def = types.Type.def;
        const or = Type.or;
        const shared = fork.use(sharedPlugin);
        const defaults = shared.defaults;
        def('AwaitExpression').build('argument', 'all').field('argument', or(def('Expression'), null)).field('all', Boolean, defaults['false']);
        def('Decorator').bases('Node').build('expression').field('expression', def('Expression'));
        def('Property').field('decorators', or([def('Decorator')], null), defaults['null']);
        def('MethodDefinition').field('decorators', or([def('Decorator')], null), defaults['null']);
        def('PrivateName').bases('Expression', 'Pattern').build('id').field('id', def('Identifier'));
        def('ClassPrivateProperty').bases('ClassProperty').build('key', 'value').field('key', def('PrivateName')).field('value', or(def('Expression'), null), defaults['null']);
        def('ImportAttribute').bases('Node').build('key', 'value').field('key', or(def('Identifier'), def('Literal'))).field('value', def('Expression'));
        [
            'ImportDeclaration',
            'ExportAllDeclaration',
            'ExportNamedDeclaration'
        ].forEach(decl => {
            def(decl).field('assertions', [def('ImportAttribute')], defaults.emptyArray);
        });
        def('RecordExpression').bases('Expression').build('properties').field('properties', [or(def('ObjectProperty'), def('ObjectMethod'), def('SpreadElement'))]);
        def('TupleExpression').bases('Expression').build('elements').field('elements', [or(def('Expression'), def('SpreadElement'), null)]);
        def('ModuleExpression').bases('Node').build('body').field('body', def('Program'));
    };
});
define('skylark-asttypes/def/jsx',[
    './es-proposals',
    '../types',
    '../shared'
], function (esProposalsDef, typesPlugin, sharedPlugin) {
    'use strict';
    return function (fork) {
        fork.use(esProposalsDef);
        const types = fork.use(typesPlugin);
        const def = types.Type.def;
        const or = types.Type.or;
        const defaults = fork.use(sharedPlugin).defaults;
        def('JSXAttribute').bases('Node').build('name', 'value').field('name', or(def('JSXIdentifier'), def('JSXNamespacedName'))).field('value', or(def('Literal'), def('JSXExpressionContainer'), def('JSXElement'), def('JSXFragment'), null), defaults['null']);
        def('JSXIdentifier').bases('Identifier').build('name').field('name', String);
        def('JSXNamespacedName').bases('Node').build('namespace', 'name').field('namespace', def('JSXIdentifier')).field('name', def('JSXIdentifier'));
        def('JSXMemberExpression').bases('MemberExpression').build('object', 'property').field('object', or(def('JSXIdentifier'), def('JSXMemberExpression'))).field('property', def('JSXIdentifier')).field('computed', Boolean, defaults.false);
        const JSXElementName = or(def('JSXIdentifier'), def('JSXNamespacedName'), def('JSXMemberExpression'));
        def('JSXSpreadAttribute').bases('Node').build('argument').field('argument', def('Expression'));
        const JSXAttributes = [or(def('JSXAttribute'), def('JSXSpreadAttribute'))];
        def('JSXExpressionContainer').bases('Expression').build('expression').field('expression', or(def('Expression'), def('JSXEmptyExpression')));
        const JSXChildren = [or(def('JSXText'), def('JSXExpressionContainer'), def('JSXSpreadChild'), def('JSXElement'), def('JSXFragment'), def('Literal'))];
        def('JSXElement').bases('Expression').build('openingElement', 'closingElement', 'children').field('openingElement', def('JSXOpeningElement')).field('closingElement', or(def('JSXClosingElement'), null), defaults['null']).field('children', JSXChildren, defaults.emptyArray).field('name', JSXElementName, function () {
            return this.openingElement.name;
        }, true).field('selfClosing', Boolean, function () {
            return this.openingElement.selfClosing;
        }, true).field('attributes', JSXAttributes, function () {
            return this.openingElement.attributes;
        }, true);
        def('JSXOpeningElement').bases('Node').build('name', 'attributes', 'selfClosing').field('name', JSXElementName).field('attributes', JSXAttributes, defaults.emptyArray).field('selfClosing', Boolean, defaults['false']);
        def('JSXClosingElement').bases('Node').build('name').field('name', JSXElementName);
        def('JSXFragment').bases('Expression').build('openingFragment', 'closingFragment', 'children').field('openingFragment', def('JSXOpeningFragment')).field('closingFragment', def('JSXClosingFragment')).field('children', JSXChildren, defaults.emptyArray);
        def('JSXOpeningFragment').bases('Node').build();
        def('JSXClosingFragment').bases('Node').build();
        def('JSXText').bases('Literal').build('value', 'raw').field('value', String).field('raw', String, function () {
            return this.value;
        });
        def('JSXEmptyExpression').bases('Node').build();
        def('JSXSpreadChild').bases('Node').build('expression').field('expression', def('Expression'));
    };
});
define('skylark-asttypes/def/type-annotations',[
    '../types',
    '../shared'
], function (typesPlugin, sharedPlugin) {
    'use strict';
    return function (fork) {
        var types = fork.use(typesPlugin);
        var def = types.Type.def;
        var or = types.Type.or;
        var defaults = fork.use(sharedPlugin).defaults;
        var TypeAnnotation = or(def('TypeAnnotation'), def('TSTypeAnnotation'), null);
        var TypeParamDecl = or(def('TypeParameterDeclaration'), def('TSTypeParameterDeclaration'), null);
        def('Identifier').field('typeAnnotation', TypeAnnotation, defaults['null']);
        def('ObjectPattern').field('typeAnnotation', TypeAnnotation, defaults['null']);
        def('Function').field('returnType', TypeAnnotation, defaults['null']).field('typeParameters', TypeParamDecl, defaults['null']);
        def('ClassProperty').build('key', 'value', 'typeAnnotation', 'static').field('value', or(def('Expression'), null)).field('static', Boolean, defaults['false']).field('typeAnnotation', TypeAnnotation, defaults['null']);
        [
            'ClassDeclaration',
            'ClassExpression'
        ].forEach(typeName => {
            def(typeName).field('typeParameters', TypeParamDecl, defaults['null']).field('superTypeParameters', or(def('TypeParameterInstantiation'), def('TSTypeParameterInstantiation'), null), defaults['null']).field('implements', or([def('ClassImplements')], [def('TSExpressionWithTypeArguments')]), defaults.emptyArray);
        });
    };
});
define('skylark-asttypes/def/flow',[
    './es-proposals',
    './type-annotations',
    '../types',
    '../shared'
], function (esProposalsDef, typeAnnotationsDef, typesPlugin, sharedPlugin) {
    'use strict';
    return function (fork) {
        fork.use(esProposalsDef);
        fork.use(typeAnnotationsDef);
        const types = fork.use(typesPlugin);
        const def = types.Type.def;
        const or = types.Type.or;
        const defaults = fork.use(sharedPlugin).defaults;
        def('Flow').bases('Node');
        def('FlowType').bases('Flow');
        def('AnyTypeAnnotation').bases('FlowType').build();
        def('EmptyTypeAnnotation').bases('FlowType').build();
        def('MixedTypeAnnotation').bases('FlowType').build();
        def('VoidTypeAnnotation').bases('FlowType').build();
        def('SymbolTypeAnnotation').bases('FlowType').build();
        def('NumberTypeAnnotation').bases('FlowType').build();
        def('BigIntTypeAnnotation').bases('FlowType').build();
        def('NumberLiteralTypeAnnotation').bases('FlowType').build('value', 'raw').field('value', Number).field('raw', String);
        def('NumericLiteralTypeAnnotation').bases('FlowType').build('value', 'raw').field('value', Number).field('raw', String);
        def('BigIntLiteralTypeAnnotation').bases('FlowType').build('value', 'raw').field('value', null).field('raw', String);
        def('StringTypeAnnotation').bases('FlowType').build();
        def('StringLiteralTypeAnnotation').bases('FlowType').build('value', 'raw').field('value', String).field('raw', String);
        def('BooleanTypeAnnotation').bases('FlowType').build();
        def('BooleanLiteralTypeAnnotation').bases('FlowType').build('value', 'raw').field('value', Boolean).field('raw', String);
        def('TypeAnnotation').bases('Node').build('typeAnnotation').field('typeAnnotation', def('FlowType'));
        def('NullableTypeAnnotation').bases('FlowType').build('typeAnnotation').field('typeAnnotation', def('FlowType'));
        def('NullLiteralTypeAnnotation').bases('FlowType').build();
        def('NullTypeAnnotation').bases('FlowType').build();
        def('ThisTypeAnnotation').bases('FlowType').build();
        def('ExistsTypeAnnotation').bases('FlowType').build();
        def('ExistentialTypeParam').bases('FlowType').build();
        def('FunctionTypeAnnotation').bases('FlowType').build('params', 'returnType', 'rest', 'typeParameters').field('params', [def('FunctionTypeParam')]).field('returnType', def('FlowType')).field('rest', or(def('FunctionTypeParam'), null)).field('typeParameters', or(def('TypeParameterDeclaration'), null));
        def('FunctionTypeParam').bases('Node').build('name', 'typeAnnotation', 'optional').field('name', or(def('Identifier'), null)).field('typeAnnotation', def('FlowType')).field('optional', Boolean);
        def('ArrayTypeAnnotation').bases('FlowType').build('elementType').field('elementType', def('FlowType'));
        def('ObjectTypeAnnotation').bases('FlowType').build('properties', 'indexers', 'callProperties').field('properties', [or(def('ObjectTypeProperty'), def('ObjectTypeSpreadProperty'))]).field('indexers', [def('ObjectTypeIndexer')], defaults.emptyArray).field('callProperties', [def('ObjectTypeCallProperty')], defaults.emptyArray).field('inexact', or(Boolean, void 0), defaults['undefined']).field('exact', Boolean, defaults['false']).field('internalSlots', [def('ObjectTypeInternalSlot')], defaults.emptyArray);
        def('Variance').bases('Node').build('kind').field('kind', or('plus', 'minus'));
        const LegacyVariance = or(def('Variance'), 'plus', 'minus', null);
        def('ObjectTypeProperty').bases('Node').build('key', 'value', 'optional').field('key', or(def('Literal'), def('Identifier'))).field('value', def('FlowType')).field('optional', Boolean).field('variance', LegacyVariance, defaults['null']);
        def('ObjectTypeIndexer').bases('Node').build('id', 'key', 'value').field('id', def('Identifier')).field('key', def('FlowType')).field('value', def('FlowType')).field('variance', LegacyVariance, defaults['null']).field('static', Boolean, defaults['false']);
        def('ObjectTypeCallProperty').bases('Node').build('value').field('value', def('FunctionTypeAnnotation')).field('static', Boolean, defaults['false']);
        def('QualifiedTypeIdentifier').bases('Node').build('qualification', 'id').field('qualification', or(def('Identifier'), def('QualifiedTypeIdentifier'))).field('id', def('Identifier'));
        def('GenericTypeAnnotation').bases('FlowType').build('id', 'typeParameters').field('id', or(def('Identifier'), def('QualifiedTypeIdentifier'))).field('typeParameters', or(def('TypeParameterInstantiation'), null));
        def('MemberTypeAnnotation').bases('FlowType').build('object', 'property').field('object', def('Identifier')).field('property', or(def('MemberTypeAnnotation'), def('GenericTypeAnnotation')));
        def('IndexedAccessType').bases('FlowType').build('objectType', 'indexType').field('objectType', def('FlowType')).field('indexType', def('FlowType'));
        def('OptionalIndexedAccessType').bases('FlowType').build('objectType', 'indexType', 'optional').field('objectType', def('FlowType')).field('indexType', def('FlowType')).field('optional', Boolean);
        def('UnionTypeAnnotation').bases('FlowType').build('types').field('types', [def('FlowType')]);
        def('IntersectionTypeAnnotation').bases('FlowType').build('types').field('types', [def('FlowType')]);
        def('TypeofTypeAnnotation').bases('FlowType').build('argument').field('argument', def('FlowType'));
        def('ObjectTypeSpreadProperty').bases('Node').build('argument').field('argument', def('FlowType'));
        def('ObjectTypeInternalSlot').bases('Node').build('id', 'value', 'optional', 'static', 'method').field('id', def('Identifier')).field('value', def('FlowType')).field('optional', Boolean).field('static', Boolean).field('method', Boolean);
        def('TypeParameterDeclaration').bases('Node').build('params').field('params', [def('TypeParameter')]);
        def('TypeParameterInstantiation').bases('Node').build('params').field('params', [def('FlowType')]);
        def('TypeParameter').bases('FlowType').build('name', 'variance', 'bound', 'default').field('name', String).field('variance', LegacyVariance, defaults['null']).field('bound', or(def('TypeAnnotation'), null), defaults['null']).field('default', or(def('FlowType'), null), defaults['null']);
        def('ClassProperty').field('variance', LegacyVariance, defaults['null']);
        def('ClassImplements').bases('Node').build('id').field('id', def('Identifier')).field('superClass', or(def('Expression'), null), defaults['null']).field('typeParameters', or(def('TypeParameterInstantiation'), null), defaults['null']);
        def('InterfaceTypeAnnotation').bases('FlowType').build('body', 'extends').field('body', def('ObjectTypeAnnotation')).field('extends', or([def('InterfaceExtends')], null), defaults['null']);
        def('InterfaceDeclaration').bases('Declaration').build('id', 'body', 'extends').field('id', def('Identifier')).field('typeParameters', or(def('TypeParameterDeclaration'), null), defaults['null']).field('body', def('ObjectTypeAnnotation')).field('extends', [def('InterfaceExtends')]);
        def('DeclareInterface').bases('InterfaceDeclaration').build('id', 'body', 'extends');
        def('InterfaceExtends').bases('Node').build('id').field('id', def('Identifier')).field('typeParameters', or(def('TypeParameterInstantiation'), null), defaults['null']);
        def('TypeAlias').bases('Declaration').build('id', 'typeParameters', 'right').field('id', def('Identifier')).field('typeParameters', or(def('TypeParameterDeclaration'), null)).field('right', def('FlowType'));
        def('DeclareTypeAlias').bases('TypeAlias').build('id', 'typeParameters', 'right');
        def('OpaqueType').bases('Declaration').build('id', 'typeParameters', 'impltype', 'supertype').field('id', def('Identifier')).field('typeParameters', or(def('TypeParameterDeclaration'), null)).field('impltype', def('FlowType')).field('supertype', or(def('FlowType'), null));
        def('DeclareOpaqueType').bases('OpaqueType').build('id', 'typeParameters', 'supertype').field('impltype', or(def('FlowType'), null));
        def('TypeCastExpression').bases('Expression').build('expression', 'typeAnnotation').field('expression', def('Expression')).field('typeAnnotation', def('TypeAnnotation'));
        def('TupleTypeAnnotation').bases('FlowType').build('types').field('types', [def('FlowType')]);
        def('DeclareVariable').bases('Statement').build('id').field('id', def('Identifier'));
        def('DeclareFunction').bases('Statement').build('id').field('id', def('Identifier')).field('predicate', or(def('FlowPredicate'), null), defaults['null']);
        def('DeclareClass').bases('InterfaceDeclaration').build('id');
        def('DeclareModule').bases('Statement').build('id', 'body').field('id', or(def('Identifier'), def('Literal'))).field('body', def('BlockStatement'));
        def('DeclareModuleExports').bases('Statement').build('typeAnnotation').field('typeAnnotation', def('TypeAnnotation'));
        def('DeclareExportDeclaration').bases('Declaration').build('default', 'declaration', 'specifiers', 'source').field('default', Boolean).field('declaration', or(def('DeclareVariable'), def('DeclareFunction'), def('DeclareClass'), def('FlowType'), def('TypeAlias'), def('DeclareOpaqueType'), def('InterfaceDeclaration'), null)).field('specifiers', [or(def('ExportSpecifier'), def('ExportBatchSpecifier'))], defaults.emptyArray).field('source', or(def('Literal'), null), defaults['null']);
        def('DeclareExportAllDeclaration').bases('Declaration').build('source').field('source', or(def('Literal'), null), defaults['null']);
        def('ImportDeclaration').field('importKind', or('value', 'type', 'typeof'), () => 'value');
        def('FlowPredicate').bases('Flow');
        def('InferredPredicate').bases('FlowPredicate').build();
        def('DeclaredPredicate').bases('FlowPredicate').build('value').field('value', def('Expression'));
        def('Function').field('predicate', or(def('FlowPredicate'), null), defaults['null']);
        def('CallExpression').field('typeArguments', or(null, def('TypeParameterInstantiation')), defaults['null']);
        def('NewExpression').field('typeArguments', or(null, def('TypeParameterInstantiation')), defaults['null']);
        def('EnumDeclaration').bases('Declaration').build('id', 'body').field('id', def('Identifier')).field('body', or(def('EnumBooleanBody'), def('EnumNumberBody'), def('EnumStringBody'), def('EnumSymbolBody')));
        def('EnumBooleanBody').build('members', 'explicitType').field('members', [def('EnumBooleanMember')]).field('explicitType', Boolean);
        def('EnumNumberBody').build('members', 'explicitType').field('members', [def('EnumNumberMember')]).field('explicitType', Boolean);
        def('EnumStringBody').build('members', 'explicitType').field('members', or([def('EnumStringMember')], [def('EnumDefaultedMember')])).field('explicitType', Boolean);
        def('EnumSymbolBody').build('members').field('members', [def('EnumDefaultedMember')]);
        def('EnumBooleanMember').build('id', 'init').field('id', def('Identifier')).field('init', or(def('Literal'), Boolean));
        def('EnumNumberMember').build('id', 'init').field('id', def('Identifier')).field('init', def('Literal'));
        def('EnumStringMember').build('id', 'init').field('id', def('Identifier')).field('init', def('Literal'));
        def('EnumDefaultedMember').build('id').field('id', def('Identifier'));
    };
});
define('skylark-asttypes/def/esprima',[
    './es-proposals',
    '../types',
    '../shared'
], function (esProposalsDef, typesPlugin, sharedPlugin) {
    'use strict';
    return function (fork) {
        fork.use(esProposalsDef);
        var types = fork.use(typesPlugin);
        var defaults = fork.use(sharedPlugin).defaults;
        var def = types.Type.def;
        var or = types.Type.or;
        def('VariableDeclaration').field('declarations', [or(def('VariableDeclarator'), def('Identifier'))]);
        def('Property').field('value', or(def('Expression'), def('Pattern')));
        def('ArrayPattern').field('elements', [or(def('Pattern'), def('SpreadElement'), null)]);
        def('ObjectPattern').field('properties', [or(def('Property'), def('PropertyPattern'), def('SpreadPropertyPattern'), def('SpreadProperty'))]);
        def('ExportSpecifier').bases('ModuleSpecifier').build('id', 'name');
        def('ExportBatchSpecifier').bases('Specifier').build();
        def('ExportDeclaration').bases('Declaration').build('default', 'declaration', 'specifiers', 'source').field('default', Boolean).field('declaration', or(def('Declaration'), def('Expression'), null)).field('specifiers', [or(def('ExportSpecifier'), def('ExportBatchSpecifier'))], defaults.emptyArray).field('source', or(def('Literal'), null), defaults['null']);
        def('Block').bases('Comment').build('value', 'leading', 'trailing');
        def('Line').bases('Comment').build('value', 'leading', 'trailing');
    };
});
define('skylark-asttypes/def/babel-core',[
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
define('skylark-asttypes/def/babel',[
    '../types',
    './babel-core',
    './flow'
], function (typesPlugin, babelCoreDef, flowDef) {
    'use strict';
    return function (fork) {
        const types = fork.use(typesPlugin);
        const def = types.Type.def;
        fork.use(babelCoreDef);
        fork.use(flowDef);
        def('V8IntrinsicIdentifier').bases('Expression').build('name').field('name', String);
        def('TopicReference').bases('Expression').build();
    };
});
define('skylark-asttypes/def/typescript',[
    './babel-core',
    './type-annotations',
    '../types',
    '../shared'
], function (babelCoreDef, typeAnnotationsDef, typesPlugin, sharedPlugin) {
    'use strict';
    return function (fork) {
        fork.use(babelCoreDef);
        fork.use(typeAnnotationsDef);
        var types = fork.use(typesPlugin);
        var n = types.namedTypes;
        var def = types.Type.def;
        var or = types.Type.or;
        var defaults = fork.use(sharedPlugin).defaults;
        var StringLiteral = types.Type.from(function (value, deep) {
            if (n.StringLiteral && n.StringLiteral.check(value, deep)) {
                return true;
            }
            if (n.Literal && n.Literal.check(value, deep) && typeof value.value === 'string') {
                return true;
            }
            return false;
        }, 'StringLiteral');
        def('TSType').bases('Node');
        var TSEntityName = or(def('Identifier'), def('TSQualifiedName'));
        def('TSTypeReference').bases('TSType', 'TSHasOptionalTypeParameterInstantiation').build('typeName', 'typeParameters').field('typeName', TSEntityName);
        def('TSHasOptionalTypeParameterInstantiation').field('typeParameters', or(def('TSTypeParameterInstantiation'), null), defaults['null']);
        def('TSHasOptionalTypeParameters').field('typeParameters', or(def('TSTypeParameterDeclaration'), null, void 0), defaults['null']);
        def('TSHasOptionalTypeAnnotation').field('typeAnnotation', or(def('TSTypeAnnotation'), null), defaults['null']);
        def('TSQualifiedName').bases('Node').build('left', 'right').field('left', TSEntityName).field('right', TSEntityName);
        def('TSAsExpression').bases('Expression', 'Pattern').build('expression', 'typeAnnotation').field('expression', def('Expression')).field('typeAnnotation', def('TSType')).field('extra', or({ parenthesized: Boolean }, null), defaults['null']);
        def('TSTypeCastExpression').bases('Expression').build('expression', 'typeAnnotation').field('expression', def('Expression')).field('typeAnnotation', def('TSType'));
        def('TSSatisfiesExpression').bases('Expression', 'Pattern').build('expression', 'typeAnnotation').field('expression', def('Expression')).field('typeAnnotation', def('TSType'));
        def('TSNonNullExpression').bases('Expression', 'Pattern').build('expression').field('expression', def('Expression'));
        [
            'TSAnyKeyword',
            'TSBigIntKeyword',
            'TSBooleanKeyword',
            'TSNeverKeyword',
            'TSNullKeyword',
            'TSNumberKeyword',
            'TSObjectKeyword',
            'TSStringKeyword',
            'TSSymbolKeyword',
            'TSUndefinedKeyword',
            'TSUnknownKeyword',
            'TSVoidKeyword',
            'TSIntrinsicKeyword',
            'TSThisType'
        ].forEach(keywordType => {
            def(keywordType).bases('TSType').build();
        });
        def('TSArrayType').bases('TSType').build('elementType').field('elementType', def('TSType'));
        def('TSLiteralType').bases('TSType').build('literal').field('literal', or(def('NumericLiteral'), def('StringLiteral'), def('BooleanLiteral'), def('TemplateLiteral'), def('UnaryExpression'), def('BigIntLiteral')));
        def('TemplateLiteral').field('expressions', or([def('Expression')], [def('TSType')]));
        [
            'TSUnionType',
            'TSIntersectionType'
        ].forEach(typeName => {
            def(typeName).bases('TSType').build('types').field('types', [def('TSType')]);
        });
        def('TSConditionalType').bases('TSType').build('checkType', 'extendsType', 'trueType', 'falseType').field('checkType', def('TSType')).field('extendsType', def('TSType')).field('trueType', def('TSType')).field('falseType', def('TSType'));
        def('TSInferType').bases('TSType').build('typeParameter').field('typeParameter', def('TSTypeParameter'));
        def('TSParenthesizedType').bases('TSType').build('typeAnnotation').field('typeAnnotation', def('TSType'));
        var ParametersType = [or(def('Identifier'), def('RestElement'), def('ArrayPattern'), def('ObjectPattern'))];
        [
            'TSFunctionType',
            'TSConstructorType'
        ].forEach(typeName => {
            def(typeName).bases('TSType', 'TSHasOptionalTypeParameters', 'TSHasOptionalTypeAnnotation').build('parameters').field('parameters', ParametersType);
        });
        def('TSDeclareFunction').bases('Declaration', 'TSHasOptionalTypeParameters').build('id', 'params', 'returnType').field('declare', Boolean, defaults['false']).field('async', Boolean, defaults['false']).field('generator', Boolean, defaults['false']).field('id', or(def('Identifier'), null), defaults['null']).field('params', [def('Pattern')]).field('returnType', or(def('TSTypeAnnotation'), def('Noop'), null), defaults['null']);
        def('TSDeclareMethod').bases('Declaration', 'TSHasOptionalTypeParameters').build('key', 'params', 'returnType').field('async', Boolean, defaults['false']).field('generator', Boolean, defaults['false']).field('params', [def('Pattern')]).field('abstract', Boolean, defaults['false']).field('accessibility', or('public', 'private', 'protected', void 0), defaults['undefined']).field('static', Boolean, defaults['false']).field('computed', Boolean, defaults['false']).field('optional', Boolean, defaults['false']).field('key', or(def('Identifier'), def('StringLiteral'), def('NumericLiteral'), def('Expression'))).field('kind', or('get', 'set', 'method', 'constructor'), function getDefault() {
            return 'method';
        }).field('access', or('public', 'private', 'protected', void 0), defaults['undefined']).field('decorators', or([def('Decorator')], null), defaults['null']).field('returnType', or(def('TSTypeAnnotation'), def('Noop'), null), defaults['null']);
        def('TSMappedType').bases('TSType').build('typeParameter', 'typeAnnotation').field('readonly', or(Boolean, '+', '-'), defaults['false']).field('typeParameter', def('TSTypeParameter')).field('optional', or(Boolean, '+', '-'), defaults['false']).field('typeAnnotation', or(def('TSType'), null), defaults['null']);
        def('TSTupleType').bases('TSType').build('elementTypes').field('elementTypes', [or(def('TSType'), def('TSNamedTupleMember'))]);
        def('TSNamedTupleMember').bases('TSType').build('label', 'elementType', 'optional').field('label', def('Identifier')).field('optional', Boolean, defaults['false']).field('elementType', def('TSType'));
        def('TSRestType').bases('TSType').build('typeAnnotation').field('typeAnnotation', def('TSType'));
        def('TSOptionalType').bases('TSType').build('typeAnnotation').field('typeAnnotation', def('TSType'));
        def('TSIndexedAccessType').bases('TSType').build('objectType', 'indexType').field('objectType', def('TSType')).field('indexType', def('TSType'));
        def('TSTypeOperator').bases('TSType').build('operator').field('operator', String).field('typeAnnotation', def('TSType'));
        def('TSTypeAnnotation').bases('Node').build('typeAnnotation').field('typeAnnotation', or(def('TSType'), def('TSTypeAnnotation')));
        def('TSIndexSignature').bases('Declaration', 'TSHasOptionalTypeAnnotation').build('parameters', 'typeAnnotation').field('parameters', [def('Identifier')]).field('readonly', Boolean, defaults['false']);
        def('TSPropertySignature').bases('Declaration', 'TSHasOptionalTypeAnnotation').build('key', 'typeAnnotation', 'optional').field('key', def('Expression')).field('computed', Boolean, defaults['false']).field('readonly', Boolean, defaults['false']).field('optional', Boolean, defaults['false']).field('initializer', or(def('Expression'), null), defaults['null']);
        def('TSMethodSignature').bases('Declaration', 'TSHasOptionalTypeParameters', 'TSHasOptionalTypeAnnotation').build('key', 'parameters', 'typeAnnotation').field('key', def('Expression')).field('computed', Boolean, defaults['false']).field('optional', Boolean, defaults['false']).field('parameters', ParametersType);
        def('TSTypePredicate').bases('TSTypeAnnotation', 'TSType').build('parameterName', 'typeAnnotation', 'asserts').field('parameterName', or(def('Identifier'), def('TSThisType'))).field('typeAnnotation', or(def('TSTypeAnnotation'), null), defaults['null']).field('asserts', Boolean, defaults['false']);
        [
            'TSCallSignatureDeclaration',
            'TSConstructSignatureDeclaration'
        ].forEach(typeName => {
            def(typeName).bases('Declaration', 'TSHasOptionalTypeParameters', 'TSHasOptionalTypeAnnotation').build('parameters', 'typeAnnotation').field('parameters', ParametersType);
        });
        def('TSEnumMember').bases('Node').build('id', 'initializer').field('id', or(def('Identifier'), StringLiteral)).field('initializer', or(def('Expression'), null), defaults['null']);
        def('TSTypeQuery').bases('TSType').build('exprName').field('exprName', or(TSEntityName, def('TSImportType')));
        var TSTypeMember = or(def('TSCallSignatureDeclaration'), def('TSConstructSignatureDeclaration'), def('TSIndexSignature'), def('TSMethodSignature'), def('TSPropertySignature'));
        def('TSTypeLiteral').bases('TSType').build('members').field('members', [TSTypeMember]);
        def('TSTypeParameter').bases('Identifier').build('name', 'constraint', 'default').field('name', or(def('Identifier'), String)).field('constraint', or(def('TSType'), void 0), defaults['undefined']).field('default', or(def('TSType'), void 0), defaults['undefined']);
        def('TSTypeAssertion').bases('Expression', 'Pattern').build('typeAnnotation', 'expression').field('typeAnnotation', def('TSType')).field('expression', def('Expression')).field('extra', or({ parenthesized: Boolean }, null), defaults['null']);
        def('TSTypeParameterDeclaration').bases('Declaration').build('params').field('params', [def('TSTypeParameter')]);
        def('TSInstantiationExpression').bases('Expression', 'TSHasOptionalTypeParameterInstantiation').build('expression', 'typeParameters').field('expression', def('Expression'));
        def('TSTypeParameterInstantiation').bases('Node').build('params').field('params', [def('TSType')]);
        def('TSEnumDeclaration').bases('Declaration').build('id', 'members').field('id', def('Identifier')).field('const', Boolean, defaults['false']).field('declare', Boolean, defaults['false']).field('members', [def('TSEnumMember')]).field('initializer', or(def('Expression'), null), defaults['null']);
        def('TSTypeAliasDeclaration').bases('Declaration', 'TSHasOptionalTypeParameters').build('id', 'typeAnnotation').field('id', def('Identifier')).field('declare', Boolean, defaults['false']).field('typeAnnotation', def('TSType'));
        def('TSModuleBlock').bases('Node').build('body').field('body', [def('Statement')]);
        def('TSModuleDeclaration').bases('Declaration').build('id', 'body').field('id', or(StringLiteral, TSEntityName)).field('declare', Boolean, defaults['false']).field('global', Boolean, defaults['false']).field('body', or(def('TSModuleBlock'), def('TSModuleDeclaration'), null), defaults['null']);
        def('TSImportType').bases('TSType', 'TSHasOptionalTypeParameterInstantiation').build('argument', 'qualifier', 'typeParameters').field('argument', StringLiteral).field('qualifier', or(TSEntityName, void 0), defaults['undefined']);
        def('TSImportEqualsDeclaration').bases('Declaration').build('id', 'moduleReference').field('id', def('Identifier')).field('isExport', Boolean, defaults['false']).field('moduleReference', or(TSEntityName, def('TSExternalModuleReference')));
        def('TSExternalModuleReference').bases('Declaration').build('expression').field('expression', StringLiteral);
        def('TSExportAssignment').bases('Statement').build('expression').field('expression', def('Expression'));
        def('TSNamespaceExportDeclaration').bases('Declaration').build('id').field('id', def('Identifier'));
        def('TSInterfaceBody').bases('Node').build('body').field('body', [TSTypeMember]);
        def('TSExpressionWithTypeArguments').bases('TSType', 'TSHasOptionalTypeParameterInstantiation').build('expression', 'typeParameters').field('expression', TSEntityName);
        def('TSInterfaceDeclaration').bases('Declaration', 'TSHasOptionalTypeParameters').build('id', 'body').field('id', TSEntityName).field('declare', Boolean, defaults['false']).field('extends', or([def('TSExpressionWithTypeArguments')], null), defaults['null']).field('body', def('TSInterfaceBody'));
        def('TSParameterProperty').bases('Pattern').build('parameter').field('accessibility', or('public', 'private', 'protected', void 0), defaults['undefined']).field('readonly', Boolean, defaults['false']).field('parameter', or(def('Identifier'), def('AssignmentPattern')));
        def('ClassProperty').field('access', or('public', 'private', 'protected', void 0), defaults['undefined']);
        def('ClassAccessorProperty').bases('Declaration', 'TSHasOptionalTypeAnnotation');
        def('ClassBody').field('body', [or(def('MethodDefinition'), def('VariableDeclarator'), def('ClassPropertyDefinition'), def('ClassProperty'), def('ClassPrivateProperty'), def('ClassAccessorProperty'), def('ClassMethod'), def('ClassPrivateMethod'), def('StaticBlock'), def('TSDeclareMethod'), TSTypeMember)]);
    };
    ;
});
define('skylark-asttypes/gen/namedTypes',[],function () {
    'use strict';
    return {};
});
define('skylark-asttypes/gen/visitor',[],function () {
    'use strict';
    return {};
});
define('skylark-asttypes/main',[
    './fork',
    './def/es-proposals',
    './def/jsx',
    './def/flow',
    './def/esprima',
    './def/babel',
    './def/typescript',
    './types',
    './gen/namedTypes',
    './gen/visitor'
], function (fork, esProposalsDef, jsxDef, flowDef, esprimaDef, babelDef, typescriptDef, m_types, m_namedTypes, m_visitor) {
    'use strict';
    const {ASTNode, AnyType, Field} = m_types;
    const {namedTypes} = m_namedTypes;
    const {Visitor} = m_visitor;
    const {
        astNodesAreEquivalent,
        builders,
        builtInTypes,
        defineMethod,
        eachField,
        finalize,
        getBuilderName,
        getFieldNames,
        getFieldValue,
        getSupertypeNames,
        namedTypes: n,
        NodePath,
        Path,
        PathVisitor,
        someField,
        Type,
        use,
        visit
    } = fork([
        esProposalsDef,
        jsxDef,
        flowDef,
        esprimaDef,
        babelDef,
        typescriptDef
    ]);
    Object.assign(namedTypes, n);
    return {
        AnyType,
        ASTNode,
        astNodesAreEquivalent,
        builders,
        builtInTypes,
        defineMethod,
        eachField,
        Field,
        finalize,
        getBuilderName,
        getFieldNames,
        getFieldValue,
        getSupertypeNames,
        namedTypes,
        NodePath,
        Path,
        PathVisitor,
        someField,
        Type,
        use,
        visit,
        Visitor
    };
});
define('skylark-asttypes', ['skylark-asttypes/main'], function (main) { return main; });


},this);
//# sourceMappingURL=sourcemaps/skylark-asttypes.js.map
