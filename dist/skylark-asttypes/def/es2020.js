/**
 * skylark-asttypes - A version of asttypes that ported to running on skylarkjs.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["./operators/es2020","./es2019","../types","../shared"],function(e,s,o,i){"use strict";return function(n){n.use(e),n.use(s);const l=n.use(o),r=l.Type.def,a=l.Type.or,t=n.use(i).defaults;r("ImportExpression").bases("Expression").build("source").field("source",r("Expression")),r("ExportAllDeclaration").bases("Declaration").build("source","exported").field("source",r("Literal")).field("exported",a(r("Identifier"),null,void 0),t.null),r("ChainElement").bases("Node").field("optional",Boolean,t.false),r("CallExpression").bases("Expression","ChainElement"),r("MemberExpression").bases("Expression","ChainElement"),r("ChainExpression").bases("Expression").build("expression").field("expression",r("ChainElement")),r("OptionalCallExpression").bases("CallExpression").build("callee","arguments","optional").field("optional",Boolean,t.true),r("OptionalMemberExpression").bases("MemberExpression").build("object","property","computed","optional").field("optional",Boolean,t.true)}});
//# sourceMappingURL=../sourcemaps/def/es2020.js.map
