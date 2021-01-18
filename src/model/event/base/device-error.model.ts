import { DeviceEvent } from './device-event.model';

export class DeviceErrorEvent extends DeviceEvent {

    error: Error;

    constructor( deviceId: string, error: Error ) {
        super( deviceId );

        this.error = error;
    }
}
