import React, { ReactElement } from 'react';
// import styled from 'styled-components';
import {
    Heading, Grid, GridItem, Box, Flex,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import NextImage from 'next/image';

import Search from './Search';

const Header = (): ReactElement => (
    <Box pos="relative" maxW="100%" boxShadow="0 2px 8px #f0f1f2" mb="10px">
        <Box display="flex" h="64px">
            <Flex w="calc(100% - 40px)" h="inherit">
                <Box w={['0%', '15%', '15%', '15%']} h="inherit" overflow="hidden">
                    <Box pl={[0, 2, 4, 8]} w="fit-content">
                        <NextLink href="/">
                            <a>
                                <Heading fontWeight={500} display="flex" alignItems="center" fontSize={['md', 'md', 'lg', 'xl']} lineHeight="64px" p="0 10px">
                                    <Box display="inline-flex" alignItems="center" mr={[1, 2, 3, 4]} w={['16px', '20px', '24px', '28px']}>
                                        <NextImage src="/search3.png" alt="" width="28px" height="28px" />
                                    </Box>
                                    Publo
                                </Heading>
                            </a>
                        </NextLink>
                    </Box>
                </Box>
                <Box w={[`${100 - 0}%`, `${100 - 15}%`, `${100 - 15}%`, `${100 - 15}%`]} h="inherit" display="flex" alignItems="center">
                    <Search />
                </Box>
            </Flex>
        </Box>
    </Box>
);

export default Header;
