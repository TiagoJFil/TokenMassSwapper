import { Inject, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { User } from "src/model/entities/user";
import { Repository } from "typeorm";


@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ){}

    async createUser() {
        const user = new User();
        return await this.userRepository.save(user);
    }
}