import { DeviceEvent } from './device-event.model';
import { IDevice } from '../../device/interface';

/*
 * @deprecated
 */
export class DeviceConnectedEvent extends DeviceEvent {
    device: IDevice;
    isNewDevice: boolean;

    constructor( device: IDevice, isNewDevice: boolean ) {
        super( device.id );

        this.device = device;
        this.isNewDevice = isNewDevice;
    }
}
