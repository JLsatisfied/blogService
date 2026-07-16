import { IsOptional, IsString, IsInt } from 'class-validator';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryArticleDto extends PaginationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  class?: number;
}

export class QueryArticleByIdDto {
  @IsString()
  id: string;
}
