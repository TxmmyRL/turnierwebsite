import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import CreatePage from "./pages/CreatePage";
import EditPage from "./pages/EditPage";
import BaumPage from "./pages/BaumPage";
import { User } from "./models/user.model";
import { useEffect, useState } from "react";
import * as UserApi from "./network/user.api"


function App() {
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

  useEffect(() => {
    async function fetchLoggedInUser() {
      try {
        const user = await UserApi.getLoggedInUser();
        setLoggedInUser(user)
      } catch (error) {
          console.error(error);
      }
    }
    fetchLoggedInUser();
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" element={<HomePage loggedInUser={loggedInUser} onLoginSuccessful={(user) => {setLoggedInUser(user)}} onSignUpSuccessful={(user) => {setLoggedInUser(user)}} onLogoutSuccessful={() => setLoggedInUser(null)}/>} />
        <Route path="/turniererstellung" element={<CreatePage loggedInUser={loggedInUser} onLoginSuccessful={(user) => {setLoggedInUser(user)}} onSignUpSuccessful={(user) => {setLoggedInUser(user)}} onLogoutSuccessful={() => setLoggedInUser(null)}/>} />
        <Route path="/:turnierId/turnierbearbeitung" element={<EditPage loggedInUser={loggedInUser} onLoginSuccessful={(user) => {setLoggedInUser(user)}} onSignUpSuccessful={(user) => {setLoggedInUser(user)}} onLogoutSuccessful={() => setLoggedInUser(null)}/>} />
        <Route path="/:turnierId" element={<BaumPage loggedInUser={loggedInUser} onLoginSuccessful={(user) => {setLoggedInUser(user)}} onSignUpSuccessful={(user) => {setLoggedInUser(user)}} onLogoutSuccessful={() => setLoggedInUser(null)}/>} />
      </Routes>
    </>
  )
}

export default App
