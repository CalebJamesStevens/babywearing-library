import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/server";
import { db } from "@babywearing/db";
import { sql } from "@babywearing/db";

const ADMIN_ROLE = process.env.ADMIN_ROLE ?? "admin";

type RoleRow = { role: string | null };

type SessionUser = {
  id?: string | null;
  role?: string | null;
  roles?: string[] | string | null;
};

function getRoleFromSession(user?: SessionUser | null) {
  if (!user) return null;
  if (user.role) return user.role;
  if (Array.isArray(user.roles)) return user.roles[0] ?? null;
  if (typeof user.roles === "string") return user.roles;
  return null;
}

export async function requireAdmin() {
  const { data: session } = await auth.getSession();
  const user = session?.user as SessionUser | undefined;

  if (!user?.id) {
    redirect("/login");
  }

  const sessionRole = getRoleFromSession(user);
  if (sessionRole === ADMIN_ROLE) {
    return session;
  }

  try {
    const result = await db.execute(
      sql<RoleRow>`select role from neon_auth.user where id = ${user.id}`
    );
    const role = (result.rows?.[0]?.role ?? null) as string | null;
    if (role === ADMIN_ROLE) {
      return session;
    }
  } catch {
    // ignore and fall through to redirect
  }

  redirect("/login");
}
