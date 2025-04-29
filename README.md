# GRAPHQL

Vídeo aula: https://www.youtube.com/live/6SZOPKs9SUg?si=yCmyAUg0Wtnu4b6O

Testando o GraphQL. Projeto Fullstack com Node Express com Apollo Server e frontend em Vitejs e Apollo Client.

https://github.com/user-attachments/assets/ea6cc2f6-d1a0-4c62-ae51-f2d644f4590d

---

### ANOTAÇÕES

GraphQL é uma ferramenta alternativa ao Rest tradicional. Ele resolve problemas como Overfetching (fetch com dados desnecessários) e Underfetching (fetching faltando dados). 

Ele resolve estes problemas por que o nosso backend só vai ter uma rota `/graphql` e é o front que faz os pedidos personalizado. Com o GraphQL o nosso backend funciona igual a uma linguagem SQL e o frontend realiza as consultas com QUERY (busca de dados) e MUTATION (manipulação dos dados).

Mas, com GraphQL é mais dificil fazer cache na aplciação (por que os browsers ja estão otimizados para fetch) e manipular erros (todas as chamadas http do GraphQL retornam o status code 200).

Vamos criar um projeto fullstack simples:

```
projeto/
├── backend/
├── frontend/
└── README.md
```

### BACKEND

Existem duas "estratégias" ao criar um novo projeto com GraphQL, existe o schema first e o code first.

`type-graphql` é uma ferramenta para criar api com graphql no node usando o typescript. Instale as dependencias `npm i type-graphql graphql apollo-server class-validator reflact-matedata`. Ele instalou em dependencias como desenvolvimento `npm i typescript @types/node ts-node-dev -D` mas eu usei o meu proprio boilerplate com tsup, tsx e biome.

Em `src/index.ts` inicia o nosso servidor graphql com Apollo Server e o arquivo `schema.gql` com os nossos schemas (tipos ou objetos) pelo método `buildSchema`:

```ts
const schema = await buildSchema({
  resolvers: [UserResolver],
  emitSchemaFile: path.resolve(__dirname, 'schema.gql'),
});
```

Os resolvers são parecidos com controllers e nossas rotas (resolvers = rotas). Eles ficam em `src/resolvers`. O type-graphql nos fornece decorators, parecido com o Nestjs. Então um resolver é uma classe que deve ser decorada com `@Resolver()` e para um método "getter" decoramos com `@Query()` e um método "setter" decoramos com `@Mutation()`.

```ts
import { Arg, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class UserResolver {

  @Query()
  async users() {}

  @Mutation()
  async createUser() {}
}
```

Inicie o servidor e abra o porjeto (provavelmente `localhost:4000`), cria uma conta no graphql playground do Apollo Server (parecido com Postman ou Insomnia). Lá podemos fazer os testes das nossas queries e mutations. Ele gera uma documentação automatica.

Crie as models que geram as tipagens no seu frontend também, e decore as classes com `@ObjectType()` e para cada campo decore com `@Field()` com o retorno do tipo de cada propriedade:

```ts
import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class User {
  @Field(() => String)
  name: string;

  @Field(() => String)
  id: String;
}
```

### FRONTEND

Vamos criar um projeto React com Vitejs `npm create vite@latest`.

Vamos instalar as dependências `npm i @apollo/client graphql` apenas. O Apollo Client funciona como um gerenciador de estados, ele substitui libs como SWR e React Query.

Temos que criar um client:

```ts
export const client = new ApolloClient({
  uri: 'http://localhost:4000/',
  cache: new InMemoryCache(),
})
```

E usar este client no `ApolloProvider`:

```tsx
<ApolloProvider client={client}>
  <App />
</ApolloProvider>
```

E nos componentes agora usamos a mesma instancia com hooks do Apollo, `useQuery` para queries (listagens):

```tsx

function App() {
  const { data } = useQuery>(
    gql`
      query Query {
        users {
          id
          name
        }
      }
    `
  )

  return (
    <ul>
      {data?.users?.map((user) => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}
```

E `useMutation` para mutations (formulários):

```tsx
import { gql, useMutation } from '@apollo/client';

export default function NewUserForm() {
  const [name, setName] = useState('')
  const [createUser, { data, loading, error }] = useMutation(
    gql`mutation ($name: String!) {
      createUser( name: $name ) { id, name } }
    `
  )

  async function handleCreateUser(event: FormEvent) {
    event.preventDefault()
    if(!name) return;
    await createUser({ variables: { name }})
  }

  return (
    <form onSubmit={handleCreateUser}>
      <input type='text' value={name} onChange={(e) => setName(e.target.value)} />
      <button type='submit'>{loading ? 'Carregando...' : 'Criar'}</button>
    </form>
  )
}
```

Para sincronizar realtime os dados entre um componente (listagem) e outro (form) basta usar update na mutation:

```ts
async function handleCreateUser(event: FormEvent) {
  ...
  await createUser({
    ...
    update: (cache, { data: { createUser} }) => { // 👈 AQUI
      const { users } = client.readQuery({ query: GET_USERS })
      cache.writeQuery({
        query: GET_USERS,
        data: {
          users: [...users, createUser]
        }
      })
    }
  })
}
```
