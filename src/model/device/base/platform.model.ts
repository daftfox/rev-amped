// import { IPinMap } from '../interface';
//
// export class Platform {
//     readonly name: string;
//     readonly pinMap: IPinMap;
//
//     constructor(name: string, pinMap: IPinMap) {
//         this.name = name;
//         this.pinMap = pinMap;
//     }
//
//     static isSupported(platform: Platform): boolean {
//         const supportedPlatforms = Object.keys(SUPPORTED_PLATFORMS).map( key => SUPPORTED_PLATFORMS[key].name);
//         return supportedPlatforms.indexOf(platform.name) >= 0;
//     }
// }
//
// export const SUPPORTED_PLATFORMS = {
//     ARDUINO_UNO: new Platform('Arduino UNO', { LED: 13, RX: 1, TX: 0 }),
//     ESP_8266: new Platform('ESP8266', { LED: 2, RX: 3, TX: 1 }),
// };
