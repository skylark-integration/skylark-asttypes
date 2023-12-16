/**
 * skylark-asttypes - A version of asttypes that ported to running on skylarkjs.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["./types","./path-visitor","./equiv","./path","./node-path"],function(s,u,a,n,d){"use strict";function r(){const t=[],s=[];var u={use:function(e){var i=t.indexOf(e);return-1===i&&(i=t.length,t.push(e),s[i]=e(u)),s[i]}};return u}return function(e){var i=r(),t=i.use(s),e=(e.forEach(i.use),t.finalize(),i.use(u));return{Type:t.Type,builtInTypes:t.builtInTypes,namedTypes:t.namedTypes,builders:t.builders,defineMethod:t.defineMethod,getFieldNames:t.getFieldNames,getFieldValue:t.getFieldValue,eachField:t.eachField,someField:t.someField,getSupertypeNames:t.getSupertypeNames,getBuilderName:t.getBuilderName,astNodesAreEquivalent:i.use(a),finalize:t.finalize,Path:i.use(n),NodePath:i.use(d),PathVisitor:e,use:i.use,visit:e.visit}}});
//# sourceMappingURL=sourcemaps/fork.js.map
