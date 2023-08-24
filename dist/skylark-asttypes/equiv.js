/**
 * skylark-asttypes - A version of asttypes that ported to running on skylarkjs.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["./types"],function(e){"use strict";return function(r){var t=r.use(e),n=t.getFieldNames,i=t.getFieldValue,u=t.builtInTypes.array,o=t.builtInTypes.object,c=t.builtInTypes.Date,f=t.builtInTypes.RegExp,l=Object.prototype.hasOwnProperty;function a(e,r,t){return u.check(t)?t.length=0:t=null,h(e,r,t)}function s(e){return/[_$a-z][_$a-z0-9]*/i.test(e)?"."+e:"["+JSON.stringify(e)+"]"}function h(e,r,t){return e===r||(u.check(e)?function(e,r,t){u.assert(e);var n=e.length;if(!u.check(r)||r.length!==n)return t&&t.push("length"),!1;for(var i=0;i<n;++i){if(t&&t.push(i),i in e!=i in r)return!1;if(!h(e[i],r[i],t))return!1;if(t){var o=t.pop();if(o!==i)throw new Error(""+o)}}return!0}(e,r,t):o.check(e)?function(e,r,t){if(o.assert(e),!o.check(r))return!1;if(e.type!==r.type)return t&&t.push("type"),!1;var u=n(e),c=u.length,f=n(r),a=f.length;if(c===a){for(var s=0;s<c;++s){var p=u[s],g=i(e,p),y=i(r,p);if(t&&t.push(p),!h(g,y,t))return!1;if(t){var b=t.pop();if(b!==p)throw new Error(""+b)}}return!0}if(!t)return!1;var k=Object.create(null);for(s=0;s<c;++s)k[u[s]]=!0;for(s=0;s<a;++s){if(p=f[s],!l.call(k,p))return t.push(p),!1;delete k[p]}for(p in k){t.push(p);break}return!1}(e,r,t):c.check(e)?c.check(r)&&+e==+r:f.check(e)?f.check(r)&&e.source===r.source&&e.global===r.global&&e.multiline===r.multiline&&e.ignoreCase===r.ignoreCase:e==r)}return a.assert=function(e,r){var t=[];if(!a(e,r,t)){if(0!==t.length)throw new Error("Nodes differ in the following path: "+t.map(s).join(""));if(e!==r)throw new Error("Nodes must be equal")}},a}});
//# sourceMappingURL=sourcemaps/equiv.js.map
