import { Injectable, NotFoundException } from '@nestjs/common'

import { PrismaService } from '../prisma/prisma.service'
import { UserOutputDto } from './dto/user-output.dto'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string): Promise<UserOutputDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, deviceId: true, platform: true },
    })
    if (!user) {
      throw new NotFoundException('User not found')
    }
    return user
  }

  async eraseUserData(userId: string): Promise<{ success: boolean }> {
    await this.prisma.user.delete({
      where: { id: userId },
    })
    return { success: true }
  }
}
