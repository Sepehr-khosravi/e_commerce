import { requireAdmin } from "@/app/lib/auth/authorization";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request : NextRequest){
    try{
        const {response} = await requireAdmin()
        if(response) return response;
        return NextResponse.json(
            {
                message : "Welcome to admin panel."
            },
            {
                status : 200
            }
        );
    }
    catch(error){
        console.warn("Someone is trying to open the admin panel!!!, (Error : ", error , ")");
    }
}