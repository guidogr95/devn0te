import { UserEntity } from "./entities/user-entity";

export type RegisterResponse = {
  token: string
  user: UserEntity
}
