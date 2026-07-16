import { IsString, IsOptional } from 'class-validator';

export class BindEmailDto {
  @IsString()
  email: string;

  @IsString()
  code: string; // Verification code
}

export class ChangePasswordDto {
  @IsString()
  oldPassword: string;

  @IsString()
  newPassword: string;

  @IsOptional()
  @IsString()
  code?: string; // Email verification code
}

export class ChangeNicknameDto {
  @IsString()
  name: string;
}

export class ChangeAvatarDto {
  @IsString()
  imgs: string; // Avatar URL
}

export class SendEmailCodeDto {
  @IsString()
  email: string;
}

export class SendPasswordResetCodeDto {
  @IsString()
  email: string;
}
