/**
 * skylark-asttypes - A version of asttypes that ported to running on skylarkjs.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["./types"],function(n){"use strict";return function(r){var t=r.use(n),e=t.Type,u=t.builtInTypes,i=u.number;var f=e.or(u.string,u.number,u.boolean,u.null,u.undefined);return{geq:function(n){return e.from(r=>i.check(r)&&r>=n,i+" >= "+n)},defaults:{null:function(){return null},emptyArray:function(){return[]},false:function(){return!1},true:function(){return!0},undefined:function(){},"use strict":function(){return"use strict"}},isPrimitive:e.from(n=>{if(null===n)return!0;var r=typeof n;return"object"!==r&&"function"!==r},f.toString())}}});
//# sourceMappingURL=sourcemaps/shared.js.map
