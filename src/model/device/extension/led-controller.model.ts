import { Device } from '../base';
import { toUint8 } from './utils';
import { uint8 } from '../type';

export class LedController extends Device {
    /**
     * The baud rate at which the LED controller shield communicates over UART.
     * This is 9600 baud by default
     *
     * @type {number}
     */
    protected __baudRate__ = 9600;

    private static PAYLOAD_HEADER = '[';
    private static PAYLOAD_FOOTER = ']';

    private static LED_COMMANDS = {
        SET_COLOR: 'C',
        PULSE_COLOR: 'P',
        SET_BRIGHTNESS: 'B',
        RAINBOW: 'R',
        // RETRO: '8', // not implemented
        KITT: 'K',
    };

    protected namespace = 'led-controller-';
    protected readonly __defaultPlatform__ = 'ESP8266';

    constructor( id: string ) {
        super( id );

        Object.assign( this.actions,{
            RAINBOW: {
                requiresParams: false,
                method: () => {
                    this.rainbow();
                },
            },
            KITT: {
                requiresParams: true,
                method: ( hue: string, saturation: string, value: string ) => {
                    this.kitt( toUint8( hue ), toUint8( saturation ), toUint8( value ) );
                },
            },
            PULSE_COLOR: {
                requiresParams: true,
                method: ( hue: string, saturation: string ) => {
                    this.pulseColor( toUint8( hue ), toUint8( saturation ) );
                },
            },
            SET_COLOR: {
                requiresParams: true,
                method: ( hue: string, saturation: string, value: string ) => {
                    this.setColor( toUint8( hue ), toUint8( saturation ), toUint8( value ) );
                },
            },
        });
    }

    private static buildPayload(command: string, ...parameters: any[]): any[] {
        return [LedController.PAYLOAD_HEADER, command, ...parameters, LedController.PAYLOAD_FOOTER];
    }

    private pulseColor( hue: uint8, saturation: uint8 ): void {
        this.firmataBoard.serialWriteBytes(
            LedController.buildPayload( LedController.LED_COMMANDS.PULSE_COLOR, hue, saturation ),
        );
    }

    private setColor( hue: uint8, saturation: uint8, value: uint8 ): void {
        this.firmataBoard.serialWriteBytes(
            LedController.buildPayload( LedController.LED_COMMANDS.SET_COLOR, hue, saturation, value ),
        );
    }

    private rainbow(): void {
        this.firmataBoard.serialWriteBytes(
            LedController.buildPayload( LedController.LED_COMMANDS.RAINBOW ),
        );
    }

    private kitt( hue: uint8, saturation: uint8, value: uint8 ): void {
        this.firmataBoard.serialWriteBytes(
            LedController.buildPayload( LedController.LED_COMMANDS.KITT, hue, saturation, value ),
        );
    }
}
