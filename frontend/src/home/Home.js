import React from 'react';
import { useQuery, gql } from '@apollo/client';
import styled from 'styled-components';
import {
    Box,
} from '@chakra-ui/react';

import Header from '../header/Header';
import List from '../list/List';

const Home = () => (
    <div>
        <Box h="30px" />
        {/* <List /> */}
    </div>
);

export default Home;
