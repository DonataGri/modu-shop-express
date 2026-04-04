import { Type } from "class-transformer";
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsPositive,
  IsObject,
} from "class-validator";

export class CreateSkuDto {
  @IsString()
  @IsNotEmpty()
  code!: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  price?: number;

  @IsOptional()
  @IsObject()
  attributeOptions?: Record<string, string>;
}
