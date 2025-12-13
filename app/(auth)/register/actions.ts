'use server'

import { PhoneType } from "@/generated/prisma/enums";
import { prisma } from "@/lib/prisma";
import { RegistrationForm, registrationSchema } from "@/schemas/authSchemas";
import { ApiResponse, AuthResponse, ROLES } from "@/types/auth-types";
import { generateToken } from "@/utils/jwt";
import { hashPassword } from "@/utils/passwordHashing";
import { cookies } from "next/headers";
import { ZodError } from "zod";

export async function registerUser(formData:RegistrationForm) : Promise<ApiResponse<AuthResponse>> {
  try {
    const validatedData = registrationSchema.parse(formData);
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if(existingUser) {
      return {
        success: false,
        message: "User with this email already exists",
        error: "EMAIL_EXISTS",
      };
    }

    const hashedPassword = await hashPassword(validatedData.password)

    const phoneNumbersToCreate = [
      {
        phoneNumber: validatedData.mobilePhoneNumber,
        type: PhoneType.MOBILE
      }
    ];

    if(validatedData.homePhoneNumber) {
      phoneNumbersToCreate.push({
        phoneNumber: validatedData.homePhoneNumber,
        type: PhoneType.HOME
      })
    } 

    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        passwordHash: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phoneNumbers: {
          create: phoneNumbersToCreate,
        },
        addresses: {
          create: {
            houseNo: validatedData.houseNo,
            addressLine1: validatedData.addressLine1,
            addressLine2: validatedData.addressLine2,
            city: validatedData.city,
            province: validatedData.province,
            zipcode: validatedData.zipCode
          },
        },
        roleId: ROLES.CUSTOMER,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
      }
    })
    
    const token = generateToken({
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.name
    });

    (await cookies()).set("wichithra-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/"
    });

    return {
      success: true,
      message: "Registration successful",
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        },
        token
      }
    };
  } catch(error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message: "Validation Failed",
        error: error.issues[0].message || "Invalid input data"
      };
    }
    
    return {
      success: false,
      message: "An error occurred during registration",
      error: "INTERNAL_SERVER_ERROR"
    };
  }
}