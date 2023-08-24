/**
 * skylark-asttypes - A version of asttypes that ported to running on skylarkjs.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["./es-proposals","./type-annotations","../types","../shared"],function(e,i,l,a){"use strict";return function(n){n.use(e),n.use(i);const t=n.use(l),o=t.Type.def,d=t.Type.or,r=n.use(a).defaults;o("Flow").bases("Node"),o("FlowType").bases("Flow"),o("AnyTypeAnnotation").bases("FlowType").build(),o("EmptyTypeAnnotation").bases("FlowType").build(),o("MixedTypeAnnotation").bases("FlowType").build(),o("VoidTypeAnnotation").bases("FlowType").build(),o("SymbolTypeAnnotation").bases("FlowType").build(),o("NumberTypeAnnotation").bases("FlowType").build(),o("BigIntTypeAnnotation").bases("FlowType").build(),o("NumberLiteralTypeAnnotation").bases("FlowType").build("value","raw").field("value",Number).field("raw",String),o("NumericLiteralTypeAnnotation").bases("FlowType").build("value","raw").field("value",Number).field("raw",String),o("BigIntLiteralTypeAnnotation").bases("FlowType").build("value","raw").field("value",null).field("raw",String),o("StringTypeAnnotation").bases("FlowType").build(),o("StringLiteralTypeAnnotation").bases("FlowType").build("value","raw").field("value",String).field("raw",String),o("BooleanTypeAnnotation").bases("FlowType").build(),o("BooleanLiteralTypeAnnotation").bases("FlowType").build("value","raw").field("value",Boolean).field("raw",String),o("TypeAnnotation").bases("Node").build("typeAnnotation").field("typeAnnotation",o("FlowType")),o("NullableTypeAnnotation").bases("FlowType").build("typeAnnotation").field("typeAnnotation",o("FlowType")),o("NullLiteralTypeAnnotation").bases("FlowType").build(),o("NullTypeAnnotation").bases("FlowType").build(),o("ThisTypeAnnotation").bases("FlowType").build(),o("ExistsTypeAnnotation").bases("FlowType").build(),o("ExistentialTypeParam").bases("FlowType").build(),o("FunctionTypeAnnotation").bases("FlowType").build("params","returnType","rest","typeParameters").field("params",[o("FunctionTypeParam")]).field("returnType",o("FlowType")).field("rest",d(o("FunctionTypeParam"),null)).field("typeParameters",d(o("TypeParameterDeclaration"),null)),o("FunctionTypeParam").bases("Node").build("name","typeAnnotation","optional").field("name",d(o("Identifier"),null)).field("typeAnnotation",o("FlowType")).field("optional",Boolean),o("ArrayTypeAnnotation").bases("FlowType").build("elementType").field("elementType",o("FlowType")),o("ObjectTypeAnnotation").bases("FlowType").build("properties","indexers","callProperties").field("properties",[d(o("ObjectTypeProperty"),o("ObjectTypeSpreadProperty"))]).field("indexers",[o("ObjectTypeIndexer")],r.emptyArray).field("callProperties",[o("ObjectTypeCallProperty")],r.emptyArray).field("inexact",d(Boolean,void 0),r[void 0]).field("exact",Boolean,r.false).field("internalSlots",[o("ObjectTypeInternalSlot")],r.emptyArray),o("Variance").bases("Node").build("kind").field("kind",d("plus","minus"));const p=d(o("Variance"),"plus","minus",null);o("ObjectTypeProperty").bases("Node").build("key","value","optional").field("key",d(o("Literal"),o("Identifier"))).field("value",o("FlowType")).field("optional",Boolean).field("variance",p,r.null),o("ObjectTypeIndexer").bases("Node").build("id","key","value").field("id",o("Identifier")).field("key",o("FlowType")).field("value",o("FlowType")).field("variance",p,r.null).field("static",Boolean,r.false),o("ObjectTypeCallProperty").bases("Node").build("value").field("value",o("FunctionTypeAnnotation")).field("static",Boolean,r.false),o("QualifiedTypeIdentifier").bases("Node").build("qualification","id").field("qualification",d(o("Identifier"),o("QualifiedTypeIdentifier"))).field("id",o("Identifier")),o("GenericTypeAnnotation").bases("FlowType").build("id","typeParameters").field("id",d(o("Identifier"),o("QualifiedTypeIdentifier"))).field("typeParameters",d(o("TypeParameterInstantiation"),null)),o("MemberTypeAnnotation").bases("FlowType").build("object","property").field("object",o("Identifier")).field("property",d(o("MemberTypeAnnotation"),o("GenericTypeAnnotation"))),o("IndexedAccessType").bases("FlowType").build("objectType","indexType").field("objectType",o("FlowType")).field("indexType",o("FlowType")),o("OptionalIndexedAccessType").bases("FlowType").build("objectType","indexType","optional").field("objectType",o("FlowType")).field("indexType",o("FlowType")).field("optional",Boolean),o("UnionTypeAnnotation").bases("FlowType").build("types").field("types",[o("FlowType")]),o("IntersectionTypeAnnotation").bases("FlowType").build("types").field("types",[o("FlowType")]),o("TypeofTypeAnnotation").bases("FlowType").build("argument").field("argument",o("FlowType")),o("ObjectTypeSpreadProperty").bases("Node").build("argument").field("argument",o("FlowType")),o("ObjectTypeInternalSlot").bases("Node").build("id","value","optional","static","method").field("id",o("Identifier")).field("value",o("FlowType")).field("optional",Boolean).field("static",Boolean).field("method",Boolean),o("TypeParameterDeclaration").bases("Node").build("params").field("params",[o("TypeParameter")]),o("TypeParameterInstantiation").bases("Node").build("params").field("params",[o("FlowType")]),o("TypeParameter").bases("FlowType").build("name","variance","bound","default").field("name",String).field("variance",p,r.null).field("bound",d(o("TypeAnnotation"),null),r.null).field("default",d(o("FlowType"),null),r.null),o("ClassProperty").field("variance",p,r.null),o("ClassImplements").bases("Node").build("id").field("id",o("Identifier")).field("superClass",d(o("Expression"),null),r.null).field("typeParameters",d(o("TypeParameterInstantiation"),null),r.null),o("InterfaceTypeAnnotation").bases("FlowType").build("body","extends").field("body",o("ObjectTypeAnnotation")).field("extends",d([o("InterfaceExtends")],null),r.null),o("InterfaceDeclaration").bases("Declaration").build("id","body","extends").field("id",o("Identifier")).field("typeParameters",d(o("TypeParameterDeclaration"),null),r.null).field("body",o("ObjectTypeAnnotation")).field("extends",[o("InterfaceExtends")]),o("DeclareInterface").bases("InterfaceDeclaration").build("id","body","extends"),o("InterfaceExtends").bases("Node").build("id").field("id",o("Identifier")).field("typeParameters",d(o("TypeParameterInstantiation"),null),r.null),o("TypeAlias").bases("Declaration").build("id","typeParameters","right").field("id",o("Identifier")).field("typeParameters",d(o("TypeParameterDeclaration"),null)).field("right",o("FlowType")),o("DeclareTypeAlias").bases("TypeAlias").build("id","typeParameters","right"),o("OpaqueType").bases("Declaration").build("id","typeParameters","impltype","supertype").field("id",o("Identifier")).field("typeParameters",d(o("TypeParameterDeclaration"),null)).field("impltype",o("FlowType")).field("supertype",d(o("FlowType"),null)),o("DeclareOpaqueType").bases("OpaqueType").build("id","typeParameters","supertype").field("impltype",d(o("FlowType"),null)),o("TypeCastExpression").bases("Expression").build("expression","typeAnnotation").field("expression",o("Expression")).field("typeAnnotation",o("TypeAnnotation")),o("TupleTypeAnnotation").bases("FlowType").build("types").field("types",[o("FlowType")]),o("DeclareVariable").bases("Statement").build("id").field("id",o("Identifier")),o("DeclareFunction").bases("Statement").build("id").field("id",o("Identifier")).field("predicate",d(o("FlowPredicate"),null),r.null),o("DeclareClass").bases("InterfaceDeclaration").build("id"),o("DeclareModule").bases("Statement").build("id","body").field("id",d(o("Identifier"),o("Literal"))).field("body",o("BlockStatement")),o("DeclareModuleExports").bases("Statement").build("typeAnnotation").field("typeAnnotation",o("TypeAnnotation")),o("DeclareExportDeclaration").bases("Declaration").build("default","declaration","specifiers","source").field("default",Boolean).field("declaration",d(o("DeclareVariable"),o("DeclareFunction"),o("DeclareClass"),o("FlowType"),o("TypeAlias"),o("DeclareOpaqueType"),o("InterfaceDeclaration"),null)).field("specifiers",[d(o("ExportSpecifier"),o("ExportBatchSpecifier"))],r.emptyArray).field("source",d(o("Literal"),null),r.null),o("DeclareExportAllDeclaration").bases("Declaration").build("source").field("source",d(o("Literal"),null),r.null),o("ImportDeclaration").field("importKind",d("value","type","typeof"),()=>"value"),o("FlowPredicate").bases("Flow"),o("InferredPredicate").bases("FlowPredicate").build(),o("DeclaredPredicate").bases("FlowPredicate").build("value").field("value",o("Expression")),o("Function").field("predicate",d(o("FlowPredicate"),null),r.null),o("CallExpression").field("typeArguments",d(null,o("TypeParameterInstantiation")),r.null),o("NewExpression").field("typeArguments",d(null,o("TypeParameterInstantiation")),r.null),o("EnumDeclaration").bases("Declaration").build("id","body").field("id",o("Identifier")).field("body",d(o("EnumBooleanBody"),o("EnumNumberBody"),o("EnumStringBody"),o("EnumSymbolBody"))),o("EnumBooleanBody").build("members","explicitType").field("members",[o("EnumBooleanMember")]).field("explicitType",Boolean),o("EnumNumberBody").build("members","explicitType").field("members",[o("EnumNumberMember")]).field("explicitType",Boolean),o("EnumStringBody").build("members","explicitType").field("members",d([o("EnumStringMember")],[o("EnumDefaultedMember")])).field("explicitType",Boolean),o("EnumSymbolBody").build("members").field("members",[o("EnumDefaultedMember")]),o("EnumBooleanMember").build("id","init").field("id",o("Identifier")).field("init",d(o("Literal"),Boolean)),o("EnumNumberMember").build("id","init").field("id",o("Identifier")).field("init",o("Literal")),o("EnumStringMember").build("id","init").field("id",o("Identifier")).field("init",o("Literal")),o("EnumDefaultedMember").build("id").field("id",o("Identifier"))}});
//# sourceMappingURL=../sourcemaps/def/flow.js.map