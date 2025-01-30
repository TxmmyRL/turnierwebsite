import { Text } from "@chakra-ui/react";
import NavBarLoggedInView from "../components/NavBarLoggedInView";
import NavBarLoggedOutView from "../components/NavBarLoggedOutView";
import { User } from "../models/user.model";
import ErgebnisAnzeigeGrid from "../components/ErgebnisAnzeigeGrid";
import { useEffect, useState } from "react";
import { TurnierOutput } from "../models/turnier.model";
import { useParams } from "react-router-dom";
import * as TurnierApi from "../network/turnier.api";

interface BaumPageProps {
    loggedInUser: User | null;
    onLoginSuccessful: (user: User) => void;
    onSignUpSuccessful: (user: User) => void;
    onLogoutSuccessful: () => void;
}

const BaumPage = ({loggedInUser, onLoginSuccessful, onSignUpSuccessful, onLogoutSuccessful}: BaumPageProps) => {
    const {turnierId} = useParams<{turnierId: string}>();
    const [turnier, setTurnier] = useState<TurnierOutput>();

    useEffect(() => {
        async function fetchTurnier(turnierId: string) {
            try {
                const data = await TurnierApi.getTurnier(turnierId);
                setTurnier(data);
            } catch (error) {
                console.error(error);
            }
        }
        if (turnierId) {
            fetchTurnier(turnierId);
        }
    }, [turnierId]);

    return (
        <div>
            {loggedInUser
                ? <NavBarLoggedInView user={loggedInUser} onLogoutSuccessful={onLogoutSuccessful}/>
                : <NavBarLoggedOutView onLoginSuccessful={onLoginSuccessful} onSignUpSuccessful={onSignUpSuccessful}/>
            }

            {loggedInUser && turnier
            ? <ErgebnisAnzeigeGrid turnier={turnier}/>
            : <Text my="50px" textAlign={"center"}> Kein Turnier vorhanden, bitte erstellen Sie ein Turnier oder loggen Sie sich ein!</Text>
            }
        </div>
    );
};

export default BaumPage;