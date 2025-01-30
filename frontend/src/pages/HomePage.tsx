import NavbarLoggedInView from "../components/NavBarLoggedInView";
import TurnierGrid from "../components/TurnierGrid";
import NavBarLoggedOutView from "../components/NavBarLoggedOutView";
import LoggedOutView from "../components/LoggedOutView";
import { User } from "../models/user.model";

interface HomePageProps {
    loggedInUser: User | null;
    onLoginSuccessful: (user: User) => void;
    onSignUpSuccessful: (user: User) => void;
    onLogoutSuccessful: () => void;
}

const HomePage = ({loggedInUser, onLoginSuccessful, onSignUpSuccessful, onLogoutSuccessful}: HomePageProps) => {
    return (
        <div>
            {loggedInUser
            ? <NavbarLoggedInView user={loggedInUser} onLogoutSuccessful={onLogoutSuccessful}/> 
            : <NavBarLoggedOutView onLoginSuccessful={onLoginSuccessful} onSignUpSuccessful={onSignUpSuccessful}/>
            }

            {loggedInUser
            ? <TurnierGrid user={loggedInUser}/>
            : <LoggedOutView/>
            }
            
        </div>
    )
};

export default HomePage;