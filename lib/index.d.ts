import { ApiResponse } from "./types";
declare class PodcastIndexClient {
    private apiUrl;
    private userAgent;
    private version;
    private key;
    private secret;
    constructor(key?: string, secret?: string);
    private hexDigestMessage;
    private generateHeaders;
    private fetch;
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
    raw<T>(endpoint: string, qs?: ApiResponse.AnyQueryOptions): Promise<T>;
    /**
     * List all categories
     *
     * @param query search query
     */
    categories(): Promise<ApiResponse.Categories>;
    /**
     * This call returns all of the feeds that match the search terms in the title, author, or owner of the feed.
     * This is ordered by the last-released episode, with the latest at the top of the results.
     *
     * @param query search query
     */
    search(query: string, options?: {
        clean?: boolean;
        max?: number;
        fulltext?: boolean;
    }): Promise<ApiResponse.Search>;
    /**
     * This call returns all of the episodes where the specified person is mentioned.
     *
     * @param query search query
     */
    searchPerson(query: string, options?: {
        fulltext?: boolean;
    }): Promise<ApiResponse.SearchPerson>;
    /**
     * This call returns the most recent [max] number of episodes globally across the whole index, in reverse chronological order. Max of 1000
     */
    recentEpisodes(options?: {
        max?: number;
        /** If you pass this argument, any item containing this string will be discarded from the result set. This may, in certain cases, reduce your set size below your “max” value. */
        excludeString?: string;
        /** If you pass an episode id, you will get recent episodes before that id, allowing you to walk back through the episode history sequentially. */
        before?: number;
        /** If present, return the full text value of any text fields (ex: description). If not provided, field value is truncated to 100 words. */
        fulltext?: boolean;
    }): Promise<ApiResponse.RecentEpisodes>;
    /**
     * This call returns the most recently feeds in reverse chronological order.
     *
     * @param options additional api options
     */
    recentFeeds(options?: {
        /** Max number of items to return, defaults to 40 */
        max?: number;
        /** You can specify a hard-coded unix timestamp, or a negative integer that represents a number of seconds prior to now. Either way you specify, the search will start from that time and only return feeds updated since then. */
        since?: number;
        /** specifying a language code (like “en”) will return only feeds having that specific language. */
        lang?: string | string[];
        /** You can pass multiple of these to form an array. The category ids given will be excluded from the result set. */
        notCategory?: string[] | number[] | string | number;
        /** You can pass multiple of these to form an array. It will take precedent over the notCategory[] array, and instead only show you feeds with those categories in the result set. These values are OR'd */
        category?: string[] | number[] | string | number;
    }): Promise<ApiResponse.RecentFeeds>;
    /**
     * This call returns every new feed added to the index over the past 24 hours in reverse chronological order. Max of 1000
     *
     * @param options
     */
    recentNewFeeds(options?: {
        /** Max number of items to return, defaults to 10 */
        max?: number;
    }): Promise<ApiResponse.RecentNewFeeds>;
    /**
     * The most recent 60 soundbites that the index has discovered
     */
    recentSoundbites(): Promise<ApiResponse.RecentSoundbites>;
    /** This call returns everything we know about the feed. */
    podcastByUrl(url: string): Promise<ApiResponse.PodcastByUrl>;
    /** This call returns everything we know about the feed. */
    podcastById(id: number): Promise<ApiResponse.PodcastById>;
    /** If we have an itunes id on file for a feed, then this call returns everything we know about that feed. */
    podcastByItunesId(id: number): Promise<ApiResponse.PodcastByItunesId>;
    /** This call returns all the episodes we know about for this feed, in reverse chronological order. */
    episodesByFeedUrl(url: string, options?: {
        /** You can specify a maximum number of results to return */
        max?: number;
        /** You can specify a hard-coded unix timestamp, or a negative integer that represents a number of seconds prior to right now. Either way you specify, the search will start from that time and only return feeds updated since then. */
        since?: number;
        fulltext?: boolean;
    }): Promise<ApiResponse.EpisodesByFeedUrl>;
    /**
     * This call returns all the episodes we know about for this feed, in reverse chronological order.
     * Note: The id parameter is the internal Podcastindex id for this feed.
     */
    episodesByFeedId(id: number | number[], options?: {
        /** You can specify a maximum number of results to return */
        max?: number;
        /** You can specify a hard-coded unix timestamp, or a negative integer that represents a number of seconds prior to right now. Either way you specify, the search will start from that time and only return feeds updated since then. */
        since?: number;
        fulltext?: boolean;
    }): Promise<ApiResponse.EpisodesByFeedId>;
    /**
     * If we have an itunes id on file for a feed, then this call returns all the episodes we know about for the feed, in reverse chronological order.
     * Note: The itunes id parameter can either be the number alone, or be prepended with “id”.
     */
    episodesByItunesId(id: number, options?: {
        /** You can specify a maximum number of results to return */
        max?: number;
        /** You can specify a hard-coded unix timestamp, or a negative integer that represents a number of seconds prior to right now. Either way you specify, the search will start from that time and only return feeds updated since then. */
        since?: number | Date;
        fulltext?: boolean;
    }): Promise<ApiResponse.EpisodesByItunesId>;
    /**
     * This call returns a random batch of [max] episodes, in no specific order.
     *
     * Note: If no [max] is specified, the default is 1. You can return up to 40 episodes at a time.
     * Note: Language and category names are case-insensitive.
     * Note: You can mix and match the cat and notcat filters to fine tune a very specific result set.
     */
    episodesRandom(options?: {
        /** You can specify a maximum number of results to return */
        max?: number;
        /** Specifying a language code (like "en") will return only episodes having that specific language. You can specify multiple languages by separating them with commas. If you also want to return episodes that have no language given, use the token "unknown". (ex. en,es,ja,unknown) */
        lang?: string | string[];
        /** You may use this argument to specify that you ONLY want episodes with these categories in the results. Separate multiple categories with commas. You may specify either the category id or the category name */
        cat?: string | string[];
        /** You may use this argument to specify categories of episodes to NOT show in the results. Separate multiple categories with commas. You may specify either the category id or the category name. */
        notcat?: string | string[];
    }): Promise<ApiResponse.RandomEpisodes>;
    /** Get all the metadata for a single episode by passing its id. */
    episodeById(id: number, options?: {
        fulltext?: boolean;
    }): Promise<ApiResponse.EpisodeById>;
    stats(): Promise<ApiResponse.Stats>;
}
export { PodcastIndexClient };
