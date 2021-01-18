import {
    // DeviceConnectedEvent,
    DeviceDisconnectedEvent,
    DeviceErrorEvent,
    DeviceReadyEvent,
    DeviceUpdatedEvent,
    DeviceEvent,
    // FirmwareUpdatedEvent,
} from '../base';
import { Socket } from 'net';

// export const matchDeviceConnectedEvent = ( event: DeviceEvent ): event is DeviceConnectedEvent => {
//     return event instanceof DeviceConnectedEvent;
// };

export const matchDeviceDisonnectedEvent = ( event: DeviceEvent ): event is DeviceDisconnectedEvent => {
    return event instanceof DeviceDisconnectedEvent;
};

export const matchDeviceUpdatedEvent = ( event: DeviceEvent ): event is DeviceUpdatedEvent => {
    return event instanceof DeviceUpdatedEvent;
};

export const matchDeviceErrorEvent = ( event: DeviceEvent ): event is DeviceErrorEvent => {
    return event instanceof DeviceErrorEvent;
};

export const matchDeviceReadyEvent = ( event: DeviceEvent ): event is DeviceReadyEvent => {
    return event instanceof DeviceReadyEvent;
};

// export const matchFirmwareUpdatedEvent = (event: DeviceEvent): event is FirmwareUpdatedEvent => {
//     return event instanceof FirmwareUpdatedEvent;
// };

// export const matchAndTransformFirmwareUpdate = (event: DeviceEvent): [IDevice] => {
//     if (matchFirmwareUpdatedEvent(event)) return [event.dataValues];
// };
