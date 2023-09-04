"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExpoRequest = exports.ExpoURL = exports.NON_STANDARD_SYMBOL = exports.ExpoResponse = exports.installGlobals = void 0;
const node_1 = require("@remix-run/node");
const node_url_1 = require("node:url");
// Ensure these are available for the API Routes.
function installGlobals() {
    (0, node_1.installGlobals)();
    // @ts-expect-error
    global.Request = ExpoRequest;
    // @ts-expect-error
    global.Response = ExpoResponse;
    // @ts-expect-error
    global.ExpoResponse = ExpoResponse;
    // @ts-expect-error
    global.ExpoRequest = ExpoRequest;
}
exports.installGlobals = installGlobals;
class ExpoResponse extends node_1.Response {
    // TODO: Drop when we upgrade to node-fetch v3
    static json(data = undefined, init = {}) {
        const body = JSON.stringify(data);
        if (body === undefined) {
            throw new TypeError('data is not JSON serializable');
        }
        const headers = new node_1.Headers(init?.headers);
        if (!headers.has('content-type')) {
            headers.set('content-type', 'application/json');
        }
        return new ExpoResponse(body, {
            ...init,
            headers,
        });
    }
}
exports.ExpoResponse = ExpoResponse;
exports.NON_STANDARD_SYMBOL = Symbol('non-standard');
class ExpoURL extends node_url_1.URL {
    static from(url, config) {
        const expoUrl = new ExpoURL(url);
        const match = config.namedRegex.exec(expoUrl.pathname);
        if (match?.groups) {
            for (const [key, value] of Object.entries(match.groups)) {
                const namedKey = config.routeKeys[key];
                expoUrl.searchParams.set(namedKey, value);
            }
        }
        return expoUrl;
    }
}
exports.ExpoURL = ExpoURL;
// TODO: Flip regex to start with slash and end without slash
// Use named capture groups
// Convert named capture groups to allow dashes
class ExpoRequest extends node_1.Request {
    constructor(info, init, config) {
        super(info, init);
        const url = typeof info !== 'string' && 'url' in info ? info.url : String(info);
        this[exports.NON_STANDARD_SYMBOL] = {
            url: config ? ExpoURL.from(url, config) : new ExpoURL(url),
        };
    }
    get expoUrl() {
        return this[exports.NON_STANDARD_SYMBOL].url;
    }
}
exports.ExpoRequest = ExpoRequest;
