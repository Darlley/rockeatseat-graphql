import "reflect-metadata";

import path, { dirname } from 'path';

import { buildSchema } from 'type-graphql'
import { ApolloServer } from 'apollo-server'
import { UserResolver } from "./resolvers/UserResolver";
import { fileURLToPath } from "url";

// import env from "./env";
// const APP_URL: string = env.APP_URL;

async function main() {
  const schema = await buildSchema({
    resolvers: [UserResolver],
    emitSchemaFile: path.resolve(__dirname, 'schema.gql'),
  });

  const server = new ApolloServer({ schema });
  const { url } = await server.listen();

  console.log(`Server is running, GraphQL Playground available at ${url}`);
}

main()