import React from 'react';
import { useQuery, gql } from '@apollo/client';
import styled from 'styled-components';
import { InputGroup, InputLeftElement, Input, Box, Link } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { Link as RouterLink } from 'react-router-dom';

const findPublications = gql`
    query($text: String!, $type: String) {
        findPublications(text: $text, type: $type, limit: 6) {
            id
            title
            type
            volume
            year
        }
    }
`;

const SearchResults = ({ text, onClick }) => {
    const { loading, error, data: _data } = useQuery(findPublications, {
        variables: { text },
    });

    const ref = React.useRef(_data);
    if (!loading) ref.current = _data;
    const data = ref.current;

    let results;
    if (loading && !data) {
        return false;
    } else if (error) {
        results = [{ id: 0, title: String(error) }];
    } else if (!data.findPublications.length) {
        return false;
    } else {
        results = data.findPublications;
    }

    return (
        <Box
            position="absolute"
            marginTop="5px"
            borderRadius="4px"
            p="16px"
            lineHeight={2}
            bg="white"
            boxShadow="0 3px 6px -4px rgb(0 0 0 / 12%), 0 6px 16px 0 rgb(0 0 0 / 8%), 0 9px 28px 8px rgb(0 0 0 / 5%)"
            onClick={onClick}
        >
            {results.map((pub) => (
                <Box key={pub.id}>
                    <Link as={RouterLink} to="/list">
                        {pub.title}
                    </Link>
                </Box>
            ))}
        </Box>
    );
};

const toggleOnFocus = (initial = false) => {
    const [show, toggle] = React.useState(initial);

    const eventHandlers = React.useMemo(
        () => ({
            onFocus: () => toggle(true),
            onBlur: (e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                    toggle(false);
                }
            },
        }),
        []
    );

    return [show, eventHandlers];
};

const Search = () => {
    const [searchVal, setSearchVal] = React.useState('');
    const [show, eventHandlers] = toggleOnFocus();

    const handleChange = (event) => setSearchVal(event.target.value);

    console.log('searchVal', searchVal, searchVal.length);

    return (
        <Box w="100%" position="relative" {...eventHandlers}>
            <InputGroup>
                <InputLeftElement pointerEvents="none" h="100%">
                    <SearchIcon color="#ced4d9" />
                </InputLeftElement>
                <Input value={searchVal} onChange={handleChange} placeholder="Search publications..." pl="45px" />
            </InputGroup>
            {show && !!searchVal.length && <SearchResults text={searchVal} />}
        </Box>
    );
};

export default Search;
