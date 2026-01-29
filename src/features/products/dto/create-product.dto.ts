import { Type } from "class-transformer";
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  MaxLength,
  IsOptional,
  IsPositive,
} from "class-validator";
// with validation decorators ValidationPipe catches error BEFORE Prisma

export class CreateProductDto {
  @IsString({ message: "Name must be string" })
  @IsNotEmpty({ message: "Name is required" })
  @MaxLength(100, { message: "Name must not excced 100 characters" })
  name!: string;

  @IsOptional()
  @IsString({ message: "Description must be string" })
  @MaxLength(500, { message: "Description must not exceed 500 characters" })
  description?: string;

  @IsNumber({}, { message: "Price must be a number" })
  @IsNotEmpty({ message: "Price is required" })
  @IsPositive({ message: "Price must be greater than 0" })
  @Type(() => Number)
  price!: number;
}
