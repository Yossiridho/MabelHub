import {NextResponse} from "next/server";
import {dbConnect} from '@/lib/mongodb';
import {RequestSph} from '@/models/RequestSph';

export async function GET(request: Request)  {
    
    const { requestor, pemohon, segmen, deadline, lokasi, catatanHeader } = await request.json();
    await dbConnect();
    await RequestSph.create({
        requestor,
        pemohon,
        segmen,
        deadline,
        lokasi,
        catatanHeader
     });
     return NextResponse.json({message: 'E-Procurement SPH request created successfully'});

     const {searchParams} = new URL(request.url);
    
}