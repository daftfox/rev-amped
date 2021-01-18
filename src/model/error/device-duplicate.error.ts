export class DeviceDuplicateError extends Error {
    constructor(message: string) {
        super(message);

        this.name = 'DeviceDuplicateError';
    }
}
