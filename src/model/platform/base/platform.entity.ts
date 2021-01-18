import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { IPinMap } from '../../device/interface';
import { Device } from '../../device/base';
import { SERIAL_PORT_ID } from 'firmata';

@Entity()
export class Platform {
    @PrimaryGeneratedColumn()
    readonly id: number;

    @Column({ unique: true } )
    readonly name: string;

    @Column( 'simple-json' )
    readonly pinMap: IPinMap;

    @Column()
    readonly serialPortId: SERIAL_PORT_ID;

    @OneToMany( type => Device, device => device.platform )
    devices: Device[];

    constructor( name: string, pinMap: IPinMap, serialPortId: SERIAL_PORT_ID ) {
        this.name = name;
        this.pinMap = pinMap;
        this.serialPortId = serialPortId;
    }
}
