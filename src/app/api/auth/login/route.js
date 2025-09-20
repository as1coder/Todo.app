import { NextResponse } from "next/server";
import connectDB from "@/app/lib/db";
import User from "@/app/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// POST - login user    
export async function POST(req) {
    try {
        const { email, password } = await req.json();
        await connectDB();

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: "Invalid email " }, { status: 401 });
        }

        const validpass = await bcrypt.compare(password, user.password);
        if (!validpass) {
            return NextResponse.json({ error: "Invalid password" }, { status: 401 });
        }
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );
        return NextResponse.json({
            token, user: { id: user._id, name: user.name, email: user.email }
        }, { status: 200 });
    } catch (error) {
        console.error("Login error:", error);
        return NextResponse.json({ error: "Error logging in" }, { status: 400 });
    }
}