import { singleton } from 'tsyringe';
import { getRepository, QueryFailedError, Repository } from 'typeorm';
import { Platform } from '../model/platform/base';
import { StorageService } from './storage.service';
import { defaultPlatforms } from '../model/platform/default';
import { LoggerService } from './logger.service';

@singleton()
export class PlatformService {
    private namespace = 'platform-service';
    private platformRepository: Repository<Platform>;

    constructor( private storageService: StorageService ) {
        this.storageService.connectionReadyEvent.attachOnce( this.initialiseRepository );
    }

    getByName( name: string ): Promise<Platform> {
        return this.platformRepository.findOne( { name: name } );
    }

    private initialiseRepository = (): void => {
        this.platformRepository = getRepository( Platform );
        this.insertDefaultEntities();
    };

    private async insertDefaultEntities(): Promise<void> {
        try {
            await this.platformRepository.save( defaultPlatforms );
            LoggerService.debug( 'Default platform entities were inserted successfully', this.namespace );
        } catch ( e ) {
            if ( e instanceof QueryFailedError) {
                LoggerService.debug( 'Default platform entities have already been inserted', this.namespace );
            }
        }
    }
}
