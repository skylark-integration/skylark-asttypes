/**
 * skylark-asttypes - A version of asttypes that ported to running on skylarkjs.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["./es2018","../types","../shared"],function(e,s,t){"use strict";return function(u){u.use(e);const n=u.use(s),a=n.Type.def,l=n.Type.or,r=u.use(t).defaults;a("CatchClause").field("param",l(a("Pattern"),null),r.null)}});
//# sourceMappingURL=../sourcemaps/def/es2019.js.map
