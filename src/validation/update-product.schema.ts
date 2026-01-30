import * as yup from "yup";

export const updateProductSchema = yup.object({
  name: yup
    .string()
    .typeError("Name must be string")
    .max(100, "Name must not exceed 100 characters"),
  description: yup
    .string()
    .typeError("Name must be string")
    .max(500, "Description must not exceed 500 characters"),
  price: yup
    .number()
    .typeError("Name must be number")
    .positive("Price must be greater than 0"),
});
