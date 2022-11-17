import { Inject, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { PasswordRecoveryTokenDataDto } from '../dto';
import { EmailBadRequestException } from '../../../../common/exceptions';
import { AuthConfig } from '../../../../configuration';
import { UserModel } from '../../../admin/users/entity/user.schema';
import { UsersRepositoryInterface } from '../../../admin/users/interfaces/users.repository.interface';
import { UserInjectionToken } from '../../../admin/users/application/user.injection.token';

@Injectable()
export class PasswordRecoveryTokenStrategy extends PassportStrategy(
	Strategy,
	'jwt-recovery-password',
) {
	constructor(
		@Inject(UserInjectionToken.USER_REPOSITORY)
		private readonly usersRepository: UsersRepositoryInterface,
		private readonly authConfig: AuthConfig,
	) {
		super({
			jwtFromRequest: ExtractJwt.fromExtractors([
				(request: Request) => {
					return request?.body?.recoveryCode;
				},
			]),

			ignoreExpiration: false,
			secretOrKey: authConfig.getRecoveryTokenSecret(),
			passReqToCallback: true,
		});
	}

	async validate(req: Request, payload: any): Promise<PasswordRecoveryTokenDataDto> {
		const user: UserModel = await this.usersRepository.findUserByEmail(payload.sub);
		if (!user) throw new EmailBadRequestException();

		return {
			userId: user._id,
		};
	}
}
