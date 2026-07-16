import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateProjectDto {
  @IsOptional()
  @IsString()
  id?: string; // If present, update; otherwise create

  @IsString()
  @IsNotEmpty({ message: '项目名不能为空' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: '简介不能为空' })
  introduction: string;

  @IsString()
  urlname: string;

  @IsString()
  @IsNotEmpty({ message: 'GitHub链接不能为空' })
  github: string;

  @IsString()
  @IsNotEmpty({ message: '图标不能为空' })
  icons: string;
}

export class DeleteProjectDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}
