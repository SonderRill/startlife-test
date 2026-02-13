import { Controller, Get } from '@nestjs/common'
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  HealthIndicatorFunction,
  HttpHealthIndicator,
  MemoryHealthIndicator,
  PrismaHealthIndicator,
} from '@nestjs/terminus'

import { Public } from '../auth/decorators/public.decorator'
import { TypedConfigService } from '../configs'
import { PrismaService } from '../prisma/prisma.service'

export interface HealthV2OutputDto {
  status: 'ok'
  timestamp: string
}

@Controller('health')
export class HealthController {
  private readonly HEALTHY_MEMORY_HEAP_LIMIT: number
  private readonly HEALTHY_MEMORY_RSS_LIMIT: number
  private readonly HEALTHY_DISC_LIMIT: number

  constructor(
    private readonly health: HealthCheckService,
    private readonly http: HttpHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly configService: TypedConfigService,
    private prisma: PrismaHealthIndicator,
    private prismaService: PrismaService,
  ) {
    this.HEALTHY_MEMORY_HEAP_LIMIT = this.configService.get(
      'HEALTHY_MEMORY_HEAP_LIMIT',
    )

    this.HEALTHY_MEMORY_RSS_LIMIT = this.configService.get(
      'HEALTHY_MEMORY_RSS_LIMIT',
    )

    this.HEALTHY_DISC_LIMIT = this.configService.get('HEALTHY_DISC_LIMIT')
  }

  /**
   * @tag Health
   * @summary Full health check (ping, prisma, memory, disk)
   */
  @Public()
  @Get()
  @HealthCheck()
  async check() {
    const pingCheck: HealthIndicatorFunction = () =>
      this.http.pingCheck('pingCheck', 'https://docs.nestjs.com')

    const prismaCheck: HealthIndicatorFunction = () =>
      this.prisma.pingCheck('prisma', this.prismaService)

    const memoryHeapCheck: HealthIndicatorFunction = () => {
      return this.HEALTHY_MEMORY_HEAP_LIMIT
        ? this.memory.checkHeap('memoryHeap', this.HEALTHY_MEMORY_HEAP_LIMIT)
        : { memoryHeap: { status: 'up' } }
    }

    const memoryRssCheck: HealthIndicatorFunction = () => {
      return this.HEALTHY_MEMORY_RSS_LIMIT
        ? this.memory.checkRSS('memoryRss', this.HEALTHY_MEMORY_RSS_LIMIT)
        : { memoryRss: { status: 'up' } }
    }

    const diskCheck: HealthIndicatorFunction = () => {
      return this.HEALTHY_DISC_LIMIT
        ? this.disk.checkStorage('disk', {
            path: '/',
            thresholdPercent: this.HEALTHY_DISC_LIMIT,
          })
        : { disk: { status: 'up' } }
    }

    return this.health.check([
      pingCheck,
      prismaCheck,
      memoryHeapCheck,
      memoryRssCheck,
      diskCheck,
    ])
  }
}
