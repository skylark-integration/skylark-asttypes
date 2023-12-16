/**
 * skylark-asttypes - A version of asttypes that ported to running on skylarkjs.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["./fork","./def/es-proposals","./def/jsx","./def/flow","./def/esprima","./def/babel","./def/typescript","./types","./gen/namedTypes","./gen/visitor"],function(e,i,t,s,d,a,l,n,r,o){"use strict";var{ASTNode:n,AnyType:p,Field:u}=n,r=r["namedTypes"],o=o["Visitor"],{astNodesAreEquivalent:e,builders:i,builtInTypes:t,defineMethod:s,eachField:d,finalize:a,getBuilderName:l,getFieldNames:y,getFieldValue:f,getSupertypeNames:m,namedTypes:N,NodePath:T,Path:g,PathVisitor:h,someField:F,Type:b,use:c,visit:v}=e([i,t,s,d,a,l]);return Object.assign(r,N),{AnyType:p,ASTNode:n,astNodesAreEquivalent:e,builders:i,builtInTypes:t,defineMethod:s,eachField:d,Field:u,finalize:a,getBuilderName:l,getFieldNames:y,getFieldValue:f,getSupertypeNames:m,namedTypes:r,NodePath:T,Path:g,PathVisitor:h,someField:F,Type:b,use:c,visit:v,Visitor:o}});
//# sourceMappingURL=sourcemaps/main.js.map
