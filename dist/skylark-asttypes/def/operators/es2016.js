/**
 * skylark-asttypes - A version of asttypes that ported to running on skylarkjs.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["./core"],function(e){"use strict";return function(r){r=r.use(e);return r.BinaryOperators.indexOf("**")<0&&r.BinaryOperators.push("**"),r.AssignmentOperators.indexOf("**=")<0&&r.AssignmentOperators.push("**="),r}});
//# sourceMappingURL=../../sourcemaps/def/operators/es2016.js.map
