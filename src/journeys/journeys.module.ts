import { Module } from '@nestjs/common'

import { AuthModule } from '../auth/auth.module'
import { PrismaModule } from '../prisma/prisma.module'
import { JourneysController } from './journeys.controller'
import { JourneysService } from './journeys.service'

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [JourneysController],
  providers: [JourneysService],
  exports: [JourneysService],
})
export class JourneysModule {}
