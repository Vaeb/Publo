import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { gql, useQuery } from '@apollo/client';
import {
    Box, VStack, StackDivider, Text, Link, Button, Icon,
} from '@chakra-ui/react';
import he from 'he';
import NextLink from 'next/link';
import { IoBookOutline, IoLogoTableau, IoNewspaperOutline, IoPersonCircleOutline } from 'react-icons/io5';
import { IconType } from 'react-icons/lib';

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
            subText1
            subText2
            rightText1
        }
    }
`;

// interface ListArgs {
//     query: string
// }

// const getScrollMargin = () => parseFloat(getComputedStyle(document.documentElement).marginRight);

const ItemBoxShadow = `
    0 2.3px 3.6px #bfbfbf,
    0 6.3px 10px rgba(0, 0, 0, 0.046),
    0 15.1px 24.1px rgba(0, 0, 0, 0.051),
    0 50px 80px #ffffff
`;

const typeIcons: { [key: string]: IconType } = {
    any: IoLogoTableau,
    publication: IoBookOutline,
    author: IoPersonCircleOutline,
    venue: IoNewspaperOutline,
};

const List = ({ router, text, type: resultType }: any) => {
    const { loading, error, data } = useQuery(findResults, {
        variables: { text, resultType },
    });

    if (loading) return null;
    if (error) return <p>{String(error)}</p>;

    const onItemClick = (e: any, res: GenericResult) => {
        if (window?.getSelection()?.toString()?.length) return;
        e.preventDefault();
        router.push(`/${resultType}/[id]`, `/${resultType}/${res.id}`);
    };

    return (
        <Box mt="20px" mr="15px">
            <VStack spacing={4} align="stretch" ml="15px" mr="15px">
                {data.findResults.map((res: GenericResult, idx: number) => (
                    <Box key={idx}>
                        <Button
                            w="100%"
                            h="100%"
                            d="block"
                            textAlign="left"
                            fontWeight="initial"
                            fontSize="15px"
                            bg="#e5e5e5"
                            borderRadius="20px"
                            userSelect="text"
                            p="10px 15px"
                            boxShadow={ItemBoxShadow}
                            lineHeight={1.45}
                            onClick={e => onItemClick(e, res)}
                        >
                            {/* <h3>{res.id}</h3> */}
                            <Box d="flex" alignItems="center">
                                <Icon as={typeIcons[res.resultType]} w="17px" h="17px" mr="5px" />
                                <Text fontWeight="bold" fontSize="16px">
                                    <NextLink href={`/${res.resultType}/[id]`} as={`/${res.resultType}/${res.id}`}>
                                        {he.decode(res.text)}
                                    </NextLink>
                                </Text>
                            </Box>
                            <p>{res.subText1}</p>
                            <p>{res.subText2}</p>
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

    const defaultParams: any = { type: 'any' };
    const params = { ...defaultParams, ...router.query };

    if (!params.text) return null;

    return (
        <Box>
            <List router={router} {...params} />
        </Box>
    );
};

export default ListWrapper;
