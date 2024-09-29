import { UserEntity } from "./entities/user-entity";

export type LoginResponse = {
	token: string
	user: UserEntity
}
