import { IsString, IsNotEmpty, IsOptional, Length } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  @Length(2, 20, { message: '用户名长度2-20位' })
  user: string;

  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  @Length(6, 30, { message: '密码长度6-30位' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: '昵称不能为空' })
  name: string;

  @IsOptional()
  @IsString()
  weight?: string; // Role: '1'=trial, '2'=admin (requires auth number)

  @IsOptional()
  @IsString()
  number?: string; // Authorization number for admin role
}
