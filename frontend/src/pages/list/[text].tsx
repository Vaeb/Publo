import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { gql, useQuery } from '@apollo/client';
import {
    Box, VStack, StackDivider, Text, Link, Button,
} from '@chakra-ui/react';
import he from 'he';
import NextLink from 'next/link';
import { GenericResult } from '../../types';

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

const findResults = gql`
    query($text: String!, $resultType: String) {
        findResults(text: $text, resultType: $resultType, limit: 100) {
            id
            resultType
            text
        }
    }
`;

// interface ListArgs {
//     query: string
// }

const getScrollMargin = () => parseFloat(getComputedStyle(document.documentElement).marginRight);

const ItemBoxShadow = `
    0 2.3px 3.6px #bfbfbf,
    0 6.3px 10px rgba(0, 0, 0, 0.046),
    0 15.1px 24.1px rgba(0, 0, 0, 0.051),
    0 50px 80px #ffffff
`;

const List = ({ text }) => {
    const { loading, error, data } = useQuery(findResults, {
        variables: { text },
    });

    if (loading) return null;
    if (error) return <p>{String(error)}</p>;

    const onItemClick = (e, res: GenericResult) => {
        e.preventDefault();
        router.push(href);
    };

    return (
        <Box mt="20px" mr={`${-getScrollMargin()}px`}>
            <VStack spacing={4} align="stretch" ml="15px" mr="15px">
                {data.findResults.map((res: GenericResult, idx: number) => (
                    <Box key={idx}>
                        <Button
                            w="100%"
                            h="100%"
                            d="block"
                            textAlign="left"
                            fontWeight="initial"
                            bg="#e1e1e1"
                            borderRadius="20px"
                            p="10px 15px"
                            boxShadow={ItemBoxShadow}
                            onClick={e => onItemClick(e, res)}
                        >
                            {/* <h3>{res.id}</h3> */}
                            <Text fontWeight="bold">
                                <NextLink href="/publication/[id]" as={`/publication/${res.id}`}>
                                    {he.decode(res.text)}
                                </NextLink>
                            </Text>
                            <p>Volume {res.resultType}</p>
                            <p>{res.resultType}</p>
                        </Button>
                    </Box>
                ))}
            </VStack>
            <Box h="20px" />
        </Box>
    );
};

const ListWrapper = (): ReactElement | null => {
    const router = useRouter();
    const { text } = router.query;

    if (!text) return null;

    return (
        <Box>
            <List text={text} />
        </Box>
    );
};

export default ListWrapper;
