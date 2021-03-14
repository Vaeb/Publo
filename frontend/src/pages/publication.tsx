import React, { FC, ReactElement } from 'react';
import {
    Box, Heading,
} from '@chakra-ui/react';

const Publication: FC<{ title: string }> = ({ title }): ReactElement => (
    <Box>
        <Heading fontWeight={500} fontSize="24px">
            {title}
        </Heading>
    </Box>
);

export default Publication;
