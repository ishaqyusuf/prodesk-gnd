"use server";

import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";
export async function myId() {
  const data = await getServerSession(authOptions);
  return data?.user.id;
}
export async function streamlineMeta(meta: any = null) {
  if (meta == null) return {};

  function _streamline(value) {
    let _str: any = null;
    if (value != null) {
      if (typeof value === "object" && value?.length <= 0) {
        _str = {};
        Object.entries(value).map(([k, v]) => {
          const _val = _streamline(v);
          if (_val) _str[k] = _val;
        });
        return _str;
      } else {
        return value;
      }
    }
  }
  return _streamline(meta);
}
