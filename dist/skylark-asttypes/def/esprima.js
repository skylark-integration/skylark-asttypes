/**
 * skylark-asttypes - A version of asttypes that ported to running on skylarkjs.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["./es-proposals","../types","../shared"],function(a,t,l){"use strict";return function(e){e.use(a);var r=e.use(t),e=e.use(l).defaults,i=r.Type.def,r=r.Type.or;i("VariableDeclaration").field("declarations",[r(i("VariableDeclarator"),i("Identifier"))]),i("Property").field("value",r(i("Expression"),i("Pattern"))),i("ArrayPattern").field("elements",[r(i("Pattern"),i("SpreadElement"),null)]),i("ObjectPattern").field("properties",[r(i("Property"),i("PropertyPattern"),i("SpreadPropertyPattern"),i("SpreadProperty"))]),i("ExportSpecifier").bases("ModuleSpecifier").build("id","name"),i("ExportBatchSpecifier").bases("Specifier").build(),i("ExportDeclaration").bases("Declaration").build("default","declaration","specifiers","source").field("default",Boolean).field("declaration",r(i("Declaration"),i("Expression"),null)).field("specifiers",[r(i("ExportSpecifier"),i("ExportBatchSpecifier"))],e.emptyArray).field("source",r(i("Literal"),null),e.null),i("Block").bases("Comment").build("value","leading","trailing"),i("Line").bases("Comment").build("value","leading","trailing")}});
//# sourceMappingURL=../sourcemaps/def/esprima.js.map
