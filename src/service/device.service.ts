import { singleton } from 'tsyringe';
import { DeviceRepository } from '../repository';
import { Device, FirmataBoard } from '../model/device/base';
import { getCustomRepository } from 'typeorm';
import { StorageService } from './storage.service';
import { PlatformService } from './platform.service';

@singleton()
export class DeviceService {

    protected namespace = 'device-service';
    private deviceRepository: DeviceRepository;

    constructor( private storageService: StorageService,
                 private platformService: PlatformService ) {
        this.storageService.connectionReadyEvent.attachOnce( this.initialiseRepository.bind( this ) );
    }

    async handleConnectedDevice<T extends Device>( firmataBoard: FirmataBoard ): Promise<T> {
        let device: T;
        const { id, type } = firmataBoard;

        try {
            device = await this.handleExistingDevice( id, firmataBoard );
        } catch ( e ) {
            device = await this.handleNewDevice( id, type, firmataBoard );
        }

        return device;
    }

    private async handleNewDevice<T extends Device>( id: string, type: string, firmataBoard: FirmataBoard ): Promise<T> {
        const device = await this.deviceRepository.createDeviceInstance<T>( id, type );
        device.setFirmataBoard( firmataBoard );
        device.setPlatform( await this.platformService.getByName( device.defaultPlatform ) );
        return this.deviceRepository.save( device );
    }

    private async handleExistingDevice<T extends Device>( id: string, firmataBoard: FirmataBoard ): Promise<T> {
        const device =  await this.deviceRepository.findById<T>( id );
        device.setFirmataBoard( firmataBoard );

        return device;
    }

    async updateDevice<T extends Device>( device: T ): Promise<T> {
        return this.deviceRepository.save( device );
    }

    private initialiseRepository(): void {
        this.deviceRepository = getCustomRepository( DeviceRepository );
    }

    // async deleteBoard<T extends Device>( deviceId: string ): Promise<void> {
    //     await this.deviceRepository.delete( deviceId );
    // }

    // private async initialiseExistingDevice<T extends Device>( deviceId: string, firmataBoard: FirmataBoard ): Promise<T> {
    //     const existingDevice = await this.deviceRepository.findById( deviceId );
    //     return this.initialiseDevice<T>( existingDevice, firmataBoard );
    // }

    // private initialiseDevice<T extends Device>( deviceId: string, type: string, firmataBoard: FirmataBoard ): T {
    //     const initialisedDevice = this.createDeviceInstance<T>( deviceId, type );
    //     initialisedDevice.attachFirmataBoard( firmataBoard );
    //
    //     return initialisedDevice;
    // }
    //
    // private createDeviceInstance<T extends Device>( deviceId: string, type: string ): T {
    //     if ( isAvailableExtension( type ) ) {
    //         return new AVAILABLE_EXTENSIONS_CLASSES[ type ]( deviceId );
    //     } else {
    //         throw new DeviceTypeNotFoundError(
    //             `Type '${ type }' is not a valid type. Valid types are${ Object.values(
    //                 AVAILABLE_EXTENSIONS_KEYS,
    //             ).map( availableExtension => ` '${ availableExtension }'`)}`,
    //         );
    //     }
    // }
}
