import { Platform } from '../base';
import { SERIAL_PORT_ID } from 'firmata';

export const esp8266 = new Platform( 'ESP8266', { LED: 2, RX: 3, TX: 1 }, SERIAL_PORT_ID.SW_SERIAL0 );
