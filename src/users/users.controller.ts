import { Controller, Get, Post } from '@nestjs/common'

import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { UserOutputDto } from './dto/user-output.dto'
import { UsersService } from './users.service'

@Controller('users/me')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * @tag User
   * @summary Get current user profile
   * @security bearer
   */
  @Get()
  async getProfile(@CurrentUser('sub') userId: string): Promise<UserOutputDto> {
    return this.usersService.getProfile(userId)
  }

  /**
   * @tag User
   * @summary Erase all user data (GDPR)
   * @security bearer
   */
  @Post('erase')
  async erase(
    @CurrentUser('sub') userId: string,
  ): Promise<{ success: boolean }> {
    return this.usersService.eraseUserData(userId)
  }
}
