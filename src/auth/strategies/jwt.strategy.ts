import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

import { JwtPayload } from '../decorators/current-user.decorator'
import { JWT_STRATEGY_NAME } from '../constants'
import { TypedConfigService } from '../../configs'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, JWT_STRATEGY_NAME) {
  constructor(configService: TypedConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    })
  }

  validate(payload: { sub: string; deviceId: string }): JwtPayload {
    return { sub: payload.sub, deviceId: payload.deviceId }
  }
}
