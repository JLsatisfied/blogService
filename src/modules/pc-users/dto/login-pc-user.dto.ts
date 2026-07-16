import { IsString, IsNotEmpty } from 'class-validator';

export class LoginPcUserDto {
  @IsString()
  @IsNotEmpty({ message: '邮箱不能为空' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: '密码不能为空' })
  password: string;
}
