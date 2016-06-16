function XhrSetupShim (_placeHolder) {
    this.setRequestHeader = function (key, value) {
        _placeHolder.headers[key] = value;
    }

    Object.defineProperty(this, "withCredentials", {
        set(value) {
            _placeHolder.withCredentials = value;
        },
        get() {
            return _placeHolder.withCredentials
        }
    });
};

function createXhrSetupShim() {
    var placeholder = {
        headers: {},
        withCredentials: false
    }

    var xhrSetupShim = new XhrSetupShim(placeholder);

    // IMPORTANT: We seal the shim because we want it to throw if xhrSetup tries to do something not supported, rather than just failing silently.
    // The problem is that will only work if xhrSetup is in strict mode, which we can't control.
    //
    // TODO:
    //  - mirror XHR instance API and throw explicitely on every method / set property
    //  - Exception are caught by hls.js and logging is made silent except if hlsjsConfig.debug === true. It probably triggers an hls.js error event though, but that sucks. How can we improve this?
    Object.seal(xhrSetupShim);

    return { xhrSetupShim, placeholder }
}

export { createXhrSetupShim };
