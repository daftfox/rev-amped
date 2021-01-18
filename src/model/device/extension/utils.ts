// import { Device } from '../base';
// import * as extensions from './index';
// import { IExtensionClasses, IExtensionKeys } from '../interface';
// import { LedController } from './index';
// import { MajorTom } from './index';
//
// export const AVAILABLE_EXTENSIONS_CLASSES = ((): IExtensionClasses => {
//     const classes = {
//         Device,
//     };
//
//     for (const extension of Object.keys(extensions)) {
//         classes[extension] = extensions[extension];
//     }
//
//     return classes;
// })();
//
// export const AVAILABLE_EXTENSIONS_KEYS = ((): IExtensionKeys => {
//     const keys = {
//         Board: 'Board',
//     };
//
//     for (const extension of Object.keys(extensions)) {
//         keys[extension] = extensions[extension].name;
//     }
//
//     return keys;
// })();
//
// export const isAvailableExtension = (type: string): boolean => {
//     return Object.keys(AVAILABLE_EXTENSIONS_CLASSES).includes(type);
// };

import { uint8 } from '../type';
import { InvalidArgumentError } from '../../error';

export const toUint8 = ( input: number | string ): uint8 => {
    let output = typeof input === 'string' ? parseInt( input, 10 ) : input;

    if ( output < 0 || output > 255 ) throw new InvalidArgumentError( 'Parameter should be an 8 bit number.' );

    return output as uint8;
} ;
