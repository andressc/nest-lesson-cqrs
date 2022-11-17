import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { LikesRepositoryInterface } from '../../interfaces/likes.repository.interface';
import { Like, LikeModel } from '../../entity/like.schema';
import { CreateLikeExtendsDto } from '../../dto/create-like-extends.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class LikesRepository implements LikesRepositoryInterface {
	constructor(
		@InjectModel(Like.name)
		private readonly likeModel: Model<LikeModel>,
	) {}

	async find(id: string): Promise<LikeModel | null> {
		return this.likeModel.findById(id);
	}

	async create(data: CreateLikeExtendsDto): Promise<LikeModel> {
		return new this.likeModel(data);
	}

	async findLikeByItemIdAndUserId(itemId: ObjectId, userId: ObjectId): Promise<LikeModel> {
		return this.likeModel.findOne({ itemId, userId });
	}

	async setBan(userId: ObjectId, isBanned: boolean): Promise<void> {
		await this.likeModel.updateMany({ userId }, { isBanned });
	}

	async save(likeModel: LikeModel): Promise<LikeModel> {
		return likeModel.save();
	}

	async delete(likeModel: LikeModel): Promise<void> {
		await likeModel.delete();
	}

	async deleteAll(): Promise<void> {
		await this.likeModel.deleteMany();
	}
}
