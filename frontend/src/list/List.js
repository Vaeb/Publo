import React from 'react';
import { useQuery, gql } from '@apollo/client';
import styled from 'styled-components';
import { Box, VStack, StackDivider } from '@chakra-ui/react';

const getAllPublications = gql`
    query {
        getAllPublications(limit: 50) {
            id
            title
            type
            volume
            year
        }
    }
`;

const ListWrapperDiv = styled.div`
    margin-left: 8px;
`;

const decodeEntities = (() => {
    // this prevents any overhead from creating the object each time
    const element = document.createElement('div');

    function decodeHTMLEntities(str) {
        if (str && typeof str === 'string') {
            // strip script/html tags
            str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gim, '');
            str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gim, '');
            element.innerHTML = str;
            str = element.textContent;
            element.textContent = '';
        }

        return str;
    }

    return decodeHTMLEntities;
})();

const List = () => {
    const { loading, error, data } = useQuery(getAllPublications);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{String(error)}</p>;

    return (
        <div>
            <VStack divider={<StackDivider borderColor="gray.200" />} spacing={4} align="stretch">
                {data.getAllPublications.map((pub) => (
                    <Box key={pub.id}>
                        {/* <h3>{pub.id}</h3> */}
                        <p>{decodeEntities(pub.title)}</p>
                        <p>Volume {pub.volume}</p>
                        <p>{pub.year}</p>
                    </Box>
                ))}
            </VStack>
            <Box h="20px" />
        </div>
    );
};

const ListWrapper = () => (
    <ListWrapperDiv>
        <List />
    </ListWrapperDiv>
);

export default ListWrapper;
