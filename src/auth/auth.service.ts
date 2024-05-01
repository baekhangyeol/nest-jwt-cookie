import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from 'src/users/user.service';
import { compare, hash } from 'bcrypt';
import RegisterUserDto from './dto/register-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private readonly userService: UserService,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}
    
    public async register(dto: RegisterUserDto) {
        const hashedPassword = await hash(dto.password, 10);
        try {
            const createdUser = await this.userService.create({
                ...dto,
                password: hashedPassword,
            });
            createdUser.password = undefined;

            return createdUser;
        } catch (error) {
            throw new HttpException(
                '알 수 없는 오류가 발생했습니다.',
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    public async getAuthenticatedUser(email: string, plainTextPassword: string) {
        try {
          const user = await this.userService.getByEmail(email);
          await this.verifyPassword(plainTextPassword, user.password);
          user.password = undefined;
          return user;
        } catch (error) {
          throw new HttpException('잘못된 인증 정보입니다.', HttpStatus.BAD_REQUEST);
        }
    }
      
    private async verifyPassword(plainTextPassword: string, hashedPassword: string) {
        const isPasswordMatching = await compare(
          plainTextPassword,
          hashedPassword
        );
        if (!isPasswordMatching) {
          throw new HttpException('잘못된 인증 정보입니다.', HttpStatus.BAD_REQUEST);
        }
    }

    public getCookieWithJwtToken(userId: number) {
        const payload: TokenPayload = { userId };
        const token = this.jwtService.sign(payload, {
            expiresIn: this.configService.get('JWT_EXPIRATION_TIME')
        });
        return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this.configService.get('JWT_EXPIRATION_TIME')}`;
    }

    public getCookieForLogOut() {
        return `Authentication=; HttpOnly; Path=/; Max-Age=0`;
    }
    
}
