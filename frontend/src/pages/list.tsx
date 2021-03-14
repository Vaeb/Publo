import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { Box, VStack, StackDivider } from '@chakra-ui/react';
import he from 'he';

const getAllPublications = gql`
    query {
        getAllPublications(limit: 50) {
            id
            title
            type
            volume
            year
        }
    }
`;

const List = () => {
    const { loading, error, data } = useQuery(getAllPublications);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{String(error)}</p>;

    return (
        <div>
            <VStack divider={<StackDivider borderColor="gray.200" />} spacing={4} align="stretch">
                {data.getAllPublications.map((pub: any) => (
                    <Box key={pub.id}>
                        {/* <h3>{pub.id}</h3> */}
                        <p>{he.decode(pub.title)}</p>
                        <p>Volume {pub.volume}</p>
                        <p>{pub.year}</p>
                    </Box>
                ))}
            </VStack>
            <Box h="20px" />
        </div>
    );
};

const ListWrapper = () => (
    <Box ml="8px">
        <List />
    </Box>
);

export default ListWrapper;
