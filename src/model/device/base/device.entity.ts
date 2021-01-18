import { Entity, Column, PrimaryColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinTable } from 'typeorm';
import { IDevice } from '../interface';
import { Platform } from '../../platform';
import { DeviceUnavailableError, DeviceIncompatibleError } from '../../error';
import { FirmataBoard } from './firmata-board.model';
import { LoggerService } from '../../../service/logger.service';

@Entity()
export class Device {
    @PrimaryColumn()
    id: string;

    @Column({ nullable: true })
    name: string;

    @Column()
    type: string = this.constructor.name;

    @Column({ nullable: true })
    lastUpdateReceived: string;

    @UpdateDateColumn()
    lastUpdated: string;

    currentProgram: string = 'idle'; // @fixme

    @ManyToOne( type => Platform, platform => platform.devices, {
        cascade: true,
        eager: true
    } )
    __platform__: Platform;

    actions: any = {
        BLINK_ON: {
            requiresParams: false,
            method: () => {
                this.firmataBoard.enableBlink();
            },
        },
        BLINK_OFF: {
            requiresParams: false,
            method: () => {
                this.firmataBoard.disableBlink();
            },
        },
        TOGGLE_LED: {
            requiresParams: false,
            method: () => {
                this.firmataBoard.toggleLED();
            },
        },
        SET_PIN_VALUE: {
            requiresParams: true,
            method: (pin: string, value: string) => {
                this.firmataBoard.setPinValue(parseInt(pin, 10), parseInt(value, 10));
            },
        },
    };

    protected __baudRate__ = 9600;

    /**
     * Local instance of {@link FirmataBoard} that is used to connect and talk to physical devices supporting the firmata protocol.
     */
    protected __firmataBoard__: FirmataBoard;

    protected namespace = 'device-';

    protected readonly __defaultPlatform__: string = 'Arduino UNO';

    constructor( id: string ) {
        this.id = id;
        this.namespace += this.id;
    }

    get firmataBoard(): FirmataBoard {
        return this.__firmataBoard__;
    }

    setFirmataBoard( firmataBoard: FirmataBoard ) {
        this.__firmataBoard__ = firmataBoard;
        this.updateFirmataBoardConfiguration();
    }

    get platform(): Platform {
        return this.__platform__;
    }

    // set platform( platform: Platform ) {
    //     this.__platform__ = platform;
    // }

    setPlatform( platform: Platform ) {
        this.__platform__ = platform;
        this.updateFirmataBoardConfiguration();
    }

    setBaudRate( baudRate: number ) {
        this.__baudRate__ = baudRate;
        this.updateFirmataBoardConfiguration();
    }

    get baudRate(): number {
        return this.__baudRate__;
    }

    get defaultPlatform(): string {
        return this.__defaultPlatform__;
    }

    /**
     * Returns an array with strings describing the actions this type of device is able to perform
     */
    getActions(): string[] {
        return Object.keys( this.actions );
    }


    setIdle(): void {
        this.currentProgram = 'idle'; // @fixme
    }

    /**
     * Execute an action. Checks if the action is actually available before attempting to execute it
     *
     * @throws {DeviceUnavailableError} Device is not online or otherwise unavailable
     * @throws {DeviceIncompatibleError} The action cannot be executed because this device doesn't support it
     */
    executeAction( action: string, parameters?: string[] ): void {
        if ( !this.firmataBoard.isOnline ) {
            throw new DeviceUnavailableError( `Unable to execute action on this board since it is not online.` );
        }
        if ( !this.isAvailableAction( action ) ) {
            throw new DeviceIncompatibleError( `'${ action }' is not a valid action for this board.` );
        }

        LoggerService.debug( `Executing method ${ LoggerService.highlight( action, 'green', true ) }.`, this.namespace );

        const method = this.actions[action].method;

        if ( parameters && parameters.length ) {
            method( ...parameters );
        } else {
            method();
        }

        // @TODO fix
        // this.emitUpdate();
    }

    get dataValues(): IDevice {
        return {
            id: this.id,
            name: this.name,
            type: this.type,
            currentProgram: this.currentProgram,
            online: this.firmataBoard.isOnline(),
            lastUpdateReceived: this.lastUpdateReceived,
            platform: this.platform.name,
            availableActions: this.getActions(),
            pins: this.firmataBoard.getPins(),
        };
    }

    private updateFirmataBoardConfiguration(): void {
        if ( this.firmataBoard ) {
            this.firmataBoard.setBaudRate( this.baudRate );
            this.firmataBoard.setPlatform( this.platform );
        }
    }

    /**
     * Returns true if the action exists in the list of {@link Device.actions}
     */
    private isAvailableAction( action: string ): boolean {
        return this.getActions().findIndex( _action => _action === action ) >= 0;
    }
}
