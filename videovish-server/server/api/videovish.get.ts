import { whereAlpha2 } from "iso-3166-1";

const runtimeConfig = useRuntimeConfig();

/**
 * Search YouTube (maximum 5 results)
 * @param search The search string (for YouTube)
 * @param region The region code (ISO-3661 alpha-2 compliant), defaults to US
 */
export default defineEventHandler(async (event) => {
    const query = getQuery(event);
    const search = query.search?.toString() ?? "";

    let region = query.region?.toString() ?? "US";

    const isValidISOCode = whereAlpha2(region);

    if (!isValidISOCode) {
        region = "US";
        console.log("Invalid region code received");
    }

    try {
        const response = await fetch(
            "https://www.googleapis.com/youtube/v3/search?" +
                new URLSearchParams({
                    part: "snippet",
                    q: search,
                    type: "video",
                    maxResults: "5",
                    regionCode: region,
                    key: runtimeConfig.API_KEY
                })
        ).then((result) => result.json());

        if ("error" in response) {
            return createError({
                message: response.error.message,
                statusCode: response.error.code,
                statusMessage: response.error.status,
                stack: "",
                fatal: false,
                unhandled: false
            });
        }

        return response;
    } catch (e) {
        return createError({
            statusCode: 500,
            statusMessage: "The server failed to process this request",
            message: "YouTube search failed",
            stack: "",
            fatal: false,
            unhandled: false
        });
    }
});
