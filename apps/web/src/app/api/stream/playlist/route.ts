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
    
    // Fetch the playlist
    const response = await fetch(targetUrl, fetchOptions);
    
    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch playlist: ${response.statusText}` },
        { status: response.status }
      );
    }
    
    // Get the playlist content
    const playlistContent = await response.text();
    
    // Process the playlist content to rewrite segment URLs
    const lines = playlistContent.split("\n");
    const processedLines = lines.map(line => {
      // Skip comments and empty lines
      if (line.startsWith("#") || line.trim() === "") {
        return line;
      }
      
      // Rewrite segment URLs to go through our proxy
      // Determine if the URL is absolute or relative
      let segmentUrl = line;
      if (!segmentUrl.startsWith("http://") && !segmentUrl.startsWith("https://")) {
        // Handle relative URLs
        const baseUrl = new URL(targetUrl);
        // Remove filename from the path
        const basePath = baseUrl.pathname.substring(0, baseUrl.pathname.lastIndexOf("/") + 1);
        
        if (segmentUrl.startsWith("/")) {
          // Absolute path relative to domain
          segmentUrl = `${baseUrl.origin}${segmentUrl}`;
        } else {
          // Relative path
          segmentUrl = `${baseUrl.origin}${basePath}${segmentUrl}`;
        }
      }
      
      // Encode the segment URL and return the proxy URL
      const encodedSegmentUrl = encodeURIComponent(segmentUrl);
      const authParams = username && password 
        ? `&u=${encodeURIComponent(username)}&p=${encodeURIComponent(password)}` 
        : '';
        
      return `/api/stream/segment?target=${encodedSegmentUrl}${authParams}`;
    });
    
    // Join the processed lines back into a playlist
    const processedPlaylist = processedLines.join("\n");
    
    // Return the processed playlist with the correct content type
    return new NextResponse(processedPlaylist, {
      headers: {
        "Content-Type": "application/vnd.apple.mpegurl",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error processing playlist:", error);
    return NextResponse.json(
      { error: "Failed to process playlist" },
      { status: 500 }
    );
  }
} 