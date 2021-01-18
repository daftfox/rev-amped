import { IArguments } from '../interface';

export class AppConfiguration {
    serial: boolean;
    debug: boolean;
    ethernet: boolean;

    constructor({ S, d, E }: IArguments) {
        this.serial = S;
        this.debug = d;
        this.ethernet = E;
    }
}
