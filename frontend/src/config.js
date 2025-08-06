// src/config.js
const CONFIG = {
  // Reemplaza '192.168.1.15' con la IP real de tu máquina
  API_BASE_URL: 'http://localhost:8000'
};

export default CONFIG;
/*

> frontend@0.1.0 start
> react-scripts start

Attempting to bind to HOST environment variable: 0.0.0.0
If this was unintentional, check that you haven't mistakenly set it in your shell.
Learn more here: https://cra.link/advanced-config

(node:18608) [DEP_WEBPACK_DEV_SERVER_ON_AFTER_SETUP_MIDDLEWARE] DeprecationWarning: 'onAfterSetupMiddleware' option is deprecated. Please use the 'setupMiddlewares' option.
(Use `node --trace-deprecation ...` to show where the warning was created)
(node:18608) [DEP_WEBPACK_DEV_SERVER_ON_BEFORE_SETUP_MIDDLEWARE] DeprecationWarning: 'onBeforeSetupMiddleware' option is deprecated. Please use the 'setupMiddlewares' option.
C:\Users\UBV\Music\frontend\node_modules\webpack-dev-server\lib\Server.js:2557
        throw error;
        ^

Error: getaddrinfo ENOTFOUND 0.0.0.0
    at GetAddrInfoReqWrap.onlookupall [as oncomplete] (node:dns:120:26) {
  errno: -3008,
  code: 'ENOTFOUND',
  syscall: 'getaddrinfo',
  hostname: '0.0.0.0 '
}

Node.js v22.14.0 */