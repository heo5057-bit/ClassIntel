import { createSupabaseServerClient } from "@/src/supabase/server";
import { getUserPlanLimits } from "@/src/domain/billing/subscription-service";
import { upsertUserProfile } from "@/src/persistence/user-profile-repository";

export async function getCurrentUserAndPlan() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      plan: null,
    };
  }

  await upsertUserProfile({
    id: user.id,
    email: user.email ?? "",
    fullName: user.user_metadata?.full_name ?? null,
  });

  const plan = await getUserPlanLimits(user.id);
  return { user, plan };
}
