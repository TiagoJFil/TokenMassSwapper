import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "src/model/entities/user.entity";
import { Repository } from "typeorm";


@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private userRepository: Repository<UserEntity>,
    ){}

    async createUser() {
        const user = new UserEntity();
        return await this.userRepository.save(user);
    }
}