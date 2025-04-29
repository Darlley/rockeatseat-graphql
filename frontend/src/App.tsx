import { gql, useQuery } from "@apollo/client"
import NewUserForm from "./components/NewUserForm"

export const GET_USERS = gql`
  query Query {
    users {
      id
      name
    }
  }
`
function App() {
  const { data } = useQuery<{ users: { id: string, name: string }[] }>(GET_USERS)

  return (
    <div>
      <h1>Hello world</h1>
      <ul>
        {data?.users?.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
      <NewUserForm />
    </div>
  )
}

export default App
