import { cookies } from "next/headers";

export default async function getUsers() {
  const res = await fetch("http://localhost:3000/user", {
    headers: {
      Cookie: (await cookies()).toString(),
    }
  });
  return res.json();
}