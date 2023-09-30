import { whereAlpha2 } from "iso-3166-1";

const runtimeConfig = useRuntimeConfig();

/**
 * Search YouTube (maximum 5 results)
 * @param search The search string (for YouTube)
 * @param region The region code (ISO-3661 alpha-2 compliant), defaults to US
 */
export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event);
        const body = await readBody(event).then((result) => JSON.parse(result));

        if (runtimeConfig.API_KEY.length !== 36) {
            console.warn("Invalid API key set in environment variables");
        }

        if (!body || !body.apiKey) {
            return createError({
                message: "Missing API Key",
                statusCode: 400,
                statusMessage: "Your request is missing an api key",
                stack: "",
                fatal: false,
                unhandled: false
            });
        }

        if (body.apiKey !== runtimeConfig.API_KEY) {
            return createError({
                message: "Invalid API key",
                statusCode: 401,
                statusMessage: "You have invalid credentials",
                stack: "",
                fatal: false,
                unhandled: false
            });
        }

        const search = query.search?.toString() ?? "";

        let region = query.region?.toString() ?? "US";

        const isValidISOCode = whereAlpha2(region);

        if (!isValidISOCode) {
            region = "US";
            console.log("Invalid region code received");
        }

        const response = await fetch(
            "https://www.googleapis.com/youtube/v3/search?" +
                new URLSearchParams({
                    part: "snippet",
                    q: search,
                    type: "video",
                    maxResults: "5",
                    regionCode: region,
                    key: runtimeConfig.GOOGLE_API_KEY
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
