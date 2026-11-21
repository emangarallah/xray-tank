import { auth } from "@/lib/auth/server";
export default auth.middleware({loginUrl:"/auth",publicRoutes:["/","/auth"]});
export const config={matcher:["/((?!_next/static|_next/image|favicon.ico).*)"]};
