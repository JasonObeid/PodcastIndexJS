import { pick } from 'ramda';

// eslint-disable-next-line @typescript-eslint/no-namespace
var ApiResponse;
(function (ApiResponse) {
    (function (Status) {
        Status["Success"] = "true";
    })(ApiResponse.Status || (ApiResponse.Status = {}));
    (function (NewFeedStatus) {
        NewFeedStatus["Confirmed"] = "confirmed";
        NewFeedStatus["Success"] = "true";
        NewFeedStatus["Pending"] = "pending";
    })(ApiResponse.NewFeedStatus || (ApiResponse.NewFeedStatus = {}));
})(ApiResponse || (ApiResponse = {}));
var PodcastFeedType;
(function (PodcastFeedType) {
    PodcastFeedType[PodcastFeedType["RSS"] = 0] = "RSS";
    PodcastFeedType[PodcastFeedType["ATOM"] = 1] = "ATOM";
})(PodcastFeedType || (PodcastFeedType = {}));

var types = /*#__PURE__*/Object.freeze({
  __proto__: null,
  get ApiResponse () { return ApiResponse; },
  get PodcastFeedType () { return PodcastFeedType; }
});

function isDate(d) {
    return Object.prototype.hasOwnProperty.call(d, "getUTCMilliseconds");
}
function toEpochTimestamp(date) {
    if (!date) {
        return undefined;
    }
    const ts = isDate(date) ? date.getTime() : date;
    const asDate = new Date(ts);
    if (asDate.getFullYear() > 2003) {
        return Math.floor(ts / 1000);
    }
    return ts;
}
function normalizeKey(fn, key, obj) {
    const val = fn(obj[key]);
    return {
        ...obj,
        [key]: val,
    };
}

const clientUserAgent = "podcastindexjs";
const apiVersion = "1.0";
function encodeObjectToQueryString(qs) {
    if (!qs) {
        return null;
    }
    return Object.entries(qs)
        .map(([key, val]) => {
        if (!val) {
            return null;
        }
        if (Array.isArray(val)) {
            return `${key}[]=${val.map((v) => encodeURI(`${v}`)).join(",")}`;
        }
        if (val === true) {
            return key;
        }
        return `${key}=${encodeURI(`${val}`)}`;
    })
        .filter((x) => x)
        .join("&");
}
class PodcastIndexClient {
    apiUrl = `https://api.podcastindex.org/api/1.0`;
    userAgent = clientUserAgent;
    version = apiVersion;
    key;
    secret;
    constructor(key, secret) {
        if (!key || !secret) {
            throw new Error("Unable to initialize due to missing key or secret");
        }
        this.key = key;
        this.secret = secret;
    }
    async hexDigestMessage(message) {
        const msgUint8 = new TextEncoder().encode(message); // encode as (utf-8) Uint8Array
        const hashBuffer = await crypto.subtle.digest("SHA-1", msgUint8); // hash the message
        const hashArray = Array.from(new Uint8Array(hashBuffer)); // convert buffer to byte array
        return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
    }
    async generateHeaders() {
        if (!this.key || !this.secret) {
            throw new Error("Missing key or secret");
        }
        const apiHeaderTime = Math.floor(Date.now() / 1000);
        const data4Hash = this.key + this.secret + apiHeaderTime;
        const hash4Header = await this.hexDigestMessage(data4Hash);
        return {
            "Content-Type": "application/json",
            "X-Auth-Date": `${apiHeaderTime}`,
            "X-Auth-Key": this.key,
            Authorization: hash4Header,
            "User-Agent": `${this.userAgent}/${this.version}`,
        };
    }
    async fetch(endpoint, qs) {
        const queryString = qs ? encodeObjectToQueryString(qs) : null;
        const options = {
            method: `GET`,
            headers: await this.generateHeaders(),
        };
        const url = `${this.apiUrl}${endpoint}${queryString ? `?${queryString}` : ``}`;
        return fetch(url, options).then((res) => {
            if (res.status >= 200 && res.status < 300) {
                return res.json();
            }
            throw new Error(res.statusText);
        });
    }
    /**
     * Make a raw request to podcast index. This is an escape hatch for leveraging the auth handling in the client
     * but managing the calls and responses yourself.
     * Example:
     *      client.raw("/podcasts/byfeedid?id=75075");
     *      client.raw("/podcasts/byfeedid", { id: 75075 });
     *
     * @param endpoint
     * @param qs
     */
    async raw(endpoint, qs) {
        return await this.fetch(endpoint, qs);
    }
    // #region Search
    /**
     * List all categories
     *
     * @param query search query
     */
    async categories() {
        return await this.fetch("/categories/list");
    }
    // #endregion
    // #region Search
    /**
     * This call returns all of the feeds that match the search terms in the title, author, or owner of the feed.
     * This is ordered by the last-released episode, with the latest at the top of the results.
     *
     * @param query search query
     */
    async search(query, options = {}) {
        return await this.fetch("/search/byterm", {
            q: query,
            max: options.max ?? 25,
            clean: Boolean(options.clean),
            fulltext: Boolean(options.fulltext),
        });
    }
    /**
     * This call returns all of the episodes where the specified person is mentioned.
     *
     * @param query search query
     */
    async searchPerson(query, options = {}) {
        return await this.fetch("/search/byperson", {
            q: query,
            fulltext: Boolean(options.fulltext),
        });
    }
    // #endregion
    // #region Recent
    /**
     * This call returns the most recent [max] number of episodes globally across the whole index, in reverse chronological order. Max of 1000
     */
    async recentEpisodes(options = {}) {
        return await this.fetch("/recent/episodes", {
            ...options,
            max: options.max ?? 10,
        });
    }
    /**
     * This call returns the most recently feeds in reverse chronological order.
     *
     * @param options additional api options
     */
    async recentFeeds(options = {}) {
        const apiOptions = {
            max: options.max ?? 40,
            ...pick(["since"], options),
        };
        if (options.lang) {
            if (Array.isArray(options.lang)) {
                apiOptions.lang = options.lang.join(",");
            }
            else {
                apiOptions.lang = options.lang;
            }
        }
        if (options.notCategory) {
            apiOptions.notcat = Array.isArray(options.notCategory)
                ? options.notCategory.join(",")
                : options.notCategory;
        }
        if (options.category) {
            apiOptions.cat = Array.isArray(options.category)
                ? options.category.join(",")
                : options.category;
        }
        const result = await this.fetch("/recent/feeds", apiOptions);
        return {
            ...result,
            feeds: result.feeds
                .map((feed) => {
                if (!feed.categories) {
                    return { ...feed, categories: {} };
                }
                return feed;
            })
                .map((feed) => normalizeKey((lang) => lang.toLowerCase(), "language", feed)),
        };
    }
    /**
     * This call returns every new feed added to the index over the past 24 hours in reverse chronological order. Max of 1000
     *
     * @param options
     */
    async recentNewFeeds(options = {}) {
        return await this.fetch("/recent/newfeeds", {
            max: options.max ?? 10,
        });
    }
    /**
     * The most recent 60 soundbites that the index has discovered
     */
    async recentSoundbites() {
        return await this.fetch("/recent/soundbites");
    }
    // #endregion
    // #region Podcasts
    /** This call returns everything we know about the feed. */
    async podcastByUrl(url) {
        const result = await this.fetch("/podcasts/byfeedurl", { url });
        if (!result.feed.categories) {
            result.feed.categories = {};
        }
        return result;
    }
    /** This call returns everything we know about the feed. */
    async podcastById(id) {
        const result = await this.fetch("/podcasts/byfeedid", { id });
        if (!result.feed.categories) {
            result.feed.categories = {};
        }
        return result;
    }
    /** If we have an itunes id on file for a feed, then this call returns everything we know about that feed. */
    async podcastByItunesId(id) {
        const result = await this.fetch("/podcasts/byitunesid", { id });
        if (!result.feed.categories) {
            result.feed.categories = {};
        }
        return result;
    }
    // #endregion
    // #region Episodes
    /** This call returns all the episodes we know about for this feed, in reverse chronological order. */
    async episodesByFeedUrl(url, options = {}) {
        const { since, ...rest } = options;
        return await this.fetch("/episodes/byfeedurl", {
            ...rest,
            since: toEpochTimestamp(since),
            url,
        });
    }
    /**
     * This call returns all the episodes we know about for this feed, in reverse chronological order.
     * Note: The id parameter is the internal Podcastindex id for this feed.
     */
    async episodesByFeedId(id, options = {}) {
        const { since, ...rest } = options;
        const parsedId = Array.isArray(id) ? id.join(",") : id;
        return await this.fetch("/episodes/byfeedid", {
            ...rest,
            since: toEpochTimestamp(since),
            id: parsedId,
        });
    }
    /**
     * If we have an itunes id on file for a feed, then this call returns all the episodes we know about for the feed, in reverse chronological order.
     * Note: The itunes id parameter can either be the number alone, or be prepended with “id”.
     */
    async episodesByItunesId(id, options = {}) {
        const { since, ...rest } = options;
        return await this.fetch("/episodes/byitunesid", {
            ...rest,
            since: toEpochTimestamp(since),
            id,
        });
    }
    /**
     * This call returns a random batch of [max] episodes, in no specific order.
     *
     * Note: If no [max] is specified, the default is 1. You can return up to 40 episodes at a time.
     * Note: Language and category names are case-insensitive.
     * Note: You can mix and match the cat and notcat filters to fine tune a very specific result set.
     */
    async episodesRandom(options = {}) {
        const parsedOptions = options.max
            ? { max: options.max }
            : {};
        parsedOptions.lang = Array.isArray(options.lang) ? options.lang.join(",") : options.lang;
        parsedOptions.cat = Array.isArray(options.cat) ? options.cat.join(",") : options.cat;
        parsedOptions.notcat = Array.isArray(options.notcat)
            ? options.notcat.join(",")
            : options.notcat;
        return await this.fetch("/episodes/random", parsedOptions);
    }
    /** Get all the metadata for a single episode by passing its id. */
    async episodeById(id, options = {}) {
        return await this.fetch("/episodes/byid", {
            id,
            ...options,
        });
    }
    // #endregion
    async stats() {
        return await this.fetch("/stats/current");
    }
}

export { PodcastIndexClient, types as Types };
