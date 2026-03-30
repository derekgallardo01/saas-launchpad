import { router } from "@/server/trpc";
import { authRouter } from "./auth";
import { organizationRouter } from "./organization";
import { memberRouter } from "./member";
import { billingRouter } from "./billing";
import { apiKeyRouter } from "./apiKey";
import { activityRouter } from "./activity";

export const appRouter = router({
  auth: authRouter,
  organization: organizationRouter,
  member: memberRouter,
  billing: billingRouter,
  apiKey: apiKeyRouter,
  activity: activityRouter,
});

export type AppRouter = typeof appRouter;
