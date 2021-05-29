import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { gql, useQuery } from '@apollo/client';
import {
    Box, VStack, StackDivider, Center, Text, Heading, Flex, Link,
} from '@chakra-ui/react';

import { Venue } from '../../types';
import { copyText } from '../../utils/copyText';
import { List } from '../../components/List/list';
import { toGeneric } from '../../utils/toGeneric';

const getVenue = gql`
    query($id: Int!) {
        getVenue(id: $id) {
            id
            title
            issn
            publications {
                id
                publicationRootId
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
`;

const VenuePage = ({ id }: any): ReactElement | null => {
    const { loading, error, data } = useQuery(getVenue, {
        variables: { id: Number(id) },
        // variables: { id: -1 },
    });

    if (loading) return null;
    if (error) return <p>{String(error)}</p>;

    let venue: Venue | Record<string, never> = data.getVenue;

    if (venue == null) {
        venue = {};
    }

    const genericPublications = toGeneric(venue?.publications, 'publication');
    const numPublications = venue?.publications?.length || 0;

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
                        <Heading mt="0" size="lg" color="#1c1d1e">
                            {venue.title}
                        </Heading>
                        <Box>{numPublications} Publication{numPublications === 1 ? '' : 's'}</Box>
                        <Box fontSize="13px" opacity={0.9} p="5px 0">
                            <span className="interactive" onClick={() => copyText('issn-link')}>
                                ISSN:{' '}
                            </span>
                            <Link id="issn-link" target="_blank" href={`https://portal.issn.org/resource/ISSN/${venue?.issn}`}>
                                {venue?.issn}
                            </Link>
                        </Box>
                    </Box>
                </Flex>
                <Flex justifyContent="center" />
            </Box>
            <Box>
                {/* <Center h="50vh">
                    <Text fontSize={20}>Related papers...</Text>
                </Center> */}
                <List results={genericPublications} resultTypeAll="publication" />
            </Box>
            <Box h="20px" />
        </div>
    );
};

const VenueWrapper = (): ReactElement | null => {
    const router = useRouter();

    const defaultParams: any = { id: -1 };
    const params = { ...defaultParams, ...router.query };

    return (
        <Box>
            <VenuePage {...params} />
        </Box>
    );
};

export default VenueWrapper;
