export class DeviceTypeNotFoundError extends Error {
    constructor(message: string) {
        super(message);

        this.name = 'DeviceTypeNotFoundError';
    }
}
