define(['./types'], function (typesPlugin) {
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