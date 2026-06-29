import './App.css'
import { SignInButton, SignOutButton, UserButton, Show } from '@clerk/react'

function App() {
  return (
    <>
      <h1>Welcome to Talent IQ</h1>

      <Show when="signed-out">
        <SignInButton mode="modal">
          <button>Login</button>
        </SignInButton>
      </Show>

      <Show when="signed-in">
        <SignOutButton />
      </Show>

      <UserButton />
    </>
  )
}

export default App