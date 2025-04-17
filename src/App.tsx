
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider } from 'react-router';
import './index.css'
import Home from './pages/Home';
import Layout from './layout/Layout';

function App() {
  
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path='/' element={<Layout />} >
        <Route index element={<Home/>} />
      </Route>
    )
  );

  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App
