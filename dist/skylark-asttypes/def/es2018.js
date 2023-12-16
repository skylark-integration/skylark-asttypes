/**
 * skylark-asttypes - A version of asttypes that ported to running on skylarkjs.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["./es2017","../types","../shared"],function(a,n,p){"use strict";return function(e){e.use(a);var r=e.use(n),t=r.Type.def,r=r.Type.or,e=e.use(p).defaults;t("ForOfStatement").field("await",Boolean,e.false),t("SpreadProperty").bases("Node").build("argument").field("argument",t("Expression")),t("ObjectExpression").field("properties",[r(t("Property"),t("SpreadProperty"),t("SpreadElement"))]),t("TemplateElement").field("value",{cooked:r(String,null),raw:String}),t("SpreadPropertyPattern").bases("Pattern").build("argument").field("argument",t("Pattern")),t("ObjectPattern").field("properties",[r(t("PropertyPattern"),t("Property"),t("RestElement"),t("SpreadPropertyPattern"))])}});
//# sourceMappingURL=../sourcemaps/def/es2018.js.map
