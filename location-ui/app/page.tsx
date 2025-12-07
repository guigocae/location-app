import Image from "next/image";
import UserName from "@/components/UserName";
import getUsers from "./get-users";

export default async function Home() {
  const allUsers = await getUsers();
  console.log(allUsers);

  return (
    <>
      <div className="h-screen flex items-center justify-center flex-col gap-5">
        <UserName />
      </div>
    </>
  );
}
