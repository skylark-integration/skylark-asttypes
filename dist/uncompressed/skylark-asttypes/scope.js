define(['./types'], function (typesPlugin) {
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