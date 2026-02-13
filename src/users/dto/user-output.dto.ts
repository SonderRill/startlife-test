import type { UserModel } from '../../../prisma/generated/prisma/models'

export type UserOutputDto = Pick<UserModel, 'id' | 'deviceId' | 'platform'>
