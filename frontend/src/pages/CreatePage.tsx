import { User } from "../models/user.model";
import NavBarLoggedInView from "../components/NavBarLoggedInView";
import NavBarLoggedOutView from "../components/NavBarLoggedOutView";
import LoggedOutView from "../components/LoggedOutView";
import CreateGrid from "../components/CreateGrid";

interface CreatePageProps {
    loggedInUser: User | null;
    onLoginSuccessful: (user: User) => void;
    onSignUpSuccessful: (user: User) => void;
    onLogoutSuccessful: () => void;
}

const CreatePage = ({loggedInUser, onLoginSuccessful, onSignUpSuccessful, onLogoutSuccessful}: CreatePageProps) => {


    return (
        <div>
            {loggedInUser
            ? <NavBarLoggedInView user={loggedInUser} onLogoutSuccessful={onLogoutSuccessful}/> 
            : <NavBarLoggedOutView onLoginSuccessful={onLoginSuccessful} onSignUpSuccessful={onSignUpSuccessful}/>
            }

            {loggedInUser
            ? <CreateGrid/>
            : <LoggedOutView/>
            }
        </div>
    );
};

export default CreatePage;