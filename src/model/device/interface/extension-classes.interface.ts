import { Device } from '../base';
import { IDevice } from './device.interface';

export interface IExtensionClasses<T extends IDevice> {
    [key: string]: new (id: string) => T;
}
