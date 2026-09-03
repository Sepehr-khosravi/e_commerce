import { requireAdmin } from "@/app/lib/auth/authorization";
import { NextRequest, NextResponse } from "next/server";


export async function GET(request : NextRequest){
    try{
        const {response} = await requireAdmin()
        if(response) return response;
    }
    catch(error){
        console.warn("Someone is trying to open the admin panel!!!, (Error : ", error , ")");
    }
}