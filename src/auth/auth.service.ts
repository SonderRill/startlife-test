import { Injectable } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

import { PrismaService } from '../prisma/prisma.service'
import { JwtPayload } from './decorators/current-user.decorator'
import { AuthResponseDto } from './dto/auth-response.dto'
import { RegisterDeviceBodyDto } from './dto/register-device-body.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async registerOrLogin(body: RegisterDeviceBodyDto): Promise<AuthResponseDto> {
    let user = await this.prisma.user.findUnique({
      where: { deviceId: body.deviceId },
    })

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          deviceId: body.deviceId,
          platform: body.platform,
        },
      })
    } else if (user.platform !== body.platform) {
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { platform: body.platform },
      })
    }

    const payload: JwtPayload = { sub: user.id, deviceId: user.deviceId }
    const accessToken = this.jwtService.sign(payload)

    return {
      accessToken,
      user: {
        id: user.id,
        deviceId: user.deviceId,
        platform: user.platform,
      },
    }
  }
}
