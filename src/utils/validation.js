import { z } from "zod";

export const courseSchema = z.object({
  title: z
    .string()
    .min(5, "Title must be at least 5 characters")
    .max(100, "Title must be less than 100 characters"),
  image: z
    .string()
    .url("Please enter a valid image URL")
    .regex(/\.(jpg|jpeg|png|webp)$/i, "Image must be a valid image URL"),
  price: z
    .number()
    .min(0, "Price must be a positive number")
    .max(10000, "Price must be less than $10,000"),
  duration: z
    .string()
    .min(2, "Duration is required")
    .max(50, "Duration must be less than 50 characters"),
  category: z.string().min(1, "Category is required"),
  description: z
    .string()
    .min(50, "Description must be at least 50 characters")
    .max(2000, "Description must be less than 2000 characters"),
  isFeatured: z.boolean().default(false),
});
