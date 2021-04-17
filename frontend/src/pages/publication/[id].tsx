import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { gql, useQuery } from '@apollo/client';
import {
    Box, VStack, StackDivider, Center, Text, Heading, Flex, Link,
} from '@chakra-ui/react';
import he from 'he';

const getPublication = gql`
    query($id: Int!) {
        getPublication(id: $id) {
            id
            title
            doi
            type
            year
            volume
            link
            authors {
                id
                firstName
                lastName
            }
            venue {
                id
                title
            }
        }
    }
`;

const Publication = (): ReactElement | null => {
    const router = useRouter();
    const { id } = router.query;

    const { loading, error, data } = useQuery(getPublication, {
        variables: { id: Number(id) },
    });

    if (loading) return null;
    if (error) return <p>{String(error)}</p>;

    const publ = data.getPublication;

    return (
        <div>
            <Box bg="#f2f2f2" w="calc(100%)" boxShadow="" borderRadius="0px" >
                <Box h="25px" />
                <Flex justifyContent="center">
                    <Box w="50%">
                        <span>{publ.year}</span>{publ.venue && <>
                            <span> • </span>
                            <Link>{publ.venue.title}</Link>
                        </>}
                        <Heading mt="0" size="lg" color="#1c1d1e">{publ.title}</Heading>
                        {publ.authors.map((author, i) => (<>
                            {i > 0 && <span> • </span>}
                            <Link>{`${author.firstName} ${author.lastName}`}</Link>
                        </>))}
                        <Box>
                            <Link href={publ.link} isExternal>🔗 Source</Link>
                        </Box>
                    </Box>

                </Flex>
                <Flex justifyContent="center" />
                <Box h="25px" />
            </Box>
            <Box>
                <Center h="50vh">
                    <Text fontSize={20}>Related papers...</Text>
                </Center>
            </Box>
            <Box h="20px" />
        </div>
    );
};

const PublicationWrapper = (): ReactElement => (
    <Box>
        <Publication />
    </Box>
);

export default PublicationWrapper;
