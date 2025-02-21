

//create an exception class to be thrown when a dexhunter api error occurs
export class DexHunterApiError extends Error {
    constructor(message: string) {
        super(message);

        this.name = "DexHunterApiError";
    }
}