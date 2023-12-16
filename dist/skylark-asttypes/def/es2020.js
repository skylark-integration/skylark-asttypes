/**
 * skylark-asttypes - A version of asttypes that ported to running on skylarkjs.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["./operators/es2020","./es2019","../types","../shared"],function(i,n,l,r){"use strict";return function(e){e.use(i),e.use(n);var s=e.use(l),o=s.Type.def,s=s.Type.or,e=e.use(r).defaults;o("ImportExpression").bases("Expression").build("source").field("source",o("Expression")),o("ExportAllDeclaration").bases("Declaration").build("source","exported").field("source",o("Literal")).field("exported",s(o("Identifier"),null,void 0),e.null),o("ChainElement").bases("Node").field("optional",Boolean,e.false),o("CallExpression").bases("Expression","ChainElement"),o("MemberExpression").bases("Expression","ChainElement"),o("ChainExpression").bases("Expression").build("expression").field("expression",o("ChainElement")),o("OptionalCallExpression").bases("CallExpression").build("callee","arguments","optional").field("optional",Boolean,e.true),o("OptionalMemberExpression").bases("MemberExpression").build("object","property","computed","optional").field("optional",Boolean,e.true)}});
//# sourceMappingURL=../sourcemaps/def/es2020.js.map
