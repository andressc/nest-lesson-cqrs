import { CreatePostExtendsDto } from '../dto';
import { PostModel } from '../entity/post.schema';
import { MainRepositoryInterface } from '../../shared/interfaces/main.repository.interface';

/* eslint-disable */
export interface PostsRepositoryInterface
	extends MainRepositoryInterface<PostModel, CreatePostExtendsDto> {
}