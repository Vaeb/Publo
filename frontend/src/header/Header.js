import React from 'react';
import styled from 'styled-components';
import {
    Heading, LinkBox, Grid, GridItem, Box, Image,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

import { scrollMargin } from '../app/util';
import Search from './Search';

const HeaderEl = styled.header`
    position: relative;
    max-width: 100%;
    box-shadow: 0 2px 8px #f0f1f2;
`;

const HeaderDiv = styled.div`
    display: flex;
    height: 64px;
`;

const Header = () => (
    <HeaderEl>
        <HeaderDiv>
            <Grid templateColumns="repeat(24, 1fr)" templateRows="repeat(1, 1fr)" w="calc(100% - 40px)" h="inherit">
                <GridItem colSpan={3} h="inherit">
                    <Box pl="30px" w="fit-content">
                        <LinkBox as={RouterLink} to="/home">
                            <Heading fontWeight={500} fontSize="20px" lineHeight="64px" p="0 10px">
                                <Image src={`${process.env.PUBLIC_URL}/search3.png`} alt="" display="inline" h="28px" mr="16px" />
                                Publo
                            </Heading>
                        </LinkBox>
                    </Box>
                </GridItem>
                <GridItem colSpan={21} h="inherit" display="flex" alignItems="center">
                    <Search />
                </GridItem>
            </Grid>
        </HeaderDiv>
    </HeaderEl>
);

export default Header;
