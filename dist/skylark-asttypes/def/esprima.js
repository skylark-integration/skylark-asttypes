/**
 * skylark-asttypes - A version of asttypes that ported to running on skylarkjs.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["./es-proposals","../types","../shared"],function(e,r,i){"use strict";return function(a){a.use(e);var t=a.use(r),l=a.use(i).defaults,n=t.Type.def,o=t.Type.or;n("VariableDeclaration").field("declarations",[o(n("VariableDeclarator"),n("Identifier"))]),n("Property").field("value",o(n("Expression"),n("Pattern"))),n("ArrayPattern").field("elements",[o(n("Pattern"),n("SpreadElement"),null)]),n("ObjectPattern").field("properties",[o(n("Property"),n("PropertyPattern"),n("SpreadPropertyPattern"),n("SpreadProperty"))]),n("ExportSpecifier").bases("ModuleSpecifier").build("id","name"),n("ExportBatchSpecifier").bases("Specifier").build(),n("ExportDeclaration").bases("Declaration").build("default","declaration","specifiers","source").field("default",Boolean).field("declaration",o(n("Declaration"),n("Expression"),null)).field("specifiers",[o(n("ExportSpecifier"),n("ExportBatchSpecifier"))],l.emptyArray).field("source",o(n("Literal"),null),l.null),n("Block").bases("Comment").build("value","leading","trailing"),n("Line").bases("Comment").build("value","leading","trailing")}});
//# sourceMappingURL=../sourcemaps/def/esprima.js.map
