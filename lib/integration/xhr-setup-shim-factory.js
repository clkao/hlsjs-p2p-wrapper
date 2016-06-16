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
    Object.seal(xhrSetupShim);

    return { xhrSetupShim, placeholder }
}

export { createXhrSetupShim };
