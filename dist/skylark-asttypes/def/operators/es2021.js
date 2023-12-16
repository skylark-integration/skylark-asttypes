/**
 * skylark-asttypes - A version of asttypes that ported to running on skylarkjs.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["./es2020"],function(s){"use strict";return function(e){const n=e.use(s);return n.LogicalOperators.forEach(e=>{e+="=";n.AssignmentOperators.indexOf(e)<0&&n.AssignmentOperators.push(e)}),n}});
//# sourceMappingURL=../../sourcemaps/def/operators/es2021.js.map
