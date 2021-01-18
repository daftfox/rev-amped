import "reflect-metadata";
import { MainController } from './controller/main.controller';
import { container } from 'tsyringe';

const app = container.resolve(MainController);
