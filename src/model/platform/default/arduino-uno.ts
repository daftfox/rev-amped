import { Platform } from '../base';
import { SERIAL_PORT_ID } from 'firmata';

export const arduinoUno = new Platform( 'Arduino Uno', { LED: 13, RX: 1, TX: 0 }, SERIAL_PORT_ID.SW_SERIAL0 );
