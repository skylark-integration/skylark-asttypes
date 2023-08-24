/**
 * skylark-asttypes - A version of asttypes that ported to running on skylarkjs.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["./es-proposals","../types","../shared"],function(e,n,i){"use strict";return function(s){s.use(e);const t=s.use(n),l=t.Type.def,r=t.Type.or,a=s.use(i).defaults;l("JSXAttribute").bases("Node").build("name","value").field("name",r(l("JSXIdentifier"),l("JSXNamespacedName"))).field("value",r(l("Literal"),l("JSXExpressionContainer"),l("JSXElement"),l("JSXFragment"),null),a.null),l("JSXIdentifier").bases("Identifier").build("name").field("name",String),l("JSXNamespacedName").bases("Node").build("namespace","name").field("namespace",l("JSXIdentifier")).field("name",l("JSXIdentifier")),l("JSXMemberExpression").bases("MemberExpression").build("object","property").field("object",r(l("JSXIdentifier"),l("JSXMemberExpression"))).field("property",l("JSXIdentifier")).field("computed",Boolean,a.false);const d=r(l("JSXIdentifier"),l("JSXNamespacedName"),l("JSXMemberExpression"));l("JSXSpreadAttribute").bases("Node").build("argument").field("argument",l("Expression"));const o=[r(l("JSXAttribute"),l("JSXSpreadAttribute"))];l("JSXExpressionContainer").bases("Expression").build("expression").field("expression",r(l("Expression"),l("JSXEmptyExpression")));const m=[r(l("JSXText"),l("JSXExpressionContainer"),l("JSXSpreadChild"),l("JSXElement"),l("JSXFragment"),l("Literal"))];l("JSXElement").bases("Expression").build("openingElement","closingElement","children").field("openingElement",l("JSXOpeningElement")).field("closingElement",r(l("JSXClosingElement"),null),a.null).field("children",m,a.emptyArray).field("name",d,function(){return this.openingElement.name},!0).field("selfClosing",Boolean,function(){return this.openingElement.selfClosing},!0).field("attributes",o,function(){return this.openingElement.attributes},!0),l("JSXOpeningElement").bases("Node").build("name","attributes","selfClosing").field("name",d).field("attributes",o,a.emptyArray).field("selfClosing",Boolean,a.false),l("JSXClosingElement").bases("Node").build("name").field("name",d),l("JSXFragment").bases("Expression").build("openingFragment","closingFragment","children").field("openingFragment",l("JSXOpeningFragment")).field("closingFragment",l("JSXClosingFragment")).field("children",m,a.emptyArray),l("JSXOpeningFragment").bases("Node").build(),l("JSXClosingFragment").bases("Node").build(),l("JSXText").bases("Literal").build("value","raw").field("value",String).field("raw",String,function(){return this.value}),l("JSXEmptyExpression").bases("Node").build(),l("JSXSpreadChild").bases("Node").build("expression").field("expression",l("Expression"))}});
//# sourceMappingURL=../sourcemaps/def/jsx.js.map