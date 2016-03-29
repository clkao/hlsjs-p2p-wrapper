import url from 'url';

function formatContentId ({ contentUrl, contentId }) {
  if (contentId !== undefined) {
    if (typeof(contentId) === 'string') {
      return contentId;
    } else {
      throw new TypeError("Content identifier needs to be a string");
    }
  } else {
    let parsedUrl = url.parse(contentUrl, true, true);
    return parsedUrl.host + parsedUrl.pathname;
  }
}

export { formatContentId };
