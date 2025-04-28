import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class User {
  @Field(() => String) // Declarar explicitamente o tipo como String
  name: string;

  @Field(() => String) // Caso tenha campos adicionais, como id
  id: String;
}
