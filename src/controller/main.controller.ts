import { container, injectable } from 'tsyringe';
import { ConfigurationService, EthernetService } from '../service';
import { WebSocketService } from '../service/web-socket.service';

@injectable()
export class MainController {
    private ethernetService: EthernetService;
    // private serialService: SerialService;

    constructor( private configurationService: ConfigurationService ) {
        this.initializeServices();
    }

    async initializeServices(): Promise<void> {
        if ( this.configurationService.appConfiguration.ethernet ) {
            this.ethernetService = container.resolve(EthernetService);
        }

        const webSocketService = container.resolve(WebSocketService);

        // if ( this.configurationService.appConfiguration.serial ) {
        //     this.serialService = container.resolve(SerialService);
        // }
    }

}
