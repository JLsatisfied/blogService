import { IsString, IsNotEmpty, IsEmail, Length } from 'class-validator';

export class CreatePcUserDto {
  @IsString()
  @IsNotEmpty({ message: '昵称不能为空' })
  name: string;

  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  @Length(6, 30, { message: '密码长度6-30位' })
  password: string;
}
