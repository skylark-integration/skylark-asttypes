/**
 * skylark-asttypes - A version of asttypes that ported to running on skylarkjs.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["./es2018","../types","../shared"],function(t,n,a){"use strict";return function(e){e.use(t);var u=e.use(n),s=u.Type.def,u=u.Type.or,e=e.use(a).defaults;s("CatchClause").field("param",u(s("Pattern"),null),e.null)}});
//# sourceMappingURL=../sourcemaps/def/es2019.js.map
