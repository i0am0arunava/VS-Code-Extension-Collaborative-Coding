import { connect } from "@/dbconfig/dbconfig";
import User from "@/models/usemodel"
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs"

connect()


export async function POST(request: NextRequest): Promise<NextResponse> {

    try {
        const reqBody = await request.json();
        console.log(reqBody)
        const { username, email, password } = reqBody

        const user = await User.findOne({ email })
        if (user) {
            return NextResponse.json({ error: "User already exist" }, { status: 400 })
        }
        const salt = await bcryptjs.genSalt(10)
        const hashedPassword = await bcryptjs.hash(password, salt)
        const newUser = new User({
            username,
            email,
            password: hashedPassword
        })
        const savedUser = await newUser.save()
        console.log(savedUser)

 
        return NextResponse.json({
            message: "user creted successfully",
            success: true,
            savedUser
        })

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}