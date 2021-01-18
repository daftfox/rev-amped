import { EntityRepository, Repository } from 'typeorm';
import { Device } from '../model/device';
import * as extensions from '../model/device/extension';
import { DeviceTypeNotFoundError } from '../model/error';
import { singleton } from 'tsyringe';
import { LoggerService } from '../service/logger.service';

@singleton()
@EntityRepository( Device )
export class DeviceRepository extends Repository<Device> {
    private namespace = 'device-repository';
    constructor() {
        super();
    }

    async findById<T extends Device>( deviceId: string ): Promise<T> {
        LoggerService.debug( `Retrieving device with id ${ LoggerService.highlight(deviceId, 'blue', true) }`, this.namespace );
        const { id, type, platform } = await this.findOneOrFail( deviceId );

        const device = this.createDeviceInstance<T>( id, type );
        device.setPlatform( platform );

        return device;
    }

    // async save<T extends Device>( device: T ): Promise<T> {
    //     return super.save( device );
    // }

    createDeviceInstance<T extends Device>( id: string, type: string ): T {
        LoggerService.debug( `Creating instance with type ${ LoggerService.highlight(type, 'orange', true) } and id ${ LoggerService.highlight(id, 'blue', true) }`, this.namespace );
        try {
            return new(<any>extensions)[type](id, type);
        } catch ( e ) {
            throw new DeviceTypeNotFoundError( `Device of type ${ type } is unsupported.` );
        }
    }
}
