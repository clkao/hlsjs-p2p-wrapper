function inheritStaticPropertiesReadOnly(target, source) {

    function defineReadOnlyProperty(staticProperty) {
        Object.defineProperty(target, staticProperty, {
            get: function () {
                return source[staticProperty];
            },
            set: undefined
        });
    }

    for (var staticProperty of Object.getOwnPropertyNames(source)) {
        if (["prototype", "name", "length", "caller", "arguments", "isSupported"].indexOf(staticProperty) === -1) {
            defineReadOnlyProperty(staticProperty);
        }
    }
}

export {
    inheritStaticPropertiesReadOnly
};
