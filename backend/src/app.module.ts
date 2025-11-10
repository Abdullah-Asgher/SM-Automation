import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { OAuthModule } from './oauth/oauth.module';
import { JobsModule } from './jobs/jobs.module';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(databaseConfig),
    ScheduleModule.forRoot(),
    OAuthModule,
    JobsModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
