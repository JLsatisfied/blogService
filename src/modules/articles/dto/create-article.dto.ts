import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  IsBoolean,
  IsInt,
} from 'class-validator';

export class CreateArticleDto {
  @IsString()
  @IsNotEmpty({ message: '标题不能为空' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: '简介不能为空' })
  introduction: string;

  @IsArray()
  @IsNotEmpty({ message: '标签不能为空' })
  label: string[];

  @IsString()
  @IsNotEmpty({ message: '内容不能为空' })
  text: string;

  @IsOptional()
  @IsBoolean()
  show?: boolean;

  @IsOptional()
  @IsInt()
  class?: number;
}

export class UpdateArticleMetaDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty({ message: '标题不能为空' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: '简介不能为空' })
  introduction: string;

  @IsArray()
  @IsNotEmpty({ message: '标签不能为空' })
  label: string[];

  @IsOptional()
  @IsInt()
  weight?: number;
}

export class UpdateArticleContentDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsNotEmpty({ message: '内容不能为空' })
  text: string;
}

export class ArticleIdDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class ChangeArticleClassDto {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsInt()
  class: number;
}
