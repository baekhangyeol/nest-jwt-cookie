import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { addTransactionalDataSource } from 'typeorm-transactional';
import { DataSource } from 'typeorm';
import { AuthModule } from './auth/auth.module';
import * as Joi from 'joi';

@Module({
    imports: [
    ConfigModule.forRoot({
        envFilePath: '.env',
        validationSchema: Joi.object({
          JWT_SECRET: Joi.string().required(),
          JWT_EXPIRATION_TIME: Joi.string().required(),
        }),
        isGlobal: true,
      }),
      TypeOrmModule.forRootAsync({
        useFactory() {
          return {
            type: 'mysql',
            host: process.env.DB_HOST,
            port: parseInt(process.env.DB_PORT),
            username: process.env.DB_USERNAME,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE,
            synchronize: process.env.DB_SYNC === 'true',
            entities: [__dirname + '/**/*.entity{.ts,.js}'],
            timezone: 'Z',
          };
        },
        async dataSourceFactory(options) {
          if (!options) {
            throw new Error('Invalid options passed');
          }

          return addTransactionalDataSource(new DataSource(options));
        },
      }),
      AuthModule,
    ],
    controllers: [],
    providers: [],
})
export class AppModule {}
