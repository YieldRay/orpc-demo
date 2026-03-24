import { ORPCError, os } from "@orpc/server";
import * as z from "zod";

function parseJWT(token: string | undefined): { id: number } | null {
  // dummy, do not use in production
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload ?? null;
  } catch {
    return null;
  }
}

const PlanetSchema = z.object({
  id: z.number().int().min(1),
  name: z.string(),
  description: z.string().optional(),
});

export const listPlanet = os
  .route({ method: "GET", path: "/planets" })
  .input(
    z.object({
      limit: z.number().int().min(1).max(100).optional(),
      cursor: z.number().int().min(0).default(0),
    }),
  )
  .output(z.array(PlanetSchema))
  .handler(async ({ input }) => {
    // your list code here
    return [{ id: 1, name: "name" }];
  });

export const findPlanet = os
  .route({ method: "GET", path: "/planets/{id}" })
  .input(z.object({ id: z.coerce.number().int().min(1) }))
  .output(PlanetSchema)
  .handler(async ({ input }) => {
    // your find code here
    return { id: 1, name: "name" };
  });

export const createPlanet = os
  .$context<{ headers: Headers }>()
  .use(({ context, next }) => {
    const user = parseJWT(context.headers.get("authorization")?.split(" ")[1]);

    if (user) {
      return next({ context: { user } });
    }

    throw new ORPCError("UNAUTHORIZED");
  })
  .route({ method: "POST", path: "/planets" })
  .input(PlanetSchema.omit({ id: true }))
  .output(PlanetSchema)
  .handler(async ({ input, context }) => {
    // your create code here
    return { id: 1, name: "name" };
  });

export const router = {
  planet: {
    list: listPlanet,
    find: findPlanet,
    create: createPlanet,
  },
};
