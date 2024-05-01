import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import User from "./user.entity";
import { Repository } from "typeorm";
import CreateUserDto from "./dto/create-user.dto";

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>
    ) { }
    
    async getByEmail(email: string) {
        const user = await this.userRepository.findOne({ where: { email } });
        if (user) {
            return user;
        }
        throw new HttpException(
            '사용자 이메일이 존재하지 않습니다.',
            HttpStatus.NOT_FOUND,
        );
    }

    async create(dto: CreateUserDto) {
        const newUser = await this.userRepository.create(dto);
        await this.userRepository.save(newUser);
        return newUser;
    }

    async getById(id: number) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (user) {
            return user;
        }

        throw new HttpException(
            '사용자가 존재하지 않습니다.',
            HttpStatus.NOT_FOUND,
        );
    }
}