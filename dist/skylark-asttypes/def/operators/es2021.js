/**
 * skylark-asttypes - A version of asttypes that ported to running on skylarkjs.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["./es2020"],function(n){"use strict";return function(s){const e=s.use(n);return e.LogicalOperators.forEach(n=>{const s=n+"=";e.AssignmentOperators.indexOf(s)<0&&e.AssignmentOperators.push(s)}),e}});
//# sourceMappingURL=../../sourcemaps/def/operators/es2021.js.map
