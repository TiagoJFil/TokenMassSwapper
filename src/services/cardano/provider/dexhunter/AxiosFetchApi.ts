import axios, { AxiosRequestConfig } from 'axios';
import { FetchAPI } from './api';

/**
 * AxiosFetchAPI implementation
 * @param {string} url - The URL to fetch.
 * @param {AxiosRequestConfig} [init] - The Axios request configuration.
 * @returns {Promise<Response>} - A promise that resolves to the response.
 */
const AxiosFetchAPI: FetchAPI = async (url: string, init?: AxiosRequestConfig): Promise<Response> => {
    try {
        //append a X-Forwarded-For header to the request
        if (!init) {
            init = {};
        }
        if (!init.headers) {
            init.headers = {};
        }
        
        const response = await axios({ url, ...init });
        const headers = new Headers();
        if (response.headers) {
            Object.entries(response.headers).forEach(([key, value]) => {
                if (value) {
                    if (Array.isArray(value)) {
                        value.forEach(v => headers.append(key, v));
                    } else {
                        headers.append(key, value.toString());
                    }
                }
            });
        }
        return new Response(JSON.stringify(response.data), {
            status: response.status,
            statusText: response.statusText,
            headers: headers,
        });
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            const headers = new Headers();
            if (error.response.headers) {
                Object.entries(error.response.headers).forEach(([key, value]) => {
                    if (value) {
                        if (Array.isArray(value)) {
                            value.forEach(v => headers.append(key, v));
                        } else {
                            headers.append(key, value.toString());
                        }
                    }
                });
            }

            return new Response(JSON.stringify(error.response.data), {
                status: error.response.status,
                statusText: error.response.statusText,
                headers: headers,
            });
        }
        throw error;
    }
};

export default AxiosFetchAPI;