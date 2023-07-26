// "use server";

import { env } from "@/env.mjs";
import UpgradeClient from "./upgrade-client";

export default function UpgradeBtn() {
  if (env.NODE_ENV === "production") return null;

  return (
    <>
      <UpgradeClient />
    </>
  );
}
