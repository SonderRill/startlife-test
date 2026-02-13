import { TypedBody } from '@nestia/core'
import { Controller, Post } from '@nestjs/common'

import { AuthService } from './auth.service'
import { Public } from './decorators/public.decorator'
import { AuthResponseDto } from './dto/auth-response.dto'
import { RegisterDeviceBodyDto } from './dto/register-device-body.dto'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * @tag Auth
   * @summary Register or login by device (returns JWT)
   */
  @Public()
  @Post('device')
  async registerDevice(
    @TypedBody() body: RegisterDeviceBodyDto,
  ): Promise<AuthResponseDto> {
    return this.authService.registerOrLogin(body)
  }
}
