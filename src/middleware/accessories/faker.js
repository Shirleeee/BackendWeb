import { faker } from "https://cdn.skypack.dev/@faker-js/faker@v7.4.0";
import { debug as Debug } from "https://deno.land/x/debug@0.2.0/mod.ts";

const debug = Debug("app:faker");
let firstname;
let lastname;
export const USERS = [];

export function createRandomUser() {
  const sex = faker.name.gender();
  firstname = faker.name.firstName(sex);
  lastname = faker.name.lastName();
  const email = firstname + lastname + "@hotmail.com";
  const username = faker.internet.userName();
  return {
    username: username,
    firstName: firstname,
    lastName: lastname,
    email: email,
    avatar: faker.image.cats(),
    password: faker.internet.password(),
  };
}

Array.from({ length: 10 }).forEach(() => {
  USERS.push(createRandomUser());
});
