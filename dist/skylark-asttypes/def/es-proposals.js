/**
 * skylark-asttypes - A version of asttypes that ported to running on skylarkjs.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["../types","./es2022"],function(o,t){"use strict";return function(e){e.use(t);var r=e.use(o),s=r.Type;const l=r.Type.def;r=s.or;const i=e.use(sharedPlugin).defaults;l("AwaitExpression").build("argument","all").field("argument",r(l("Expression"),null)).field("all",Boolean,i.false),l("Decorator").bases("Node").build("expression").field("expression",l("Expression")),l("Property").field("decorators",r([l("Decorator")],null),i.null),l("MethodDefinition").field("decorators",r([l("Decorator")],null),i.null),l("PrivateName").bases("Expression","Pattern").build("id").field("id",l("Identifier")),l("ClassPrivateProperty").bases("ClassProperty").build("key","value").field("key",l("PrivateName")).field("value",r(l("Expression"),null),i.null),l("ImportAttribute").bases("Node").build("key","value").field("key",r(l("Identifier"),l("Literal"))).field("value",l("Expression")),["ImportDeclaration","ExportAllDeclaration","ExportNamedDeclaration"].forEach(e=>{l(e).field("assertions",[l("ImportAttribute")],i.emptyArray)}),l("RecordExpression").bases("Expression").build("properties").field("properties",[r(l("ObjectProperty"),l("ObjectMethod"),l("SpreadElement"))]),l("TupleExpression").bases("Expression").build("elements").field("elements",[r(l("Expression"),l("SpreadElement"),null)]),l("ModuleExpression").bases("Node").build("body").field("body",l("Program"))}});
//# sourceMappingURL=../sourcemaps/def/es-proposals.js.map
