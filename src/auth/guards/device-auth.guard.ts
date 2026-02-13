import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'

import { JWT_STRATEGY_NAME } from '../constants'
import { IS_PUBLIC_KEY } from '../decorators/public.decorator'

/**
 * JWT Auth Guard — валидирует Bearer Token
 */
@Injectable()
export class DeviceAuthGuard
  extends AuthGuard(JWT_STRATEGY_NAME)
  implements CanActivate
{
  constructor(private readonly reflector: Reflector) {
    super()
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) {
      return true
    }

    return super.canActivate(context) as Promise<boolean>
  }
}
