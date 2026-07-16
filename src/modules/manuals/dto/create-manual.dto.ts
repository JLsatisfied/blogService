import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateManualDto {
  @IsOptional()
  @IsString()
  id?: string; // If present, update; otherwise create

  @IsString()
  @IsNotEmpty({ message: '名称不能为空' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: '封面不能为空' })
  imgs: string;

  @IsString()
  @IsNotEmpty({ message: '简介不能为空' })
  introduction: string;
}

export class ManualIdDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class AddArticleToManualDto {
  @IsString()
  @IsNotEmpty()
  manualId: string;

  @IsString()
  @IsNotEmpty()
  articleId: string;
}

export class RemoveArticleFromManualDto {
  @IsString()
  @IsNotEmpty()
  manualId: string;

  @IsString()
  @IsNotEmpty()
  articleId: string;
}
