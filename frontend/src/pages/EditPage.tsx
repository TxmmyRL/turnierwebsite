import { Box, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react";
import { User } from "../models/user.model";
import NavBarLoggedInView from "../components/NavBarLoggedInView";
import NavBarLoggedOutView from "../components/NavBarLoggedOutView";
import EditGrid from "../components/EditGrid";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { TurnierOutput } from "../models/turnier.model";
import * as TurnierApi from "../network/turnier.api";
import ErgebnisVerwaltungGrid from "../components/ErgebnisVerwaltungGrid";


interface EditPageProps {
    loggedInUser: User | null;
    onLoginSuccessful: (user: User) => void;
    onSignUpSuccessful: (user: User) => void;
    onLogoutSuccessful: () => void;
}

const EditPage = ({loggedInUser, onLoginSuccessful, onSignUpSuccessful, onLogoutSuccessful}: EditPageProps) => {
    const {turnierId} = useParams<{turnierId: string}>();
    const [turnier, setTurnier] = useState<TurnierOutput>();
    const [refresh, setRefresh] = useState(false);

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
        setRefresh(false);
    }, [turnierId, refresh]);

    return (
        <div>
            {loggedInUser
            ? <NavBarLoggedInView user={loggedInUser} onLogoutSuccessful={onLogoutSuccessful}/> 
            : <NavBarLoggedOutView onLoginSuccessful={onLoginSuccessful} onSignUpSuccessful={onSignUpSuccessful}/>
            }

            {loggedInUser && turnier && loggedInUser._id === turnier.userIdErsteller
            ?
            <Box>
                <Text pl="20px" pt="20px">Turnier-ID: {turnierId} (zur Weitergabe, sodass andere Ihr Turnier speichern und anschauen können)</Text>
                
                <Tabs p="20px">
                    <TabList>
                        <Tab>Turnierdaten verwalten</Tab>
                        <Tab>Ergebnisse verwalten</Tab>
                    </TabList>
                    <TabPanels>
                        <TabPanel>
                            <EditGrid turnier={turnier} onUpdate={() => setRefresh(true)}/>
                        </TabPanel>
                        <TabPanel>
                            <ErgebnisVerwaltungGrid turnier={turnier} onUpdate={() => setRefresh(true)}/>
                        </TabPanel>
                    </TabPanels> 
                </Tabs>
            </Box>
            : <Text my="50px" textAlign={"center"}>Sie haben keine Berechtigung dieses Turnier zu bearbeiten oder die Turnier-ID ist falsch</Text>
            }
        </div>
    );
};

export default EditPage;