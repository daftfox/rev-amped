import { DeviceEvent } from './device-event.model';
import { Socket } from 'net';

export class DeviceDisconnectedEvent extends DeviceEvent {
    reason: string;
    port: string | Socket;

    constructor( deviceId: string, reason: string, port: string | Socket ) {
        super( deviceId );

        this.reason = reason;
        this.port = port;
    }
}
