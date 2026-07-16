import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateLabelDto {
  @IsString()
  @IsNotEmpty({ message: '标签名不能为空' })
  name: string;

  @IsOptional()
  @IsString()
  id?: string; // If present, update existing label; otherwise create new
}

export class ToggleLabelDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}

export class DeleteLabelDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}
