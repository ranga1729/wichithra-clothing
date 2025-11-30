import * as z from "zod"

//schemas : front-end validations
export const loginSchema = z.object({
  email: z
    .email("Enter a valid email address"),
  password: z
    .string()
    .min(5, "Required")
})

export const personalDataSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must not exceed 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "First name can only contain letters")
    .transform((val) => val.trim()),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must not exceed 50 characters")
    .regex(/^[a-zA-Z\s]+$/, "Last name can only contain letters")
    .transform((val) => val.trim()),
  email: z
    .email("Invalid email address")
    .toLowerCase()
    .transform((val) => val.trim()),
  password: z
    .string()
    .min(1, "Required")
    .min(8, "Must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Must contain uppercase, lowercase, and number"),
  confirmPassword: z
    .string()
    .min(1, "Retype your password"),
  mobilePhoneNumber: z
    .string()
    .regex(/^[0-9]{9}$/, "Contact number must be 9 digits"),
  homePhoneNumber: z
    .string()
    .regex(/^[0-9]{9}$/, "Contact number must be 9 digits")
    .optional()
    .or(z.literal("")),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const addressDataSchema = z.object({
  houseNo: z
    .string()
    .min(1, "House number is required")
    .transform((val) => val.trim()),
  addressLine1: z
    .string()
    .min(2, "Address Line 1 is required")
    .transform((val) => val.trim()),
  addressLine2: z
    .string()
    .min(2, "Address Line 2 is required").transform((val) => val.trim()),
  city: z
    .string()
    .min(2, "City is required")
    .transform((val) => val.trim()),
  province: z
    .string()
    .min(2, "Province is required")    
    .transform((val) => val.trim()),
  zipCode: z
    .string()
    .regex(/^[0-9]{5}$/, "Zip code must be 5 digits"),
})

export const registrationSchema = personalDataSchema.safeExtend(addressDataSchema.shape)

// types
export type LoginForm = z.infer<typeof loginSchema>
export type PersonalDataForm = z.infer<typeof personalDataSchema>
export type AddressDataForm = z.infer<typeof addressDataSchema>
export type RegistrationForm = z.infer<typeof registrationSchema>