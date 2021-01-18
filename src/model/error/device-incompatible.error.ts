export class DeviceIncompatibleError extends Error {
    constructor(message: string) {
        super(message);

        this.name = 'DeviceIncompatibleError';
    }
}
