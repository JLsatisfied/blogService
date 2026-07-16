import { IsString, IsNotEmpty, IsOptional, IsInt } from 'class-validator';

export class CreateMessageDto {
  @IsString()
  @IsNotEmpty({ message: '昵称不能为空' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: '用户名不能为空' })
  username: string;

  @IsOptional()
  @IsString()
  imgage?: string;

  @IsString()
  @IsNotEmpty({ message: '内容不能为空' })
  value: string;

  @IsOptional()
  @IsString()
  type?: string;
}

export class ModerateMessageDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsInt()
  state: number;
}

export class ReplyMessageDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty({ message: '回复内容不能为空' })
  adminmsg: string;
}

export class DeleteMessageDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}
