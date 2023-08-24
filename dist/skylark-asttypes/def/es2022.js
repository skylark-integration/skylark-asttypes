/**
 * skylark-asttypes - A version of asttypes that ported to running on skylarkjs.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["./es2021","../types"],function(e,t){"use strict";return function(n){n.use(e);const s=n.use(t).Type.def;s("StaticBlock").bases("Declaration").build("body").field("body",[s("Statement")])}});
//# sourceMappingURL=../sourcemaps/def/es2022.js.map
