import url from 'url';

function formatContentId ({ contentUrl, contentId }) {

  if (contentId !== null && contentId !== undefined) {
    if (typeof contentId !== 'string' || !contentId.length) {
      throw new TypeError("Content identifier needs to be a non-empty string");
    }
    return contentId;
  }

  let parsedUrl = url.parse(contentUrl, true, true);
  return parsedUrl.host + parsedUrl.pathname;
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
