import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Detect invite routes: /workspace/[workspaceId]/invite/[userId]
  const inviteRoutePattern = /^\/workspace\/[^/]+\/invite\/[^/]+$/;
  
  if (inviteRoutePattern.test(pathname)) {
    // Set a custom header to indicate this is an invite route
    const response = NextResponse.next();
    response.headers.set("x-invite-route", "true");
    return response;
  }

  return NextResponse.next();
}

