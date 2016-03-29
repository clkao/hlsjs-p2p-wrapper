import url from 'url';

function formatContentId ({ contentUrl, id }) {
  if (id) {
    if (typeof(id) === 'string') {
      return id;
    } else {
      throw new TypeError("Content identifier needs to be a string");
    }
  } else {
    let parsedUrl = url.parse(contentUrl, true, true);
    return parsedUrl.host + parsedUrl.pathname;
  }
}

export { formatContentId };
