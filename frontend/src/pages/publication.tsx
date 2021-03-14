import React from 'react';
import {
    Box, Heading,
} from '@chakra-ui/react';

const Publication = ({ title }: any) => (
    <Box>
        <Heading fontWeight={500} fontSize="24px">
            {title}
        </Heading>
    </Box>
);

export default Publication;
