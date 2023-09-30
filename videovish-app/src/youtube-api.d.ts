declare module "youtube-api" {
    export interface Schema$SearchListResponse {
        /**
         * Etag of this resource.
         */
        etag?: string | null;
        /**
         * Serialized EventId of the request which produced this response.
         */
        eventId?: string | null;
        /**
         * Pagination information for token pagination.
         */
        items?: Schema$SearchResult[];
        /**
         * Identifies what kind of resource this is. Value: the fixed string "youtube#searchListResponse".
         */
        kind?: string | null;
        /**
         * The token that can be used as the value of the pageToken parameter to retrieve the next page in the result set.
         */
        nextPageToken?: string | null;
        /**
         * General pagination information.
         */
        pageInfo?: Schema$PageInfo;
        /**
         * The token that can be used as the value of the pageToken parameter to retrieve the previous page in the result set.
         */
        prevPageToken?: string | null;
        regionCode?: string | null;
        tokenPagination?: Schema$TokenPagination;
        /**
         * The visitorId identifies the visitor.
         */
        visitorId?: string | null;
    }

    /**
     * Stub token pagination template to suppress results.
     */
    export interface Schema$TokenPagination {}

    /**
     * A search result contains information about a YouTube video, channel, or playlist that matches the search parameters specified in an API request. While a search result points to a uniquely identifiable resource, like a video, it does not have its own persistent data.
     */
    export interface Schema$SearchResult {
        /**
         * Etag of this resource.
         */
        etag?: string | null;
        /**
         * The id object contains information that can be used to uniquely identify the resource that matches the search request.
         */
        id?: Schema$ResourceId;
        /**
         * Identifies what kind of resource this is. Value: the fixed string "youtube#searchResult".
         */
        kind?: string | null;
        /**
         * The snippet object contains basic details about a search result, such as its title or description. For example, if the search result is a video, then the title will be the video's title and the description will be the video's description.
         */
        snippet?: Schema$SearchResultSnippet;
    }
    /**
     * Basic details about a search result, including title, description and thumbnails of the item referenced by the search result.
     */
    export interface Schema$SearchResultSnippet {
        /**
         * The value that YouTube uses to uniquely identify the channel that published the resource that the search result identifies.
         */
        channelId?: string | null;
        /**
         * The title of the channel that published the resource that the search result identifies.
         */
        channelTitle?: string | null;
        /**
         * A description of the search result.
         */
        description?: string | null;
        /**
         * It indicates if the resource (video or channel) has upcoming/active live broadcast content. Or it's "none" if there is not any upcoming/active live broadcasts.
         */
        liveBroadcastContent?: string | null;
        /**
         * The creation date and time of the resource that the search result identifies.
         */
        publishedAt?: string | null;
        /**
         * A map of thumbnail images associated with the search result. For each object in the map, the key is the name of the thumbnail image, and the value is an object that contains other information about the thumbnail.
         */
        thumbnails?: Schema$ThumbnailDetails;
        /**
         * The title of the search result.
         */
        title?: string | null;
    }

    export interface Schema$ThumbnailDetails {
        /**
         * The default image for this resource.
         */
        default?: Schema$Thumbnail;
        /**
         * The high quality image for this resource.
         */
        high?: Schema$Thumbnail;
        /**
         * The maximum resolution quality image for this resource.
         */
        maxres?: Schema$Thumbnail;
        /**
         * The medium quality image for this resource.
         */
        medium?: Schema$Thumbnail;
        /**
         * The standard quality image for this resource.
         */
        standard?: Schema$Thumbnail;
    }

    /**
     * A thumbnail is an image representing a YouTube resource.
     */
    export interface Schema$Thumbnail {
        /**
         * (Optional) Height of the thumbnail image.
         */
        height?: number | null;
        /**
         * The thumbnail image's URL.
         */
        url?: string | null;
        /**
         * (Optional) Width of the thumbnail image.
         */
        width?: number | null;
    }

    /**
     * A resource id is a generic reference that points to another YouTube resource.
     */
    export interface Schema$ResourceId {
        /**
         * The ID that YouTube uses to uniquely identify the referred resource, if that resource is a channel. This property is only present if the resourceId.kind value is youtube#channel.
         */
        channelId?: string | null;
        /**
         * The type of the API resource.
         */
        kind?: string | null;
        /**
         * The ID that YouTube uses to uniquely identify the referred resource, if that resource is a playlist. This property is only present if the resourceId.kind value is youtube#playlist.
         */
        playlistId?: string | null;
        /**
         * The ID that YouTube uses to uniquely identify the referred resource, if that resource is a video. This property is only present if the resourceId.kind value is youtube#video.
         */
        videoId?: string | null;
    }

    /**
     * Paging details for lists of resources, including total number of items available and number of resources returned in a single page.
     */
    export interface Schema$PageInfo {
        /**
         * The number of results included in the API response.
         */
        resultsPerPage?: number | null;
        /**
         * The total number of results in the result set.
         */
        totalResults?: number | null;
    }
}
