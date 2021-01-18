import { ConnectionService } from './connection.service';
import { DeviceService } from './device.service';
import { singleton } from 'tsyringe';
import { Server, Socket } from 'net';
import { ConfigurationService } from './configuration.service';
import { LoggerService } from './logger.service';
import { DeviceDisconnectedEvent } from '../model/event/base';

@singleton()
export class EthernetService extends ConnectionService {
    protected namespace = 'ethernet-service';
    /**
     * @access private
     * @type {Server}
     */
    private server: Server;

    constructor( protected deviceService: DeviceService,
                 private configurationService: ConfigurationService ) {
        super( deviceService );
        this.listen();
    }

    public closeServer(): void {
        this.server.close();
    }

    private listen(): void {
        const port = this.configurationService.ethernetPort;

        LoggerService.info(
            `Listening on port ${ LoggerService.highlight( port.toString( 10 ), 'yellow', true ) }.`,
            this.namespace,
        );

        this.server = new Server( this.handleConnectionRequest );
        this.server.listen( port );
    }

    protected handleDisconnectEvent( { port }: DeviceDisconnectedEvent ): void {
        (port as Socket).end();
        (port as Socket).destroy();
    }

    private handleConnectionRequest = ( socket: Socket ): void => {
        LoggerService.debug( `New connection attempt`, this.namespace );

        this.connectToDevice( socket );
    };
}
