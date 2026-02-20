import { IsNotEmpty, IsString, MaxLength } from "class-validator";

export class UpdateAttributeOptionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  value!: string;
}
