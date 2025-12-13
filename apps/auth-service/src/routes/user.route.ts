import { Hono } from "hono";
import clerkClient from "../utils/clerk";

const app = new Hono();

app.get("/", async (c) => {
  const users = await clerkClient.users.getUserList();
  return c.json(users);
});

app.get("/:id", async (c) => {
  const id = c.req.param("id");
  const user = await clerkClient.users.getUser(id);
  return c.json(user);
});

app.post("/", async (c) => {
  type CreateParams = Parameters<typeof clerkClient.users.createUser>[0];
  const newUser: CreateParams = await c.req.json();
  const user = await clerkClient.users.createUser(newUser);
  /*
  producer.send("user.created", {
    value: {
      username: user.username,
      email: user.emailAddresses[0]?.emailAddress,
    },
  });
  */
  return c.json(user);
});

app.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const user = await clerkClient.users.deleteUser(id);
  return c.json(user);
});

export default app;
