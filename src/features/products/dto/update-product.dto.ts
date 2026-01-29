import { Type } from "class-transformer";
import {
  IsString,
  IsNumber,
  MaxLength,
  IsOptional,
  IsPositive,
} from "class-validator";

export class UpdateProductDto {
  @IsOptional()
  @IsString({ message: "Name must be string" })
  @MaxLength(100, { message: "Name must not exceed 100 characters" })
  name?: string;

  @IsOptional()
  @IsString({ message: "Description must be string" })
  @MaxLength(500, { message: "Description must not exceed 500 characters" })
  description?: string;

  @IsOptional()
  @IsNumber({}, { message: "Price must be a number" })
  @IsPositive({ message: "Price must be greater than 0" })
  @Type(() => Number)
  price?: number;
}
