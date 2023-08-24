/**
 * skylark-asttypes - A version of asttypes that ported to running on skylarkjs.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["./core"],function(n){"use strict";return function(r){const e=r.use(n);return e.BinaryOperators.indexOf("**")<0&&e.BinaryOperators.push("**"),e.AssignmentOperators.indexOf("**=")<0&&e.AssignmentOperators.push("**="),e}});
//# sourceMappingURL=../../sourcemaps/def/operators/es2016.js.map
