import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import * as Joi from 'joi'

import { AuthModule } from './auth/auth.module'
import { DeviceAuthGuard } from './auth/guards/device-auth.guard'
import { HttpExceptionFilter } from './common/filters'
import { LoggingInterceptor } from './common/interceptors'
import { environmentVariables } from './configs'
import { TypedConfigModule } from './configs/typed-config.module'
import { HealthModule } from './health/health.module'
import { JourneysModule } from './journeys/journeys.module'
import { LessonsModule } from './lessons/lessons.module'
import { MetricsModule } from './metrics/metrics.module'
import { OnboardingModule } from './onboarding/onboarding.module'
import { PrismaModule } from './prisma/prisma.module'
import { UsersModule } from './users/users.module'
import { WebSocketRpcModule } from './websocket-rpc'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object(environmentVariables),
    }),
    TypedConfigModule,
    PrismaModule,
    MetricsModule,
    AuthModule,
    HealthModule,
    UsersModule,
    JourneysModule,
    LessonsModule,
    OnboardingModule,
    WebSocketRpcModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: DeviceAuthGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})
export class AppModule {}
