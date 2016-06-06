import { formatContentId } from '../lib/utils.js';

describe('Content ID format helper method: formatContentId', function () {
    it('should return the formatted url (host + pathname) if no contentId is passed', function () {
        const contentUrl = "http://cdn.rtmp.webverbosity.com:1935/dvr/chardikla_12HRDVR/playlist.m3u8?dvr";
        formatContentId({ contentUrl }).should.equal("cdn.rtmp.webverbosity.com:1935/dvr/chardikla_12HRDVR/playlist.m3u8");
    });

    it('contentId should take precendence if specified', function () {
        const contentUrl = "http://cdn.rtmp.webverbosity.com:1935/dvr/chardikla_12HRDVR/playlist.m3u8?dvr";
        const contentId = "My-id:is%so?kewl";
        formatContentId({ contentUrl, contentId }).should.equal(contentId);
    });

    it('should compute the hash the same way as the backend for special urls', function () {
        const contentUrl = "http://cdn.rtmp.webverbosity.com:1935/dvr/chardikla_12HRDVR/playlist.m3u8?dvr";
        const contentId = 0;
        formatContentId.bind(null, { contentUrl, contentId }).should.throw("Content identifier needs to be a non-empty string");
    });

    it('should compute the hash the same way as the backend for special urls', function () {
        const contentUrl = "http://cdn.rtmp.webverbosity.com:1935/dvr/chardikla_12HRDVR/playlist.m3u8?dvr";
        const contentId = "";
        formatContentId.bind(null, { contentUrl, contentId }).should.throw("Content identifier needs to be a non-empty string");
    });
});
