import { createConnection, Connection, ConnectionOptions } from 'typeorm';
import * as path from 'path';
import { singleton } from 'tsyringe';
import { ConfigurationService } from './configuration.service';
import { Evt } from 'evt';

@singleton()
export class StorageService {

    connectionReadyEvent = Evt.create<void>();

    constructor( private configurationService: ConfigurationService ) {
        console.log('storage service');
        this.connectToStorage();
    }

    private async connectToStorage(): Promise<void> {
        const connectionOptions = Object.assign({
            entities: [
                path.join(__dirname, '../model/**/*.entity.js'),
            ],
            synchronize: true,
            logging: false,
        }, this.configurationService.databaseConfiguration) as ConnectionOptions;

        await createConnection( connectionOptions );
        this.connectionReadyEvent.post();
    };
}
