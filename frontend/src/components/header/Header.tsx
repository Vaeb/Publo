import React, { ReactElement } from 'react';
// import styled from 'styled-components';
import {
    Heading, Grid, GridItem, Box,
} from '@chakra-ui/react';
import NextLink from 'next/link';
import NextImage from 'next/image';

import Search from './Search';

const Header = (): ReactElement => (
    <Box pos="relative" maxW="100%" boxShadow="0 2px 8px #f0f1f2" mb="10px">
        <Box display="flex" h="64px">
            <Grid templateColumns="repeat(24, 1fr)" templateRows="repeat(1, 1fr)" w="calc(100% - 40px)" h="inherit">
                <GridItem colSpan={3} h="inherit">
                    <Box pl="30px" w="fit-content">
                        <NextLink href="/">
                            <a>
                                <Heading fontWeight={500} display="flex" alignItems="center" fontSize="20px" lineHeight="64px" p="0 10px">
                                    <Box display="inline-flex" alignItems="center" mr="16px" h="100%">
                                        <NextImage src="/search3.png" alt="" width="28px" height="28px" />
                                    </Box>
                                    Publo
                                </Heading>
                            </a>
                        </NextLink>
                    </Box>
                </GridItem>
                <GridItem colSpan={21} h="inherit" display="flex" alignItems="center">
                    <Search />
                </GridItem>
            </Grid>
        </Box>
    </Box>
);

export default Header;
