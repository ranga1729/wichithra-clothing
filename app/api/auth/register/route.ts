import { generateToken } from "@/utils/jwt";
import { hashPassword } from "@/utils/passwordHashing";
import { prisma } from "@/lib/prisma";
import { ApiResponse, AuthResponse, ROLES } from "@/types/auth-types";
import { registrationSchema } from "@/schemas/authSchemas";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { PhoneType } from "@/generated/prisma/enums";

export async function POST(req:NextRequest) {
  try {
    const body = await req.json()
    
    const validatedData = registrationSchema.parse(body);

    const existingUser = await prisma.user.findUnique({
      where: {email: validatedData.email} 
    })

    if(existingUser) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "User with this email already exists",
          error: "EMAIL_EXISTS",
        },
        { status: 409 }
      )
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
    })
    
    const response = NextResponse.json<ApiResponse<AuthResponse>>(
      {
        success: true,
        message: "Registration successful",
        data: {
          user : {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
          },
          token
        }
      },
      {status: 201}
    )

    response.cookies.set("wichithra-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60*60*24*7,
      path: "/"
    })

    return response;

  } catch(error) {

    if(error instanceof ZodError) {
    console.log("Zod Error:", error.issues[0].message);
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Validation Failed",
          error: error.issues[0].message || "Invalid input data"
        },
        {status: 400}
      )
    }  

    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "An error occured during registration",
        error: "INTERNAL_SERVER_ERROR"
      },
      {status: 500}
    )
  }
} 