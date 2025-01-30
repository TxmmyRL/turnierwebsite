import { Box, Heading, Text } from "@chakra-ui/react";

const LoggedOutView = () => {
    return (
        <Box my="50px" textAlign={"center"}>
            <Heading as="h1">Nicht eingeloggt!</Heading>
            <Text>Bitte loggen Sie sich ein, um diese Seite zu nutzen.</Text>
        </Box>
    )
};

export default LoggedOutView;