import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import User from "@/app/models/User";
import bcrypt from "bcryptjs";

// POST - create a new user (sign up)
export async function POST(req) {   
    try {   
        const {name, email,password} = await req.json();
        await connectDB();

const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword });

        return NextResponse.json({user}, { status: 201 });
    } catch (error) {
          console.error("Signup error:", error);
        return NextResponse.json({ error: "Error creating user" }, { status: 400 });
    }   
}