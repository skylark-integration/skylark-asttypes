/**
 * skylark-asttypes - A version of asttypes that ported to running on skylarkjs.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["./es2021","../types"],function(t,i){"use strict";return function(e){e.use(t);e=e.use(i).Type.def;e("StaticBlock").bases("Declaration").build("body").field("body",[e("Statement")])}});
//# sourceMappingURL=../sourcemaps/def/es2022.js.map
