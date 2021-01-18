import * as firmata from 'firmata';
import { Pins, SERIAL_PORT_ID } from 'firmata';
import { Socket } from 'net';
import { Evt } from 'evt';
import { DeviceDisconnectedEvent, DeviceErrorEvent, DeviceReadyEvent, DeviceUpdatedEvent, DeviceEvent } from '../../event';
import { interval, Observable, Subject, Subscription, timer } from 'rxjs';
import { map, mergeMap, retry, switchMap, tap, timeout } from 'rxjs/operators';
import { LoggerService } from '../../../service/logger.service';
import { DevicePinNotFoundError, DeviceUnavailableError, InvalidArgumentError } from '../../error';
import { IPin } from '../interface';
import { Platform } from '../../platform/base';

export { SERIAL_PORT_ID, PIN_MODE, PIN_STATE, Pins } from 'firmata';

export class FirmataBoard extends firmata {
    id: string;
    type: string;
    event = Evt.create<DeviceEvent>();

    private namespace = 'firmata-board';
    private heartbeat$: Subscription;

    private __baudRate__: number;
    private __platform__: Platform;

    private blink$: Subscription;
    private firmwareUpdate$= new Subject();
    private readonly port: string | Socket;
    private readonly blinkInterval = 1000;
    private readonly blinkInterval$ = interval( this.blinkInterval );
    private readonly heartbeatInterval = 10000;
    private readonly heartbeatTimeout = 5000;
    private readonly heartbeatInterval$: Observable<number> = timer( 0, this.heartbeatInterval );

    constructor( port: string | Socket ) {
        super( port );

        this.port = port;

        this.once( 'queryfirmware', () => {
            this.id = this.parseId();
            this.type = this.parseType();
            this.namespace += `-${ this.id }`;

            this.attachAnalogPinListeners();
            this.attachDigitalPinListeners();
        } );

        this.on('ready', () => {
            this.startHeartbeat();
            this.event.post( new DeviceReadyEvent( this.id ) );
        });

        this.on('error', ( error: Error ) => {
            this.event.post( new DeviceErrorEvent( this.id, error ) );
        });

        this.on('disconnect', () => {
            this.event.post( new DeviceDisconnectedEvent( 'socket closed', this.id, this.port ) );
        });
    }

    get platform(): Platform {
        return this.__platform__;
    }

    setPlatform( platform: Platform ) {
        this.__platform__ = platform;
        this.setSerialConfig();
    }

    setBaudRate( baudRate: number ) {
        this.__baudRate__ = baudRate;
        this.setSerialConfig();
    }

    get baudRate(): number {
        return this.__baudRate__;
    }

    disconnect(): void {
        this.heartbeat$.unsubscribe();
        this.heartbeat$ = undefined;
    }

    isOnline(): boolean {
        return this.heartbeat$ !== undefined;
    }

    /**
     * Write a value to a pin. Automatically distinguishes between analog and digital pinMapping and calls the corresponding methods.
     */
    setPinValue(pin: number, value: number): void {
        if (!this.pins[pin]) {
            throw new DevicePinNotFoundError(`Attempted to set value of unknown pin ${pin}.`);
        }

        if (this.isAnalogPin(pin)) {
            if (value < 0 || value >= 1024) {
                throw new InvalidArgumentError(
                    `Attempted to write value ${value} to analog pin ${pin}. Only values between or equal to 0 and 1023 are allowed.`,
                );
            } else {
                this.analogWrite(pin, value);
            }
        } else {
            if (value !== FirmataBoard.PIN_STATE.HIGH && value !== FirmataBoard.PIN_STATE.LOW) {
                throw new InvalidArgumentError(
                    `Attempted to write value ${value} to digital pin ${pin}. Only values 1 (HIGH) or 0 (LOW) are allowed.`,
                );
            } else {
                this.digitalWrite(pin, value);
            }
        }

        this.postUpdate();
    }

    /**
     * Enable or disable the builtin LED blinking
     */
    enableBlink(): void {
        if ( this.blink$ && !this.blink$.closed ) throw new DeviceUnavailableError( 'LED blink is already enabled' );

        this.blink$ = this.blinkInterval$.pipe(
            map( _ => this.toggleLED() )
        ).subscribe();
    }

    disableBlink(): void {
        if ( !this.blink$ ) throw new DeviceUnavailableError( 'LED blink is not enabled' );

        this.blink$.unsubscribe();
    }

    /**
     * Toggle the builtin LED on / off. Turns it on if it's off and vice versa.
     */
    toggleLED(): void {
        this.setPinValue(
            this.platform.pinMap.LED,
            this.pins[this.platform.pinMap.LED].value === FirmataBoard.PIN_STATE.HIGH
                ? FirmataBoard.PIN_STATE.LOW
                : FirmataBoard.PIN_STATE.HIGH,
        );
    }

    getPins(): IPin[] {
        return this.pins
            .map((pin: Pins, index: number) =>
                Object.assign({
                    pinNumber: index,
                    analog: pin.analogChannel !== 127
                }, pin),
            )
            .filter((pin: IPin) => pin.supportedModes.length > 0);
    }

    /**
     * Writes a byte-array with the device's specified serial UART interface.
     */
    serialWriteBytes( payload: any[] ): void {
        const buffer = Buffer.allocUnsafe(payload.length);

        payload.forEach((value: any, index: number) => {
            if (typeof value === 'string') {
                buffer.write(value, index);
            } else if (typeof value === 'number') {
                buffer.writeUInt8(value, index);
            } else {
                throw new InvalidArgumentError(`Expected string or number. Received ${typeof value}.`);
            }
        });

        const bytesPayload = [];

        for (const [index, value] of buffer.entries()) {
            bytesPayload.push(value);
        }

        // fixme
        // const checkForAck = ( bytes: number[] ) => {
        //     // check if the first (and likely only) byte received is 0x06, which is an ACK
        //     if ( bytes[0] === 6 ) {
        //         console.log(bytes[0]);
        //         clearInterval( this.serialRetry );
        //         this.firmataBoard.removeListener( `serial-data-${this.firmataBoard.SERIAL_PORT_IDs.SW_SERIAL0}`, checkForAck );
        //     }
        // };
        // this.firmataBoard.serialRead( this.firmataBoard.SERIAL_PORT_IDs.SW_SERIAL0, -1, checkForAck );

        this.serialWrite(this.platform.serialPortId, bytesPayload);

        // fixme
        // this.serialRetry = setInterval( () => {
        //     this.firmataBoard.serialWrite( serialPort, bytesPayload );
        // }, 2000);
    }

    private parseId(): string {
        return this.firmware.name
            .split('_')
            .pop()
            .replace('.ino', '');
    }

    private parseType(): string {
        return this.firmware.name.split('_').shift();
    }

    private setSerialConfig(): void {
        if ( this.baudRate && this.platform ) {
            this.serialConfig({
                portId: this.platform.serialPortId,
                baud: this.baudRate,
                rxPin: this.platform.pinMap.RX,
                txPin: this.platform.pinMap.TX,
            });
        }
    }

    private postUpdate(): void {
        this.event.post( new DeviceUpdatedEvent( this.id ));
    }

    /**
     * Attaches listeners to all digital pinMapping whose modes ({@link FirmataBoard.PIN_MODE}) are setup as INPUT pinMapping.
     * Once the pin's value changes an 'update' event will be emitted by calling the {@link Board.emitUpdate} method.
     */
    private attachDigitalPinListeners(): void {
        this.pins.forEach(( pin: Pins, index: number ) => {
            if ( this.isDigitalPin( index ) ) {
                this.digitalRead( index, this.postUpdate );
            }
        });
    }

    /**
     * Attaches listeners to all analog pinMapping.
     * Once the pin's value changes an 'update' event will be emitted by calling the {@link Board.emitUpdate} method.
     */
    private attachAnalogPinListeners(): void {
        this.analogPins.forEach(( pin: number, index: number ) => {
            this.analogRead( index, this.postUpdate );
        });
    }

    /**
     * Checks whether a pin is a digital pin.
     */
    private isDigitalPin(pinIndex: number): boolean {
        const pin = this.pins[pinIndex];
        return (
            pin.analogChannel === 127 &&
            pin.supportedModes.length > 0 &&
            !pin.supportedModes.includes(FirmataBoard.PIN_MODE.ANALOG)
        );
    }

    /**
     * Check whether a pin is an analog pin.
     */
    private isAnalogPin(pinIndex: number): boolean {
        const pin = this.pins[pinIndex];
        return pin.supportedModes.indexOf(FirmataBoard.PIN_MODE.ANALOG) >= 0;
    }

    private requestFirmwareUpdate(): void {
        this.queryFirmware( () => {
            this.firmwareUpdate$.next();
        } );
    }

    /**
     * Starts an interval requesting the physical board to send its firmware version every 10 seconds.
     * Emits a 'disconnect' event on the local {@link Device.firmataBoard} instance if the device fails to respond within 10 seconds of this query being sent.
     */
    private startHeartbeat(): void {
        this.heartbeatInterval$.pipe(
            map( this.requestFirmwareUpdate.bind( this ) ),
        ).subscribe();

        this.heartbeat$ = this.firmwareUpdate$.pipe(
            timeout( this.heartbeatInterval + this.heartbeatTimeout ),
            retry( 3 ),
        ).subscribe(
            () => {
                LoggerService.debug( LoggerService.highlight('( ( ♡ ) )', 'red', true ), this.namespace );
            }, () => {
                LoggerService.debug( 'Connection timed out', this.namespace );
                this.event.post( new DeviceDisconnectedEvent( 'timeout', this.id, this.port ) );
                this.disconnect();
            }
        );
    }
}
