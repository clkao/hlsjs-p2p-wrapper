import url from 'url';

function formatContentId ({ contentUrl, contentId }) {
  if (contentId !== undefined) {
    if (typeof contentId === 'string' && contentId !== '') {
      return contentId;
    } else {
      throw new TypeError("Content identifier needs to be a non-empty string");
    }
  } else {
    let parsedUrl = url.parse(contentUrl, true, true);
    return parsedUrl.host + parsedUrl.pathname;
  }
}

function inheritStaticPropertiesReadOnly (target, source) {

  function defineReadOnlyProperty (staticProperty) {
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

export { formatContentId, inheritStaticPropertiesReadOnly };
