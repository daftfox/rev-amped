export class DeviceUnavailableError extends Error {
    constructor(message: string) {
        super(message);

        this.name = 'DeviceUnavailableError';
    }
}
