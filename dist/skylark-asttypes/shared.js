/**
 * skylark-asttypes - A version of asttypes that ported to running on skylarkjs.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["./types"],function(t){"use strict";return function(n){var n=n.use(t),e=n.Type,n=n.builtInTypes,u=n.number;n=e.or(n.string,n.number,n.boolean,n.null,n.undefined);return{geq:function(t){return e.from(n=>u.check(n)&&t<=n,u+" >= "+t)},defaults:{null:function(){return null},emptyArray:function(){return[]},false:function(){return!1},true:function(){return!0},undefined:function(){},"use strict":function(){return"use strict"}},isPrimitive:e.from(n=>{return null===n||"object"!=(n=typeof n)&&"function"!=n},n.toString())}}});
//# sourceMappingURL=sourcemaps/shared.js.map
