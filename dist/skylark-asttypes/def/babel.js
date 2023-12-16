/**
 * skylark-asttypes - A version of asttypes that ported to running on skylarkjs.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["../types","./babel-core","./flow"],function(n,s,r){"use strict";return function(e){var i=e.use(n).Type.def;e.use(s),e.use(r),i("V8IntrinsicIdentifier").bases("Expression").build("name").field("name",String),i("TopicReference").bases("Expression").build()}});
//# sourceMappingURL=../sourcemaps/def/babel.js.map
