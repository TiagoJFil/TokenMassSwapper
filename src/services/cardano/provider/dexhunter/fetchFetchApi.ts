import { FetchAPI } from './api';

/**
 * FetchFetchApi implementation
 * @param url
 * @param options
 */
const FetchFetchApi: FetchAPI = async (url: string, options?: any): Promise<Response> => {
    try {
        //append a X-Forwarded-For header to the request
        if (!options) {
            options = {};
        }
        if (!options.headers) {
            options.headers = {};
        }

        const response = await fetch(url,{ ...options });
        return response;
    }
    catch (err) {
        throw err;
    }
};

export default FetchFetchApi;