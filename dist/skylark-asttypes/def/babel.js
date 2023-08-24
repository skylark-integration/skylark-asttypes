/**
 * skylark-asttypes - A version of asttypes that ported to running on skylarkjs.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["../types","./babel-core","./flow"],function(e,n,s){"use strict";return function(i){const r=i.use(e).Type.def;i.use(n),i.use(s),r("V8IntrinsicIdentifier").bases("Expression").build("name").field("name",String),r("TopicReference").bases("Expression").build()}});
//# sourceMappingURL=../sourcemaps/def/babel.js.map
