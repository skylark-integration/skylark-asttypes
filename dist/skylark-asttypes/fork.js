/**
 * skylark-asttypes - A version of asttypes that ported to running on skylarkjs.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["./types","./path-visitor","./equiv","./path","./node-path"],function(e,t,i,s,u){"use strict";return function(n){const a=function(){const e=[],t=[];var i={use:function(s){var u=e.indexOf(s);return-1===u&&(u=e.length,e.push(s),t[u]=s(i)),t[u]}};return i}(),d=a.use(e);n.forEach(a.use),d.finalize();const l=a.use(t);return{Type:d.Type,builtInTypes:d.builtInTypes,namedTypes:d.namedTypes,builders:d.builders,defineMethod:d.defineMethod,getFieldNames:d.getFieldNames,getFieldValue:d.getFieldValue,eachField:d.eachField,someField:d.someField,getSupertypeNames:d.getSupertypeNames,getBuilderName:d.getBuilderName,astNodesAreEquivalent:a.use(i),finalize:d.finalize,Path:a.use(s),NodePath:a.use(u),PathVisitor:l,use:a.use,visit:l.visit}}});
//# sourceMappingURL=sourcemaps/fork.js.map
