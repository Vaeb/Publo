import React, { ReactElement, useState, useMemo, useRef, useEffect } from 'react';
import { gql, useQuery } from '@apollo/client';
// import styled from 'styled-components';
import {
    Input, Box, Link, Icon, Button, Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverBody,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { IoLogoTableau, IoBookOutline, IoPersonCircleOutline, IoNewspaperOutline } from 'react-icons/io5';
import { IconType } from 'react-icons/lib';
import NextLink from 'next/link';

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

interface SearchResultsParams { text:string; searchType: string; onClick: () => void; data: any; error: any }

const SearchResults = ({ text, searchType, onClick, data, error }: SearchResultsParams) => {
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
        type: pluralToSingular[searchType],
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
                            {RelevantIcon(res.resultType, false, 'sr-icon')}{res.text}
                        </Link>
                    </NextLink>
                </Box>
            ))}
        </Box>
    );
};

interface SearchFetchParams {
    dataRef: any;
    text: string;
    searchType: string;
    onClick: () => void;
}

const SearchFetch = ({ dataRef, text, searchType, onClick }: SearchFetchParams) => {
    console.log('Fetching search query data...');

    const { loading, error, data: newData } = useQuery(findResults, {
        variables: { text, resultType: pluralToSingular[searchType] },
        fetchPolicy: 'no-cache',
    });

    if (!loading) dataRef.current = newData; // Cache old search results while new results are loading
    const data = dataRef.current;

    console.log('Got data:', 'loading', loading, 'newData', newData, 'data', data, 'error', error);

    return (<SearchResults text={text} searchType={searchType} onClick={onClick} data={data} error={error} />);
};

const DelayedSearch = ({ text, searchType, onClick }: SearchFetchParams) => {
    const [show, setShow] = useState(false);
    const dataRef = useRef({ findResults: [] });

    console.log(dataRef.current);

    const textLen = text.length;
    let waitMs = 650; // 1000

    if (textLen > 4) {
        waitMs = 100; // 200
    } else if (textLen > 2) {
        waitMs = 300; // 500
    }

    console.log(`[${textLen}] ${show} Rendering delay component...`);

    useEffect(() => {
        setShow(false);
        console.log(`[${text.length}] Started countdown...`);
        const delayTimer = setTimeout(() => {
            setShow(true);
        }, waitMs);

        return () => clearTimeout(delayTimer);
    }, [text]);

    if (!show) {
        return (<SearchResults text={text} searchType={searchType} onClick={onClick} data={dataRef.current} error={null} />);
    }

    console.log(`[${textLen}] !!! Fetching results`);

    return (<SearchFetch dataRef={dataRef} text={text} searchType={searchType} onClick={onClick} />);
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
                {show && !!searchVal.length && <DelayedSearch text={searchVal} searchType={searchType} onClick={onResultClick} />}
            </Box>
        </Box>
    );
};

export default Search;
