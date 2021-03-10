import React from 'react';
import styled from 'styled-components';
import {
    Box, Heading,
} from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const Header = ({ title }) => (
    <Box>
        <Heading fontWeight={500} fontSize="24px">
            {title}
        </Heading>
    </Box>
);

export default Header;
