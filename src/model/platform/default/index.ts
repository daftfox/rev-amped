import { arduinoUno } from './arduino-uno';
import { esp8266 } from './esp-8266';
import { Platform } from '../base';

export const defaultPlatforms: Platform[] = [ arduinoUno, esp8266 ];
