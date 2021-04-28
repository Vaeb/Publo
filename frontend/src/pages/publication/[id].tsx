import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import { gql, useQuery } from '@apollo/client';
import {
    Box,
    VStack,
    StackDivider,
    Center,
    Text,
    Heading,
    Flex,
    Link,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverArrow,
    PopoverBody,
} from '@chakra-ui/react';

import { Author, GenericResult, Publication, Venue } from '../../types';
import { copyText } from '../../utils/copyText';
import { toGeneric } from '../../utils/toGeneric';
import { List } from '../../components/List/list';
import { arrayToObj } from '../../utils/arrayToObj';

const getPublications = gql`
    query($id: Int!) {
        getPublications(id: $id) {
            id
            source
            title
            doi
            type
            year
            stampCreated
            volume
            pdfUrl
            authors {
                id
                sourceId
                fullName
                publications(limit: 40) {
                    id
                    title
                    year
                    authors {
                        id
                        fullName
                    }
                    venue {
                        id
                        title
                    }
                }
            }
            venue {
                id
                title
                type
                publications(limit: 40) {
                    id
                    title
                    year
                    authors {
                        id
                        fullName
                    }
                    venue {
                        id
                        title
                    }
                }
            }
        }
    }
`;

const blankVenue: Venue = {
    id: '-1',
    title: 'Loading...',
    type: 'Loading...',
    publications: [],
};

const blankAuthor: Author = {
    id: '-1',
    sourceId: '-1',
    firstName: 'Loading...',
    lastName: 'Loading...',
    fullName: 'Loading...',
    publications: [],
};

const blankPublication: Publication = {
    id: '-1',
    source: 'merged',
    title: 'Loading...',
    doi: 'Loading...',
    type: 'Loading...',
    year: 1980,
    authors: [blankAuthor],
    venue: blankVenue,
};

const checkArrIdentical = (key: string, ...arrs: any[][]) => {
    let idx = arrs[0].length;
    for (let i = 1; i < arrs.length; i++) {
        if (arrs[i].length !== idx) return false;
    }
    while (idx--) {
        const baseVal = arrs[0][idx][key];
        for (let i = 1; i < arrs.length; i++) {
            if (baseVal !== arrs[i][idx][key]) return false;
        }
    }
    return true;
};

const getStructuredData = (publications: Publication[], key: string) => {
    const structuredData = [];
    let hasChanged = true;
    let idx = 0;
    while (hasChanged) {
        hasChanged = false;
        const entry = [];
        for (const publ of publications) {
            if (structuredData.length === 0) {
                entry.push(publ.source);
                hasChanged = true;
            } else if ((publ as any)[key][idx]) {
                hasChanged = true;
                entry.push((publ as any)[key][idx].fullName);
            }
        }
        if (entry.length) structuredData.push(entry);
        if (structuredData.length > 1) idx++;
    }
    return structuredData;
};

const PublicationPage = ({ id }: any): ReactElement | null => {
    const { loading, error, data } = useQuery(getPublications, {
        variables: { id: Number(id) },
        // variables: { id: -1 },
    });

    if (loading) return null;
    if (error) return <p>{String(error)}</p>;

    let publications: Publication[] = data.getPublications;

    if (publications == null) {
        publications = [blankPublication];
    }

    const publIdMap = Object.assign({}, ...publications.map(publ => ({ [publ.id]: publ })));
    const mergedPubl = publications[0];
    console.log('mergedPubl', mergedPubl);

    const foundAuthors: { [key: string]: true } = {};
    const foundVenues: { [key: string]: true } = {};

    const allAuthors: Author[] = [];
    const allVenues: Venue[] = [];

    const publicationAuthors: any[] = [];

    publications.forEach((publ) => {
        publ.authors.forEach((author) => {
            if (foundAuthors[author.sourceId]) return;
            foundAuthors[author.sourceId] = true;
            allAuthors.push(author);
        });
        if (publ.venue && !foundVenues[publ.venue.id]) {
            foundVenues[publ.venue.id] = true;
            allVenues.push(publ.venue);
        }
        publicationAuthors.push(publ.authors);
        if (publ.authors.length > mergedPubl.authors.length) {
            mergedPubl.authors = publ.authors;
        }
        if (!mergedPubl.venue && publ.venue) {
            mergedPubl.venue = publ.venue;
        }
    });

    const isAuthorDiff = !checkArrIdentical('id', ...publicationAuthors.filter((authors: any) => authors.length));
    console.log('isAuthorDiff', isAuthorDiff, publicationAuthors);

    const foundPublFromAuthors: any = {};
    const foundPublFromVenues: any = {};

    const genericPublicationsFromAuthors = allAuthors
        .map((author: Author) => toGeneric(author.publications, 'publication', arrayToObj(allAuthors, 'id')))
        .flat(1)
        .filter((result: GenericResult) => {
            if (publIdMap[result.id] || foundPublFromAuthors[result.id]) return false;
            foundPublFromAuthors[result.id] = true;
            return true;
        });

    const genericPublicationsFromVenue = allVenues
        .map((venue: Venue) => toGeneric(venue.publications, 'publication'))
        .flat(1)
        .filter((result: GenericResult) => {
            if (publIdMap[result.id] || foundPublFromVenues[result.id]) return false;
            foundPublFromVenues[result.id] = true;
            return true;
        });

    const publDate = mergedPubl.stampCreated ? String(new Date(Number(mergedPubl.stampCreated))).replace(/ GMT.+$/, '') : null;

    const structuredAuthors = getStructuredData(publications.filter(publ => publ.source !== 'merged'), 'authors');
    console.log('structuredAuthors', structuredAuthors);

    return (
        <div>
            <Box
                bg="#e5e5e5"
                w="calc(100%)"
                boxShadow="8px 8px 21px #bebebe, -8px -8px 21px #ffffff"
                borderRadius="0px"
                padding="30px 0"
                mt="10px"
                pos="relative"
            >
                <Flex justifyContent="center">
                    <Box w="50%">
                        <Popover trigger="hover">
                            <PopoverTrigger>
                                <span>{mergedPubl.year}</span>
                            </PopoverTrigger>
                            <PopoverContent>
                                <PopoverArrow />
                                <PopoverBody fontSize="15px">{publDate}</PopoverBody>
                            </PopoverContent>
                        </Popover>
                        {mergedPubl.venue ? (
                            <>
                                <span> • {mergedPubl.venue.type === 'Unknown' ? '' : `${mergedPubl.venue.type} - `}</span>
                                <Text display="inline" _hover={{ textDecoration: 'underline' }}>
                                    <NextLink href={'/venue/[id]'} as={`/venue/${mergedPubl.venue.id}`}>
                                        {mergedPubl.venue.title}
                                    </NextLink>
                                </Text>
                            </>
                        ) : (
                            <div>&zwnj;</div>
                        )}
                        <Heading mt="0" size="lg" color="#1c1d1e">
                            {mergedPubl.title}
                        </Heading>
                        <Popover trigger="hover">
                            <PopoverTrigger>
                                <Box className={isAuthorDiff ? 'diff-indicator' : undefined}>
                                    {mergedPubl.authors.map((author: any, i: number) => (
                                        <span key={i}>
                                            {i > 0 && <span> • </span>}
                                            <Text
                                                display="inline"
                                                _hover={{
                                                    textDecoration: 'underline',
                                                    textDecorationColor: isAuthorDiff ? 'blue' : 'black',
                                                }}
                                                className={isAuthorDiff ? 'diff-indicator' : undefined}
                                            >
                                                <NextLink href={'/author/[id]'} as={`/author/${author.id}`}>
                                                    {`${author.fullName}`}
                                                </NextLink>
                                            </Text>
                                        </span>
                                    ))}
                                </Box>
                            </PopoverTrigger>
                            {isAuthorDiff ? (
                                <PopoverContent>
                                    <PopoverArrow />
                                    <PopoverBody fontSize="15px">
                                        <Box fontWeight="bold">Identified inconsistencies with author data:</Box>
                                        <Box display="flex">{
                                            // publications
                                            //     .filter(publ => publ.source !== 'merged')
                                            //     .map((publ, i) => (
                                            //         <Box key={i}>
                                            //             <Text display="inline-block" width="70px" fontWeight="bold">{publ.source}: </Text>
                                            //             <Text display="inline">{publ.authors.map(author => author.fullName).join(' • ')}</Text>
                                            //         </Box>
                                            //     ))
                                            structuredAuthors
                                                .map((authorGroup, i) => ([
                                                    i >= 2 ? (
                                                        <Box key={`${i}-dot-box`} display="flex" flexDir="column" mr={'4px'}>{
                                                            authorGroup.map((_, j) => (
                                                                <Text key={`${i}-dot-${j}`} display="inline">•</Text>
                                                            ))
                                                        }</Box>
                                                    ) : undefined,
                                                    <Box key={`${i}-author-box`} display="flex" flexDir="column" mr={i === 0 ? '10px' : '4px'}>{
                                                        authorGroup.map((author, j) => (
                                                            <Text fontWeight={i === 0 ? 'bold' : 'normal'} key={`${i}-author-${j}`} display="inline">{author}</Text>
                                                        ))
                                                    }
                                                    </Box>,
                                                ])).flat(1)
                                        }</Box>
                                    </PopoverBody>
                                </PopoverContent>
                            ) : null}
                        </Popover>
                        <Box fontSize="13px" opacity={0.9} p="5px 0">
                            <span className="interactive" onClick={() => copyText('doi-link')}>
                                DOI:{' '}
                            </span>
                            <Link id="doi-link" target="_blank" href={`https://doi.org/${mergedPubl.doi.toUpperCase()}`}>
                                {mergedPubl.doi.toUpperCase()}
                            </Link>
                        </Box>
                        <Box fontSize="15px">
                            {mergedPubl.pdfUrl ? (
                                <Link href={mergedPubl.pdfUrl} isExternal>
                                    🔗 PDF
                                </Link>
                            ) : (
                                <Text>&zwnj;</Text>
                            )}
                        </Box>
                    </Box>
                </Flex>
                <Flex justifyContent="center" />
            </Box>
            <Box mt="40px" d="flex">
                <Box width="50%">
                    <Text ml="15px" fontSize={20}>
                        Other publications from this {mergedPubl.venue?.type?.toLowerCase() || 'venue'}:
                    </Text>
                    <Box maxH="630px" overflowY="auto">
                        <List results={genericPublicationsFromVenue} resultTypeAll="publication" />
                    </Box>
                </Box>
                <Box width="50%">
                    <Text ml="15px" fontSize={20}>
                        Other publications by these authors:
                    </Text>
                    <Box maxH="630px" overflowY="auto">
                        <List results={genericPublicationsFromAuthors} resultTypeAll="publication" />
                    </Box>
                </Box>
            </Box>
            <Box h="20px" />
        </div>
    );
};

const PublicationWrapper = (): ReactElement | null => {
    const router = useRouter();

    const defaultParams: any = { id: -1 };
    const params = { ...defaultParams, ...router.query };

    return (
        <Box>
            <PublicationPage {...params} />
        </Box>
    );
};

export default PublicationWrapper;
