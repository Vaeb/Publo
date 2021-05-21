import React, { ReactElement, useState, useMemo, useRef } from 'react';
import { gql, useQuery } from '@apollo/client';
// import styled from 'styled-components';
import {
    Input, Box, Link, Icon, Button, Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverBody,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { IoLogoTableau, IoBookOutline, IoPersonCircleOutline, IoNewspaperOutline } from 'react-icons/io5';
import { IconType } from 'react-icons/lib';
import NextLink from 'next/link';
import he from 'he';

import { GenericResult, ResultType } from '../../types';

const findResults = gql`
    query($text: String!, $resultType: String) {
        findResults(text: $text, resultType: $resultType, includeDetails: false, fetchLimit: 6) {
            id
            resultType
            text
        }
    }
`;

const pluralToSingular: { [key: string]: ResultType } = {
    all: 'any',
    publications: 'publication',
    authors: 'author',
    venues: 'venue',
};

const typeIcons: { [key: string]: IconType } = {
    any: IoLogoTableau,
    publication: IoBookOutline,
    author: IoPersonCircleOutline,
    venue: IoNewspaperOutline,
};

const RelevantIcon = (resultType: ResultType, allowAny = true, className?: string) => {
    if (!allowAny && resultType === 'any') return null;

    return (
        <Icon as={typeIcons[resultType]} className={className} />
    );
};

interface SearchResultsParams {
    text: string;
    searchType: string;
    onClick: () => void;
}

const SearchResults = ({ text, searchType, onClick }: SearchResultsParams) => {
    const resultType = pluralToSingular[searchType];

    const { loading, error, data: _data } = useQuery(findResults, {
        variables: { text, resultType },
        fetchPolicy: 'no-cache',
    });

    const ref = useRef(_data);
    if (!loading) ref.current = _data; // Cache old search results while new results are loading
    const data = ref.current;

    console.log('Got data:', 'loading', loading, '_data', _data, 'data', data, 'error', error);

    let results: GenericResult[];
    if (!data) {
        return null;
    }

    if (error) {
        results = [{ id: '0', resultType: 'any', text: String(error) }];
    }

    results = [...data.findResults];

    if (!error) results.splice(0, 0, { id: '0', resultType: 'any', text: `> Search${searchType !== 'all' ? ` ${searchType}` : ''} for '${text}'` });

    const listQuery = {
        type: resultType,
    };

    return (
        <Box
            position="absolute"
            marginTop="5px"
            borderRadius="4px"
            zIndex={100}
            p="16px"
            lineHeight={2}
            bg="white"
            boxShadow="0 3px 6px -4px rgb(0 0 0 / 12%), 0 6px 16px 0 rgb(0 0 0 / 8%), 0 9px 28px 8px rgb(0 0 0 / 5%)"
        >
            {results.map((res, i) => (
                <Box key={i} fontWeight={400} color="#5b6886" fontSize="14px" mb="2px">
                    <NextLink {...(i === 0
                        ? {
                            href: { pathname: '/list/[text]', query: listQuery },
                            as: { pathname: `/list/${text}`, query: listQuery },
                        }
                        : {
                            href: { pathname: `/${res.resultType}/[id]` },
                            as: { pathname: `/${res.resultType}/${res.id}` },
                        }
                    )}>
                        <Link variant="hover-col-dark1" onClick={onClick} w="100%">
                            {RelevantIcon(res.resultType, false, 'sr-icon')}{he.decode(res.text)}
                        </Link>
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
            onBlur: (e: React.FocusEvent<HTMLElement>) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    toggleShow(false);
                }
            },
        }),
        []
    );

    return [show, eventHandlers, toggleShow];
};

const SearchTypeButton = ({ type, searchType, setSearchType }: any) => (
    <Popover trigger="hover">
        <PopoverTrigger>
            <Button className={`st-button ${type === searchType ? 'selected' : ''}`} onClick={() => {
                setSearchType(type);
            }}>
                {RelevantIcon(pluralToSingular[type], true, 'st-icon')}
            </Button>
        </PopoverTrigger>
        <PopoverContent>
            <PopoverArrow />
            <PopoverBody fontSize="15px">{`${type[0].toUpperCase()}${type.slice(1)}`}</PopoverBody>
        </PopoverContent>
    </Popover>
);

const Search = (): ReactElement => {
    const [searchVal, setSearchVal] = useState('');
    const [searchType, setSearchType] = useState('all');
    const [show, eventHandlers, toggleShow] = toggleOnFocus();

    const onResultClick = () => {
        // setSearchVal('');
        toggleShow(false);
    };

    return (
        // IoLogoTableau, IoBookOutline, IoPersonCircleOutline, IoNewspaperOutline
        <Box tabIndex="0" w="100%" position="relative" d="flex" alignItems="center" {...eventHandlers}>
            <SearchTypeButton type="all" searchType={searchType} setSearchType={setSearchType} />
            <SearchTypeButton type="publications" searchType={searchType} setSearchType={setSearchType} />
            <SearchTypeButton type="authors" searchType={searchType} setSearchType={setSearchType} />
            <SearchTypeButton type="venues" searchType={searchType} setSearchType={setSearchType} />
            <Box>
                <Input
                    value={searchVal}
                    onChange={e => setSearchVal(e.target.value)}
                    variant="unstyled"
                    placeholder={`Search ${searchType}...`}
                    fontSize={['sm', 'md']}
                    pl="11px"
                />
                {/* </InputGroup> */}
                {show && !!searchVal.length && <SearchResults text={searchVal} searchType={searchType} onClick={onResultClick} />}
            </Box>
        </Box>
    );
};

export default Search;
