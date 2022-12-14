import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginationCalc, PaginationDto } from '../../../../common/dto';
import { QueryCommentDto } from '../../dto';
import { CommentModel } from '../../entity/comment.schema';
import { PaginationService } from '../../../../shared/pagination/application/pagination.service';
import { QueryCommentsRepositoryInterface } from '../../interfaces/query.comments.repository.interface';
import { QueryPostsRepositoryInterface } from '../../../posts/interfaces/query.posts.repository.interface';
import { Inject } from '@nestjs/common';
import { CommentInjectionToken } from '../comment.injection.token';
import { PostInjectionToken } from '../../../posts/application/post.injection.token';
import { ResponseCommentOfPostsDto } from '../../dto/response-comment-of-posts.dto';

export class FindAllCommentOfPostsCommand {
	constructor(public query: QueryCommentDto, public currentUserId: string | null) {}
}

@QueryHandler(FindAllCommentOfPostsCommand)
export class FindAllCommentOfPostsHandler implements IQueryHandler<FindAllCommentOfPostsCommand> {
	constructor(
		@Inject(CommentInjectionToken.QUERY_COMMENT_REPOSITORY)
		private readonly queryCommentsRepository: QueryCommentsRepositoryInterface,
		@Inject(PostInjectionToken.QUERY_POST_REPOSITORY)
		private readonly queryPostsRepository: QueryPostsRepositoryInterface,
		private readonly paginationService: PaginationService,
	) {}

	async execute(
		command: FindAllCommentOfPostsCommand,
	): Promise<PaginationDto<ResponseCommentOfPostsDto[]>> {
		const searchString = { blogUserId: command.currentUserId };

		const totalCount: number = await this.queryCommentsRepository.count(searchString);
		const paginationData: PaginationCalc = this.paginationService.pagination({
			...command.query,
			totalCount,
		});

		const comments: CommentModel[] = await this.queryCommentsRepository.findQuery(
			searchString,
			paginationData.sortBy,
			paginationData.skip,
			paginationData.pageSize,
		);

		let likesInfo;

		return {
			pagesCount: paginationData.pagesCount,
			page: paginationData.pageNumber,
			pageSize: paginationData.pageSize,
			totalCount: totalCount,
			items: comments.map((v: CommentModel) => {
				likesInfo = this.queryCommentsRepository.countLikes(v, command.currentUserId);

				return {
					id: v._id.toString(),
					content: v.content,
					createdAt: v.createdAt,
					likesInfo: likesInfo,
					commentatorInfo: {
						userId: v.userId,
						userLogin: v.userLogin,
					},
					postInfo: {
						id: v.postId,
						title: v.postTitle,
						blogId: v.blogId,
						blogName: v.blogName,
					},
				};
			}),
		};
	}
}
