import url from 'url';

function formatContentId ({ contentUrl, contentId }) {
  if (contentId !== undefined) {
    if (typeof(contentId) === 'string' && contentId !== '') {
      return contentId;
    } else {
      throw new TypeError("Content identifier needs to be a non-empty string");
    }
  } else {
    let parsedUrl = url.parse(contentUrl, true, true);
    return parsedUrl.host + parsedUrl.pathname;
  }
}

export { formatContentId };
