import {
  IsString,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class InitSettingsDto {
  @IsOptional()
  @IsString()
  imgs?: string;

  @IsOptional()
  @IsString()
  github?: string;

  @IsOptional()
  @IsString()
  juejin?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  nameimgs?: string;

  @IsOptional()
  @IsBoolean()
  msgoffs?: boolean;

  @IsOptional()
  @IsBoolean()
  adminoffs?: boolean;

  @IsOptional()
  @IsString()
  emailpassword?: string;

  @IsOptional()
  @IsString()
  eamils?: string;
}

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  imgs?: string;

  @IsOptional()
  @IsString()
  github?: string;

  @IsOptional()
  @IsString()
  juejin?: string;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  nameimgs?: string;

  @IsOptional()
  @IsBoolean()
  msgoffs?: boolean;

  @IsOptional()
  @IsBoolean()
  adminoffs?: boolean;

  @IsOptional()
  @IsString()
  eamils?: string; // Email address (not password)
}

export class UpdateEmailPassDto {
  @IsString()
  emailpassword: string;
}
