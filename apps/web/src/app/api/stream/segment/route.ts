import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Get query parameters
  const url = new URL(request.url);
  const target = url.searchParams.get("target");
  const username = url.searchParams.get("u");
  const password = url.searchParams.get("p");

  // Validate target URL
  if (!target) {
    return NextResponse.json(
      { error: "Missing target URL" },
      { status: 400 }
    );
  }

  try {
    // Decode the target URL
    const targetUrl = decodeURIComponent(target);
    
    // Prepare fetch options
    const fetchOptions: RequestInit = {
      headers: {},
    };
    
    // Add Basic Auth if credentials are provided
    if (username && password) {
      const auth = Buffer.from(`${username}:${password}`).toString("base64");
      fetchOptions.headers = {
        Authorization: `Basic ${auth}`,
      };
    }
    
    // Fetch the segment
    const response = await fetch(targetUrl, fetchOptions);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch segment: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Get the segment content as ArrayBuffer
    const segmentData = await response.arrayBuffer();
    
    // Get the content type from the response
    const contentType = response.headers.get("Content-Type") || "application/octet-stream";
    
    // Return the segment with the original content type
    return new NextResponse(segmentData, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600", // Cache segments for an hour
      },
    });
  } catch (error) {
    console.error("Error processing segment:", error);
    return NextResponse.json(
      { error: "Failed to process segment" },
      { status: 500 }
    );
  }
} 