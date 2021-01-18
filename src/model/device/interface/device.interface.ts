import { IPin } from './pin.interface';
import { Platform } from '../../platform';

export interface IDevice {
    id: string;
    name: string;
    type: string;
    currentProgram: string;
    online: boolean;
    lastUpdateReceived: string;
    platform: string;
    availableActions: string[];
    pins: IPin[];
}
