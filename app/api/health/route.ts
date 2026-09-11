import { NextRequest, NextResponse } from "next/server";


export async function GET(){
    try{
        return NextResponse.json(
            {
                message : "Server is up and every thing is well",
            },
            {
                status : 200
            }
        )
    }
    catch(e) {
        console.log("error in check health api : ", e);

        return NextResponse.json(
            {
                error : e, 
            },
            {
                status : 500
            }
        )
    }
}