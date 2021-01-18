import { server as WebSocketServer, request as WebSocketRequest } from 'websocket';
import { Server as HttpServer } from 'http';
import { singleton } from 'tsyringe';
import { ConfigurationService } from './configuration.service';
import { LoggerService } from './logger.service';

@singleton()
export class WebSocketService {
    private namespace = 'web-socket-service';

    private httpServer: HttpServer;
    private webSocketServer: WebSocketServer;

    private readonly routes = {
        '/test/test': this.handleTestRoute.bind( this )
    };

    constructor ( private configurationService: ConfigurationService ) {
        this.listen( this.configurationService.webSocketPort );
    }

    private listen( port: number ): void {
        this.httpServer = new HttpServer().listen( port );
        this.webSocketServer = new WebSocketServer({
            httpServer: this.httpServer
        });

        this.webSocketServer.on( 'request', ( request: WebSocketRequest ) => {
            const route = this.routes[ request.resourceURL.path ];
            if ( route ) {
                route( request );
            } else {
                request.reject(404, 'you dun goofed');
            }
        } );
    }

    private handleTestRoute( request: WebSocketRequest ): void {
        const client = request.accept( null, request.origin );
        LoggerService.info( request.resourceURL.path, this.namespace );

        client.send('boink')
    }
}
