import { DatabaseType } from 'typeorm';

export interface IArguments {
    [x: string]: unknown;
    p: number;
    e: number;
    d: boolean;
    S: boolean;
    E: boolean;
    ds: string;
    dh: string;
    dp: number;
    du: string;
    dpw: string;
    dt: string;
}
