'use server'

import { PhoneType } from "@/generated/prisma/enums";
import { en } from "@/lib/i18n/en";
import { prisma } from "@/lib/prisma";
import { RegistrationForm, registrationSchema } from "@/schemas/auth-schemas";
import { ApiResponse, AuthResponse, ROLES } from "@/types/auth-types";
import { generateToken } from "@/lib/jwt";
import { hashPassword } from "@/lib/passwordHashing";
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
        message: en.user_with_this_email_exists,
      };
    }

    const hashedPassword = await hashPassword(validatedData.password)

    const phoneNumbersToCreate: { phoneNumber: string; type: PhoneType }[] = [
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
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        email: validatedData.email,
        passwordHash: hashedPassword,
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

    if(!user) {
      return {
        success: false,
        message: en.registration_failed,
      }
    }
    
    const token = generateToken({
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role.name
    });

    (await cookies()).set( en.token_name, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7,
      path: "/"
    });

    return {
      success: true,
      message: en.registration_successful,
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role.name
        },
        token
      }
    };
  } catch(error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        message: en.validation_failed,
        error: error.issues[0].message || en.validation_failed
      };
    }
    
    return {
      success: false,
      message: en.something_went_wrong,
    };
  }
}