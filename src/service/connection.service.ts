import { injectable } from 'tsyringe';
import { DeviceService } from './device.service';
import { Socket } from 'net';
import { Device, FirmataBoard } from '../model/device/base';
import { matchDeviceDisonnectedEvent, matchDeviceReadyEvent, } from '../model/event/matcher';
import { LoggerService } from './logger.service';
import { DeviceDisconnectedEvent } from '../model/event/base';

// @injectable()
export abstract class ConnectionService {
    /**
     * Namespace used by the {@link LoggerService}
     *
     * @access protected
     * @type {string}
     */
    protected namespace = 'connection-service';

    private static CONNECTION_TIMEOUT = 10000;

    protected constructor( protected deviceService: DeviceService ) {}

    /**
     * Sets up a connection to a board.
     *
     * @param {Socket} port - A {@link Socket} object or serial port address
     */
    protected async connectToDevice( port: string | Socket ): Promise<Device> {
        const firmataBoard = new FirmataBoard( port );

        firmataBoard.event.attach( matchDeviceDisonnectedEvent, event => this.handleDisconnectEvent( event ) );

        try {
            await firmataBoard.event.waitFor( matchDeviceReadyEvent, ConnectionService.CONNECTION_TIMEOUT );
            return await this.handleConnectionEstablished( firmataBoard );
        } catch ( e ) {
            // if ( e instanceof DeviceTypeNotFoundError ) {
                LoggerService.error( e );
            // }
        } finally {

        }
    }

    protected abstract handleDisconnectEvent( event: DeviceDisconnectedEvent ): void;

    //
    // private handleUpdateEvent = (update: IBoard): void => {
    //     // this.model.updateBoard(update);
    // };
    //
    // private handleConnectionTimeout = (__firmataBoard__: FirmataBoard) => {
    //     LoggerService.warn('Timeout while connecting to device.', this.namespace);
    //
    //     __firmataBoard__.removeAllListeners();
    // };
    //
    private async handleConnectionEstablished( firmataBoard: FirmataBoard ): Promise<Device> {
        LoggerService.info(`Device ${ LoggerService.highlight( firmataBoard.id, 'blue', true ) } connected.`, this.namespace );
        const device = await this.deviceService.handleConnectedDevice( firmataBoard );

        device.executeAction( 'BLINK_ON' );

        return device;
    };
}
