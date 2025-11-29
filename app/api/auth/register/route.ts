import { generateToken } from "@/lib/auth/jwt";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";
import { ApiResponse, AuthResponse } from "@/lib/types/auth";
import { serverRegistrationSchema } from "@/schemas/authSchemas";
import { NextRequest, NextResponse } from "next/server";
import { success, ZodError } from "zod";

export async function POST(req:NextRequest) {
  try {
    const body = await req.json()
    
    const validatedData = serverRegistrationSchema.parse(body);
    console.log("Data: ", validatedData);

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

    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        passwordHash: hashedPassword,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName,
        phoneNumbers: {
          create: {
            phoneNumber: validatedData.mobilePhoneNumber,
            type: "MOBILE"
          }
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
        roleId: "550e8400-e29b-41d4-a716-446655440001",
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        passwordHash: true,
        phoneNumbers: true,
        addresses: true,
        createdAt: true,
      }
    })

    const token = generateToken({
      userId: user.id,
      email: user.email
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
            lastName: user.lastName
          },
          token
        }
      },
      {status: 201}
    )

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60*60*24*7,
      path: "/"
    })

    return response;

  } catch(error) {
    if(error instanceof ZodError) {
      return NextResponse.json<ApiResponse>(
        {
          success: false,
          message: "Validation Failed",
          error: error.message || "Invalid input data"
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