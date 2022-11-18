import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Blog, BlogModel } from '../../entity/blog.schema';
import { CreateBlogExtendsDto } from '../../dto';
import { BlogsRepositoryInterface } from '../../interfaces/blogs.repository.interface';
import { MainRepository } from '../../../shared/infrastructure/repository/main.repository';

@Injectable()
export class BlogsRepository
	extends MainRepository<BlogModel, CreateBlogExtendsDto>
	implements BlogsRepositoryInterface
{
	constructor(
		@InjectModel(Blog.name)
		private readonly blogModel: Model<BlogModel>,
	) {
		super(blogModel);
	}

	/*async create(data: CreateBlogExtendsDto): Promise<BlogModel> {
		return new this.blogModel(data);
	}

	async find(id: string): Promise<BlogModel | null> {
		return this.blogModel.findById(id);
	}

	async save(blogModel: BlogModel): Promise<BlogModel> {
		return blogModel.save();
	}

	async delete(blogModel: BlogModel): Promise<void> {
		await blogModel.delete();
	}

	/*async deleteAll(): Promise<void> {
		await this.blogModel.deleteMany();
	}*/
}
