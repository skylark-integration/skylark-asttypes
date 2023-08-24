/**
 * skylark-asttypes - A version of asttypes that ported to running on skylarkjs.
 * @author Hudaokeji Co.,Ltd
 * @version v0.9.0
 * @link www.skylarkjs.org
 * @license MIT
 */
define(["./es2016","../types","../shared"],function(e,s,n){"use strict";return function(i){i.use(e);const t=i.use(s).Type.def,u=i.use(n).defaults;t("Function").field("async",Boolean,u.false),t("AwaitExpression").bases("Expression").build("argument").field("argument",t("Expression"))}});
//# sourceMappingURL=../sourcemaps/def/es2017.js.map
