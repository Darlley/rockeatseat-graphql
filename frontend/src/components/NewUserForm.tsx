import { gql, useMutation } from '@apollo/client';
import React, { FormEvent } from 'react'
import { client } from '../lib/apollo';
import { GET_USERS } from '../App';

const CREATE_USER = gql`
  mutation ($name: String!) {
    createUser( name: $name ) {
      id,
      name
    }
  }
`

export default function NewUserForm() {
  const [name, setName] = React.useState('')
  const [createUser, { data, loading, error }] = useMutation(CREATE_USER)

  async function handleCreateUser(event: FormEvent) {
    event.preventDefault()

    if(!name) return;

    await createUser({ 
      variables: { name },
      update: (cache, { data: { createUser} }) => {
        const { users } = client.readQuery({ query: GET_USERS })
        cache.writeQuery({
          query: GET_USERS,
          data: {
            users: [...users, createUser]
          }
        })
      }
    })
    
    
    
    .then(() => setName('')).catch((error) => {
      if(error) {
        console.log(error)
      }
    })

  }

  return (
    <div>
      <form onSubmit={handleCreateUser}>
        <input type='text' value={name} onChange={(e) => setName(e.target.value)} />
        <button type='submit'>{loading ? 'Carregando...' : 'Criar'}</button>
      </form>
    </div>
  )
}
