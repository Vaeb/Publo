import React, { ReactElement } from 'react';
// import styled from 'styled-components';
import {
    Heading, Grid, GridItem, Box, Flex, useBreakpointValue, Icon,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import NextImage from 'next/image';
import { AiOutlineHome } from 'react-icons/ai';

import Search from './Search';

const ColumnLogo = () => {
    const showFull = useBreakpointValue([false, true, true, true]);
    return (
        <Box pl={[0, 2, 4, 8]} w="100%" h="100%">
            <NextLink href="/">
                <a>
                    {showFull ? (
                        <Heading
                            fontWeight={500}
                            display="flex"
                            alignItems="center"
                            fontSize={['md', 'md', 'lg', 'xl']}
                            lineHeight="64px"
                            p="0 10px"
                        >
                            <Box display="inline-flex" alignItems="center" mr={[1, 2, 3, 4]} w={['16px', '20px', '24px', '28px']}>
                                <NextImage src="/search3.png" alt="" width="28px" height="28px" />
                            </Box>
                            Publo
                        </Heading>
                    ) : (
                        <Box w="100%" h="100%" display="flex" alignItems="center" justifyContent="center" pl={2}>
                            <Icon as={AiOutlineHome} color="#ced4d9" w={5} h={5} />
                        </Box>
                    )}
                </a>
            </NextLink>
        </Box>
    );
};

const ColumnSearch = () => <Search />;

const Header = (): ReactElement => (
    <Box pos="relative" maxW="100%" boxShadow="0 2px 8px #f0f1f2" mb="10px">
        <Box display="flex" h="64px">
            <Flex w="calc(100% - 40px)" h="inherit">
                <Box w={['10%', '15%', '15%', '15%']} h="inherit" overflow="hidden">
                    <ColumnLogo />
                </Box>
                <Box w={[`${100 - 10}%`, `${100 - 15}%`, `${100 - 15}%`, `${100 - 15}%`]} h="inherit" display="flex" alignItems="center">
                    <ColumnSearch />
                </Box>
            </Flex>
        </Box>
    </Box>
);

export default Header;
