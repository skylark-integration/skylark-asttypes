/**
 * skylark-asttypes - A version of asttypes that ported to running on skylarkjs.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["../types","../shared"],function(r,s){"use strict";return function(e){var t=e.use(r),n=t.Type.def,l=t.Type.or,a=e.use(s).defaults,t=l(n("TypeAnnotation"),n("TSTypeAnnotation"),null),i=l(n("TypeParameterDeclaration"),n("TSTypeParameterDeclaration"),null);n("Identifier").field("typeAnnotation",t,a.null),n("ObjectPattern").field("typeAnnotation",t,a.null),n("Function").field("returnType",t,a.null).field("typeParameters",i,a.null),n("ClassProperty").build("key","value","typeAnnotation","static").field("value",l(n("Expression"),null)).field("static",Boolean,a.false).field("typeAnnotation",t,a.null),["ClassDeclaration","ClassExpression"].forEach(e=>{n(e).field("typeParameters",i,a.null).field("superTypeParameters",l(n("TypeParameterInstantiation"),n("TSTypeParameterInstantiation"),null),a.null).field("implements",l([n("ClassImplements")],[n("TSExpressionWithTypeArguments")]),a.emptyArray)})}});
//# sourceMappingURL=../sourcemaps/def/type-annotations.js.map
