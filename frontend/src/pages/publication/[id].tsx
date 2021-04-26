import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import { gql, useQuery } from '@apollo/client';
import {
    Box, VStack, StackDivider, Center, Text, Heading, Flex, Link, Popover, PopoverTrigger, PopoverContent, PopoverArrow, PopoverBody,
} from '@chakra-ui/react';

import { Author, GenericResult, Publication, Venue } from '../../types';
import { copyText } from '../../utils/copyText';
import { toGeneric } from '../../utils/toGeneric';
import { List } from '../../components/List/list';
import { arrayToObj } from '../../utils/arrayToObj';

const getPublication = gql`
    query($id: Int!) {
        getPublication(id: $id) {
            id
            title
            doi
            type
            year
            stampCreated
            volume
            pdfUrl
            authors {
                id
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
    id: -1,
    title: 'Loading...',
    type: 'Loading...',
    publications: [],
};

const blankAuthor: Author = {
    id: -1,
    firstName: 'Loading...',
    lastName: 'Loading...',
    fullName: 'Loading...',
    publications: [],
};

const blankPublication: Publication = {
    id: -1,
    title: 'Loading...',
    doi: 'Loading...',
    type: 'Loading...',
    year: 1980,
    authors: [blankAuthor],
    venue: blankVenue,
};

const PublicationPage = ({ id }: any): ReactElement | null => {
    const { loading, error, data } = useQuery(getPublication, {
        variables: { id: Number(id) },
        // variables: { id: -1 },
    });

    if (loading) return null;
    if (error) return <p>{String(error)}</p>;

    let publ: Publication = data.getPublication;

    if (publ == null) {
        publ = blankPublication;
    }

    const genericPublicationsFromAuthors = (publ?.authors || []).map(author => toGeneric(author.publications, 'publication', arrayToObj(publ?.authors || [], 'id')));
    const genericPublicationsFromVenue = toGeneric(publ?.venue?.publications, 'publication').filter((result: GenericResult) => {
        if (result.id == publ.id) return false;
        return true;
    });

    const foundPubl: any = {};
    const genericPublicationsFromAuthorsUnique = genericPublicationsFromAuthors.flat(1).filter((result: GenericResult) => {
        if (result.id == publ.id || foundPubl[result.id]) return false;
        foundPubl[result.id] = true;
        return true;
    });

    console.log(publ.stampCreated, String(new Date(Number(publ.stampCreated) as number)));

    const publDate = publ.stampCreated
        ? String(new Date(Number(publ.stampCreated))).replace(/ GMT.+$/, '')
        : null;

    return (
        <div>
            <Box
                bg="#e5e5e5"
                w="calc(100%)"
                boxShadow="8px 8px 21px #bebebe, -8px -8px 21px #ffffff"
                borderRadius="0px"
                padding="30px 0"
                pos="relative"
            >
                <Flex justifyContent="center">
                    <Box w="50%">
                        <Popover trigger="hover">
                            <PopoverTrigger>
                                <span>{publ.year}</span>
                            </PopoverTrigger>
                            <PopoverContent>
                                <PopoverArrow />
                                <PopoverBody fontSize="15px">{publDate}</PopoverBody>
                            </PopoverContent>
                        </Popover>
                        {publ.venue ? (
                            <>
                                <span> • {publ.venue.type === 'Unknown' ? '' : `${publ.venue.type} - `}</span>
                                <NextLink href={'/venue/[id]'} as={`/venue/${publ.venue.id}`}>
                                    <Link>{publ.venue.title}</Link>
                                </NextLink>
                            </>
                        ) : (
                            <div>&zwnj;</div>
                        )}
                        <Heading mt="0" size="lg" color="#1c1d1e">
                            {publ.title}
                        </Heading>
                        {publ?.authors?.map((author: any, i: number) => (
                            <span key={i}>
                                {i > 0 && <span> • </span>}
                                <NextLink href={'/author/[id]'} as={`/author/${author.id}`}>
                                    <Link>{`${author.fullName}`}</Link>
                                </NextLink>
                            </span>
                        ))}
                        <Box fontSize="13px" opacity={0.9} p="5px 0">
                            <span className="interactive" onClick={() => copyText('doi-link')}>
                                DOI:{' '}
                            </span>
                            <Link id="doi-link" target="_blank" href={`https://doi.org/${publ?.doi?.toUpperCase()}`}>
                                {publ?.doi?.toUpperCase()}
                            </Link>
                        </Box>
                        <Box fontSize="15px">
                            {publ.pdfUrl ? (
                                <Link href={publ.pdfUrl} isExternal>
                                    🔗 PDF
                                </Link>
                            ) : <Text>&zwnj;</Text>}
                        </Box>
                    </Box>
                </Flex>
                <Flex justifyContent="center" />
            </Box>
            <Box mt="40px" d="flex">
                <Box width="50%">
                    <Text ml="15px" fontSize={20}>
                        Other publications from this venue:
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
                        <List results={genericPublicationsFromAuthorsUnique} resultTypeAll="publication" />
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
