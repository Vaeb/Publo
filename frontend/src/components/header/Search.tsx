import React from 'react';
import { gql, useQuery } from '@apollo/client';
import styled from 'styled-components';
import { InputGroup, InputLeftElement, Input, Box, Link } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import NextLink from "next/link";

const { useState, useMemo, useRef } = React;

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

    const ref = useRef(_data);
    if (!loading) ref.current = _data;
    const data = ref.current;

    let results;
    if ((loading && !data) || !data.findPublications.length) {
        return null;
    }

    if (error) {
        results = [{ id: 0, title: String(error) }];
    }

    results = [...data.findPublications];

    if (!error) results.splice(0, 0, { id: 0, title: `> Search for '${text}'` });

    return (
        <Box
            position="absolute"
            marginTop="5px"
            borderRadius="4px"
            p="16px"
            lineHeight={2}
            bg="white"
            boxShadow="0 3px 6px -4px rgb(0 0 0 / 12%), 0 6px 16px 0 rgb(0 0 0 / 8%), 0 9px 28px 8px rgb(0 0 0 / 5%)"
        >
            {results.map(pub => (
                <Box key={pub.id}>
                    <NextLink href="/list">
                        <Link onClick={onClick} w="100%">{pub.title}</Link>
                    </NextLink>
                </Box>
            ))}
        </Box>
    );
};

const toggleOnFocus = (initial = false): any => {
    const [show, toggleShow] = useState(initial);

    const eventHandlers = useMemo(
        () => ({
            onFocus: () => toggleShow(true),
            onBlur: (e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                    toggleShow(false);
                }
            },
        }),
        []
    );

    return [show, eventHandlers, toggleShow];
};

const Search = () => {
    const [searchVal, setSearchVal] = useState('');
    const [show, eventHandlers, toggleShow] = toggleOnFocus();

    const onResultClick = () => {
        setSearchVal('');
        toggleShow(false);
    };

    return (
        <Box tabIndex="0" w="100%" position="relative" {...eventHandlers}>
            <InputGroup>
                <InputLeftElement pointerEvents="none" h="100%">
                    <SearchIcon color="#ced4d9" />
                </InputLeftElement>
                <Input
                    value={searchVal}
                    onChange={e => setSearchVal(e.target.value)}
                    variant="unstyled"
                    placeholder="Search publications..."
                    pl="45px"
                />
            </InputGroup>
            {show && !!searchVal.length && <SearchResults text={searchVal} onClick={onResultClick} />}
        </Box>
    );
};

export default Search;