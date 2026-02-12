import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class UpdateStoreDto {
  @IsString({ message: "Name must be string" })
  @IsNotEmpty({ message: "Name is required" })
  @MaxLength(100, { message: "Name must not excced 100 characters" })
  name!: string;

  @IsNotEmpty({ message: "Description is required" })
  @IsString({ message: "Description must be string" })
  @MaxLength(500, { message: "Description must not exceed 500 characters" })
  description!: string;
}
