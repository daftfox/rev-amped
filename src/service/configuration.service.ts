import * as yargs from 'yargs';
import { IArguments } from '../model/configuration';
import { AppConfiguration, DatabaseConfiguration, databaseTypes } from '../model/configuration';
import { singleton } from 'tsyringe';

@singleton()
export class ConfigurationService {
    private readonly arguments: IArguments;

    get databaseConfiguration(): DatabaseConfiguration {
        return new DatabaseConfiguration( this.arguments );
    }

    get webSocketPort(): number {
        return this.arguments.p;
    }

    get ethernetPort(): number {
        return this.arguments.e;
    }

    get appConfiguration(): AppConfiguration {
        return new AppConfiguration( this.arguments );
    }

    constructor() {
console.log('configuration service');

        this.arguments = yargs
            .options({
                p: { type: 'number', description: 'Web-socket port', default: 3001, alias: 'web-socket-port' },
                e: { type: 'number', description: 'Ethernet port', default: 9000, alias: 'ethernet-port' },
                d: { type: 'boolean', description: 'Enable debug logging', default: false, alias: 'debug' },
                S: { type: 'boolean', description: 'Enable serial listener', default: false, alias: 'serial' },
                E: { type: 'boolean', description: 'Enable ethernet listener', default: false, alias: 'ethernet' },
                ds: { type: 'string', description: 'Database schema to use', default: 'rev-amped', alias: 'database-schema' },
                dh: { type: 'string', description: 'Database host to use', default: 'localhost', alias: 'database-host' },
                dp: { type: 'number', description: 'Database port to use', default: 5432, alias: 'database-port' },
                du: { type: 'string', description: 'Database user to use', default: 'postgres', alias: 'database-user' },
                dpw: { type: 'string', description: 'Database password to use', default: 'admin1234', alias: 'database-password' },
                dt: { type: 'string', choices: databaseTypes, description: 'Database dialect to use', default: 'postgres', alias: 'database-type' },
            })
            .example('$0 -E -e 1337', 'Enable ethernet listener on port 1337')
            .example('$0 -E -S -p 8080', 'Enable ethernet and serial, bind web-socket to port 8080')
            .epilog('enjoy :)')
            .help('h')
            .alias('h', 'help')
            .argv;

        if ( this.appConfiguration.debug ) {
            process.env.debug = 'true';
        }
    }
}
