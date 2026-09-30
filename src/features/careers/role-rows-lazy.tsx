"use client";

// Code-split RoleRows: the careers view imports it unconditionally, but it only
// renders (and only ships its chunk) while there are open roles.
import dynamic from "next/dynamic";

export const RoleRowsLazy = dynamic(() => import("./role-rows").then((m) => m.RoleRows));
