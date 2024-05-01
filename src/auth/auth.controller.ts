import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import RegisterUserDto from './dto/register-user.dto';
import { LocalAuthGuard } from './local/local.guard';
import RequestWithUser from './requestWithUser.interface';
import JwtAuthenticationGuard from './jwt/jwt-authentiacation.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('/register')
    async register(@Body() request: RegisterUserDto) {
        return this.authService.register(request);
    }

    @HttpCode(200)
    @UseGuards(LocalAuthGuard)
    @Post('/login')
    async login(@Req() request: RequestWithUser, @Res() response: Response) {
        const { user } = request;
        const cookie = this.authService.getCookieWithJwtToken(user.id);
        response.setHeader('Set-Cookie', cookie);
        user.password = undefined;
        return response.send(user);
    }

    @UseGuards(JwtAuthenticationGuard)
    @Post('/logout')
    async logout(@Req() request: RequestWithUser, @Res() response: Response) {
        response.setHeader(
            'Set-Cookie',
            this.authService.getCookieForLogOut(),
        );
        return response.sendStatus(200);
    }

    @UseGuards(JwtAuthenticationGuard)
    @Get()
    authenticate(@Req() request: RequestWithUser) {
        const user = request.user;
        user.password = undefined;
        return user;
    }
    
}
