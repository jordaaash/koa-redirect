'use strict';

var redirect, isRegExp, match, handle;

redirect = function (redirects) {
    return function* redirect (next) {
        if (!redirects.some(match, this)) {
            yield next;
        }
    };
};

isRegExp = function (object) {
    return Object.prototype.toString.call(object) === '[object RegExp]';
};

match = function (redirect) {
    var from = redirect.from;
    var path = this.path;
    var result;

    switch (typeof from) {
        case 'string':
            if (path === from) {
                return handle.call(this, redirect);
            }
            break;
        case 'function':
            result = from.call(this, path, redirect);
            if (result) {
                return handle.call(this, redirect, result);
            }
            break;
        case 'object':
            if (isRegExp(from)) {
                result = path.match(from);
                if (result != null) {
                    return handle.call(this, redirect, result);
                }
            }
            break;
        default:
            break;
    }
};

handle = function (redirect, result) {
    var from   = redirect.from;
    var to     = redirect.to;
    var status = redirect.status;

    if (to == null) {
        to = result;
    }

    if (typeof to === 'function') {
        to = to.call(redirect, result);
    }
    else if (isRegExp(from) && /\$\d/.test(to)) {
        to = to.replace(from, to);
    }

    if (status != null) {
        this.status = status;
    }

    this.redirect(to);
    return true;
};

module.exports = redirect;
