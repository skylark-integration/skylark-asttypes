/**
 * skylark-asttypes - A version of asttypes that ported to running on skylarkjs.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["./es2016","../types","../shared"],function(n,i,u){"use strict";return function(e){e.use(n);var s=e.use(i).Type.def,e=e.use(u).defaults;s("Function").field("async",Boolean,e.false),s("AwaitExpression").bases("Expression").build("argument").field("argument",s("Expression"))}});
//# sourceMappingURL=../sourcemaps/def/es2017.js.map
