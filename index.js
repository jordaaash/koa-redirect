'use strict';

const redirect = function (redirects) {
    return async function redirect (context, next) {
        const redirected = redirects.some(function (redirect) {
            return match(context, redirect);
        });
        if (!redirected) {
            await next();
        }
    };
};

const isRegExp = function (object) {
    return Object.prototype.toString.call(object) === '[object RegExp]';
};

const match = function (context, redirect) {
    const from = redirect.from;
    const path = context.path;
    let result;

    switch (typeof from) {
        case 'string':
            if (path === from) {
                return handle(context, redirect);
            }
            break;
        case 'function':
            result = from(context, path, redirect);
            if (result) {
                return handle(context, redirect, result);
            }
            break;
        case 'object':
            if (isRegExp(from)) {
                result = path.match(from);
                if (result != null) {
                    return handle(context, redirect, result);
                }
            }
            break;
        default:
            break;
    }
};

const handle = function (context, redirect, result) {
    const from   = redirect.from;
    const status = redirect.status;

    let to = redirect.to;
    if (to == null) {
        to = result;
    }

    if (typeof to === 'function') {
        to = to(context, result, redirect);
    }
    else if (isRegExp(from) && /\$\d/.test(to)) {
        to = to.replace(from, to);
    }

    if (status != null) {
        context.status = status;
    }

    context.redirect(to);

    return true;
};

module.exports = redirect;
