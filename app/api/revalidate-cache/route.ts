import { updateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const secret = req.headers.get("x-revalidate-secret");

    if (secret !== process.env.REVALIDATE_SECRET) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { tag } = await req.json();

    if (!tag) {
        return NextResponse.json({ error: "Missing tag" }, { status: 400 });
    }

    updateTag(tag);

    return NextResponse.json({ revalidated: true, tag });
}