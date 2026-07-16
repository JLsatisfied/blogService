import { IsString, IsNotEmpty, IsInt, IsArray, IsOptional } from 'class-validator';

export class CreateResumeDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsString()
  @IsNotEmpty({ message: '名称不能为空' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: '简介不能为空' })
  introduction: string;

  @IsInt()
  weight: number;

  @IsArray()
  dataList: any[];
}

export class DeleteResumeDto {
  @IsString()
  @IsNotEmpty()
  id: string;
}
