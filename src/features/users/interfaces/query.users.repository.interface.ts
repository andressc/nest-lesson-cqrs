import { UserModel } from '../entity/user.schema';
import { MainQueryRepositoryInterface } from '../../shared/interfaces/main.query.repository.interface';

/* eslint-disable */
export interface QueryUsersRepositoryInterface
	extends MainQueryRepositoryInterface<UserModel> {
	searchTerm(login: string | undefined, email: string | undefined): Record<string, unknown>;
}
