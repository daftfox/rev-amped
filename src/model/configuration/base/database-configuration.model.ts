import { IArguments } from '../interface';
import { DatabaseType } from 'typeorm';

export const databaseTypes: ReadonlyArray<DatabaseType> = [
    'mysql',
    'postgres',
    'cockroachdb',
    'sap',
    'mariadb',
    'sqlite',
    'cordova',
    'react-native',
    'nativescript',
    'sqljs',
    'oracle',
    'mssql',
    'mongodb',
    'aurora-data-api',
    'aurora-data-api-pg',
    'expo'
];

export class DatabaseConfiguration {
    username: string;
    password: string;
    host: string;
    port: number;
    type: DatabaseType;
    database: string;
    debug: boolean;

    constructor({ du, dpw, dh, dp, dt, ds, d }: IArguments) {
        this.username = du;
        this.password = dpw;
        this.host = dh;
        this.port = dp;
        this.type = dt as DatabaseType;
        this.database = ds;
        this.debug = d;
    }
}
