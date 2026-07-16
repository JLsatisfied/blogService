import {
  Controller,
  Get,
  Post,
  Body,
  Request,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from '../../common/decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import {
  BindEmailDto,
  ChangePasswordDto,
  ChangeNicknameDto,
  ChangeAvatarDto,
  SendEmailCodeDto,
  SendPasswordResetCodeDto,
} from './dto/update-profile.dto';

@Controller('admin')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get()
  healthCheck() {
    return this.authService.healthCheck();
  }

  @Public()
  @Get('searchSetAdmins')
  checkAdminRegistration() {
    return this.authService.checkAdminRegistration();
  }

  @Public()
  @Post('addUsers')
  register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('searchUser')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('forgetPasswodf')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Get('getUser')
  getProfile(@Request() req) {
    return this.authService.getProfile(req.user.id);
  }

  @Post('setUserEmail')
  sendVerificationEmail(@Request() req, @Body() dto: SendEmailCodeDto) {
    return this.authService.sendVerificationEmail(req.user.id, dto.email);
  }

  @Post('setUserEmailOnes')
  bindEmail(@Request() req, @Body() dto: BindEmailDto) {
    return this.authService.bindEmail(req.user.id, dto.email, dto.code);
  }

  @Post('songEmalis')
  sendPasswordResetCode(@Request() req, @Body() dto: SendPasswordResetCodeDto) {
    return this.authService.sendPasswordResetCode(req.user.id, dto.email);
  }

  @Post('setUserPasswordOnes')
  changePassword(@Request() req, @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(
      req.user.id,
      dto.oldPassword,
      dto.newPassword,
      dto.code,
    );
  }

  @Post('setUserNamedOnes')
  changeNickname(@Request() req, @Body() dto: ChangeNicknameDto) {
    return this.authService.changeNickname(req.user.id, dto.name);
  }

  @Post('setUserImgsOnes')
  changeAvatar(@Request() req, @Body() dto: ChangeAvatarDto) {
    return this.authService.changeAvatar(req.user.id, dto.imgs);
  }
}
