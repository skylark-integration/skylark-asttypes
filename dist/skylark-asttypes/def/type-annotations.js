/**
 * skylark-asttypes - A version of asttypes that ported to running on skylarkjs.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["../types","../shared"],function(e,t){"use strict";return function(n){var l=n.use(e),a=l.Type.def,i=l.Type.or,r=n.use(t).defaults,s=i(a("TypeAnnotation"),a("TSTypeAnnotation"),null),o=i(a("TypeParameterDeclaration"),a("TSTypeParameterDeclaration"),null);a("Identifier").field("typeAnnotation",s,r.null),a("ObjectPattern").field("typeAnnotation",s,r.null),a("Function").field("returnType",s,r.null).field("typeParameters",o,r.null),a("ClassProperty").build("key","value","typeAnnotation","static").field("value",i(a("Expression"),null)).field("static",Boolean,r.false).field("typeAnnotation",s,r.null),["ClassDeclaration","ClassExpression"].forEach(e=>{a(e).field("typeParameters",o,r.null).field("superTypeParameters",i(a("TypeParameterInstantiation"),a("TSTypeParameterInstantiation"),null),r.null).field("implements",i([a("ClassImplements")],[a("TSExpressionWithTypeArguments")]),r.emptyArray)})}});
//# sourceMappingURL=../sourcemaps/def/type-annotations.js.map
