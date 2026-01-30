import * as yup from "yup";

export const createProductSchema = yup.object({
  name: yup
    .string()
    .typeError("Name must be string")
    .defined("Name is required")
    .max(100, "Name must not exceed 100 characters"),
  description: yup
    .string()
    .typeError("Name must be string")
    .max(500, "Description must not exceed 500 characters"),
  price: yup
    .number()
    .strict()
    .typeError("Price must be number")
    .defined("Price is required")
    .positive("Price must be greater than 0"),
});
