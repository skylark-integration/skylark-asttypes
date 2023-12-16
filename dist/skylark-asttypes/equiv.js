/**
 * skylark-asttypes - A version of asttypes that ported to running on skylarkjs.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["./types"],function(r){"use strict";return function(e){var e=e.use(r),m=e.getFieldNames,E=e.getFieldValue,j=e.builtInTypes.array,I=e.builtInTypes.object,N=e.builtInTypes.Date,O=e.builtInTypes.RegExp,T=Object.prototype.hasOwnProperty;function n(e,r,t){return j.check(t)?t.length=0:t=null,z(e,r,t)}function i(e){return/[_$a-z][_$a-z0-9]*/i.test(e)?"."+e:"["+JSON.stringify(e)+"]"}function z(e,r,t){if(e===r)return!0;if(j.check(e)){var n=e,i=r,u=t,o=(j.assert(n),n.length);if(!j.check(i)||i.length!==o)return u&&u.push("length"),!1;for(var f=0;f<o;++f){if(u&&u.push(f),f in n!=f in i)return!1;if(!z(n[f],i[f],u))return!1;if(u){var l=u.pop();if(l!==f)throw new Error(""+l)}}return!0}if(I.check(e)){var c=e,s=r,a=t;if(I.assert(c),I.check(s))if(c.type!==s.type)a&&a.push("type");else{var h=m(c),p=h.length,g=m(s),y=g.length;if(p===y){for(var b=0;b<p;++b){var k=h[b],v=E(c,k),w=E(s,k);if(a&&a.push(k),!z(v,w,a))return!1;if(a){v=a.pop();if(v!==k)throw new Error(""+v)}}return!0}if(a){var d=Object.create(null);for(b=0;b<p;++b)d[h[b]]=!0;for(b=0;b<y;++b){if(k=g[b],!T.call(d,k))return a.push(k),!1;delete d[k]}for(k in d){a.push(k);break}}}return!1}return N.check(e)?N.check(r)&&+e==+r:O.check(e)?O.check(r)&&e.source===r.source&&e.global===r.global&&e.multiline===r.multiline&&e.ignoreCase===r.ignoreCase:e==r}return n.assert=function(e,r){var t=[];if(!n(e,r,t)){if(0!==t.length)throw new Error("Nodes differ in the following path: "+t.map(i).join(""));if(e!==r)throw new Error("Nodes must be equal")}},n}});
//# sourceMappingURL=sourcemaps/equiv.js.map
