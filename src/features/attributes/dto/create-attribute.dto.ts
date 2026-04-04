import {
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  MaxLength,
} from "class-validator";

export class CreateAttributeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsArray()
  @ArrayMinSize(1, { message: "Attribute must have at least one option" })
  @IsString({ each: true, message: "Each option must be a string" })
  @IsNotEmpty({ each: true, message: "Option values cannot be empty" })
  options!: string[];
}
