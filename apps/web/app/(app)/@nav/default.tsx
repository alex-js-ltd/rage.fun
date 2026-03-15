import { cookies } from "next/headers";
import * as Nav from "@/app/comps/main_nav";
import { auth } from "@/app/auth";
import { SignInForm } from "@/app/comps/signin_form";

export default async function Default() {
  const nonce = await getNonceFromCookie();
  const session = await auth();

  return (
    <>
      <Nav.Desktop />
      <Nav.Mobile />

      {session ? null : <SignInForm nonce={nonce} />}
    </>
  );
}

async function getNonceFromCookie() {
  const cookieStore = await cookies();

  // Handle all modern + legacy cookie names
  const raw =
    cookieStore.get("__Host-authjs.csrf-token")?.value ??
    cookieStore.get("authjs.csrf-token")?.value ??
    cookieStore.get("next-auth.csrf-token")?.value ??
    "";

  if (!raw) {
    console.warn("[auth] No CSRF token cookie found");
    return "";
  }

  // Sometimes cookie is "nonce|hash"
  const nonce = raw.split("|")[0] ?? "";
  return nonce;
}
