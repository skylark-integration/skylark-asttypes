/**
 * skylark-asttypes - A version of asttypes that ported to running on skylarkjs.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["./fork","./def/es-proposals","./def/jsx","./def/flow","./def/esprima","./def/babel","./def/typescript","./types","./gen/namedTypes","./gen/visitor"],function(e,i,t,s,d,a,l,n,o,p){"use strict";const{ASTNode:r,AnyType:u,Field:y}=n,{namedTypes:f}=o,{Visitor:m}=p,{astNodesAreEquivalent:N,builders:T,builtInTypes:g,defineMethod:h,eachField:F,finalize:b,getBuilderName:c,getFieldNames:A,getFieldValue:P,getSupertypeNames:V,namedTypes:v,NodePath:S,Path:j,PathVisitor:q,someField:z,Type:B,use:E,visit:I}=e([i,t,s,d,a,l]);return Object.assign(f,v),{AnyType:u,ASTNode:r,astNodesAreEquivalent:N,builders:T,builtInTypes:g,defineMethod:h,eachField:F,Field:y,finalize:b,getBuilderName:c,getFieldNames:A,getFieldValue:P,getSupertypeNames:V,namedTypes:f,NodePath:S,Path:j,PathVisitor:q,someField:z,Type:B,use:E,visit:I,Visitor:m}});
//# sourceMappingURL=sourcemaps/main.js.map
