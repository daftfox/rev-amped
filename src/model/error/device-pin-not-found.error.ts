export class DevicePinNotFoundError extends Error {
    constructor(message: string) {
        super(message);

        this.name = 'DevicePinNotFoundError';
    }
}
