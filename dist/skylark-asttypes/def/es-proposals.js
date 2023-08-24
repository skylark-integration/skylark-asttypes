/**
 * skylark-asttypes - A version of asttypes that ported to running on skylarkjs.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["../types","./es2022"],function(e,r){"use strict";return function(s){s.use(r);const l=s.use(e),i=l.Type,o=l.Type.def,t=i.or,a=s.use(sharedPlugin).defaults;o("AwaitExpression").build("argument","all").field("argument",t(o("Expression"),null)).field("all",Boolean,a.false),o("Decorator").bases("Node").build("expression").field("expression",o("Expression")),o("Property").field("decorators",t([o("Decorator")],null),a.null),o("MethodDefinition").field("decorators",t([o("Decorator")],null),a.null),o("PrivateName").bases("Expression","Pattern").build("id").field("id",o("Identifier")),o("ClassPrivateProperty").bases("ClassProperty").build("key","value").field("key",o("PrivateName")).field("value",t(o("Expression"),null),a.null),o("ImportAttribute").bases("Node").build("key","value").field("key",t(o("Identifier"),o("Literal"))).field("value",o("Expression")),["ImportDeclaration","ExportAllDeclaration","ExportNamedDeclaration"].forEach(e=>{o(e).field("assertions",[o("ImportAttribute")],a.emptyArray)}),o("RecordExpression").bases("Expression").build("properties").field("properties",[t(o("ObjectProperty"),o("ObjectMethod"),o("SpreadElement"))]),o("TupleExpression").bases("Expression").build("elements").field("elements",[t(o("Expression"),o("SpreadElement"),null)]),o("ModuleExpression").bases("Node").build("body").field("body",o("Program"))}});
//# sourceMappingURL=../sourcemaps/def/es-proposals.js.map
