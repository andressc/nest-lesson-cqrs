import { QueryBlogDto } from '../../dto';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { PaginationCalc, PaginationDto } from '../../../../common/dto';
import { PaginationService } from '../../../../shared/pagination/application/pagination.service';
import { QueryBlogsRepositoryInterface } from '../../interfaces/query.blogs.repository.interface';
import { ForbiddenException, Inject } from '@nestjs/common';
import { BlogInjectionToken } from '../blog.injection.token';
import { ResponseBannedBlogOfUserDto } from '../../dto/response-banned-blog-of-user.dto';
import { BanModel } from '../../entity/ban.schema';
import { BlogsRepositoryInterface } from '../../interfaces/blogs.repository.interface';
import { BlogModel } from '../../entity/blog.schema';
import { BlogsService } from '../blogs.service';

export class FindAllBannedBlogOfUserCommand {
	constructor(public blogId: string, public query: QueryBlogDto, public currentUserId: string) {}
}

@QueryHandler(FindAllBannedBlogOfUserCommand)
export class FindAllBannedBlogOfUserHandler
	implements IQueryHandler<FindAllBannedBlogOfUserCommand>
{
	constructor(
		private readonly blogsService: BlogsService,
		@Inject(BlogInjectionToken.QUERY_BLOG_REPOSITORY)
		private readonly queryBlogsRepository: QueryBlogsRepositoryInterface,
		@Inject(BlogInjectionToken.BLOG_REPOSITORY)
		private readonly blogsRepository: BlogsRepositoryInterface,
		private readonly paginationService: PaginationService,
	) {}

	async execute(
		command: FindAllBannedBlogOfUserCommand,
	): Promise<PaginationDto<ResponseBannedBlogOfUserDto[]>> {
		const searchString = command.query.searchNameTerm
			? {
					blogName: {
						$regex: command.query.searchNameTerm,
						$options: 'i',
					},
					blogId: command.blogId,
					isBanned: true,
			  }
			: { blogId: command.blogId, isBanned: true };

		const blog: BlogModel = await this.blogsService.findBlogOrErrorThrow(command.blogId);
		if (blog.userId !== command.currentUserId) throw new ForbiddenException();

		const totalCount: number = await this.queryBlogsRepository.countBan(searchString);
		const paginationData: PaginationCalc = this.paginationService.pagination({
			...command.query,
			totalCount,
		});

		const ban: BanModel[] = await this.queryBlogsRepository.findBanModel(
			searchString,
			paginationData.sortBy,
			paginationData.skip,
			paginationData.pageSize,
		);

		return {
			pagesCount: paginationData.pagesCount,
			page: paginationData.pageNumber,
			pageSize: paginationData.pageSize,
			totalCount: totalCount,
			items: ban.map((v: BanModel) => ({
				id: v._id.toString(),
				login: v.login,
				banInfo: {
					isBanned: v.isBanned,
					banDate: v.banDate,
					banReason: v.banReason,
				},
			})),
		};
	}
}