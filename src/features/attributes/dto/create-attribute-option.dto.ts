import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class CreateAttributeOptionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  value!: string;
}
