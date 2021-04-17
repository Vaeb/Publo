import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { gql, useQuery } from '@apollo/client';
import { Box, VStack, StackDivider } from '@chakra-ui/react';
import he from 'he';
import NextLink from 'next/link';

// const getAllPublications = gql`
//     query {
//         getAllPublications(limit: 50) {
//             id
//             title
//             type
//             volume
//             year
//         }
//     }
// `;

const findPublications = gql`
    query($text: String!, $type: String) {
        findPublications(text: $text, type: $type, limit: 100) {
            id
            title
            type
            volume
            year
        }
    }
`;

// interface ListArgs {
//     query: string
// }

const List = () => {
    const router = useRouter();
    const { text } = router.query;

    const { loading, error, data } = useQuery(findPublications, {
        variables: { text },
    });

    if (loading) return null;
    if (error) return <p>{String(error)}</p>;

    return (
        <div>
            <VStack divider={<StackDivider borderColor="gray.200" />} spacing={4} align="stretch">
                {data.findPublications.map((pub: any) => (
                    <Box key={pub.id}>
                        {/* <h3>{pub.id}</h3> */}
                        <NextLink href="/publication/[id]" as={`/publication/${pub.id}`}>{he.decode(pub.title)}</NextLink>
                        <p>Volume {pub.volume}</p>
                        <p>{pub.year}</p>
                    </Box>
                ))}
            </VStack>
            <Box h="20px" />
        </div>
    );
};

const ListWrapper = (): ReactElement => (
    <Box ml="8px">
        <List />
    </Box>
);

export default ListWrapper;
