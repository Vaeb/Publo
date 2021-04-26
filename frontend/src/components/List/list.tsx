import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import {
    Box, VStack, StackDivider, Text, Link, Button, Icon,
} from '@chakra-ui/react';
import { IoBookOutline, IoLogoTableau, IoNewspaperOutline, IoPersonCircleOutline } from 'react-icons/io5';
import { IconType } from 'react-icons/lib';
import he from 'he';

import { GenericResult, ResultType } from '../../types';

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

interface ListParams {
    results: GenericResult[];
    resultTypeAll: ResultType
}

export const List = ({ results, resultTypeAll }: ListParams): ReactElement => {
    const router = useRouter();

    const onItemClick = (e: any, res: GenericResult) => {
        if (window?.getSelection()?.toString()?.length) return;
        e.preventDefault();
        console.log(`/${res.resultType}/[id]`, `/${res.resultType}/${res.id}`);
        router.push(`/${res.resultType}/[id]`, `/${res.resultType}/${res.id}`);
    };

    return (
        <Box mt="20px" mr="15px">
            <VStack spacing={4} align="stretch" ml="15px" mr="15px">
                {results.map((res: GenericResult, idx: number) => (
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
                                <Text fontWeight="bold" fontSize="16px" whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">
                                    <NextLink href={`/${res.resultType}/[id]`} as={`/${res.resultType}/${res.id}`}>
                                        {he.decode(res.text)}
                                    </NextLink>
                                </Text>
                            </Box>
                            <Text whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{res.subText1}</Text>
                            <Text whiteSpace="nowrap" overflow="hidden" textOverflow="ellipsis">{res.subText2}</Text>
                        </Button>
                    </Box>
                ))}
            </VStack>
            <Box h="20px" />
        </Box>
    );
};
