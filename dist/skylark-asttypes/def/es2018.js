/**
 * skylark-asttypes - A version of asttypes that ported to running on skylarkjs.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["./es2017","../types","../shared"],function(e,t,r){"use strict";return function(a){a.use(e);const n=a.use(t),p=n.Type.def,s=n.Type.or,o=a.use(r).defaults;p("ForOfStatement").field("await",Boolean,o.false),p("SpreadProperty").bases("Node").build("argument").field("argument",p("Expression")),p("ObjectExpression").field("properties",[s(p("Property"),p("SpreadProperty"),p("SpreadElement"))]),p("TemplateElement").field("value",{cooked:s(String,null),raw:String}),p("SpreadPropertyPattern").bases("Pattern").build("argument").field("argument",p("Pattern")),p("ObjectPattern").field("properties",[s(p("PropertyPattern"),p("Property"),p("RestElement"),p("SpreadPropertyPattern"))])}});
//# sourceMappingURL=../sourcemaps/def/es2018.js.map
