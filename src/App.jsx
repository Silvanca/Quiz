import { useState } from 'react'
import './App.css'
import Quiz from "./components/quiz.jsx";

function App() {
  const [count, setCount] = useState(0)

  return (
      <>
          <Quiz/>
      </>
  )
}

export default App
