import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { gql, useQuery } from '@apollo/client';
import {
    Box, VStack, StackDivider, Center, Text, Heading, Flex, Link,
} from '@chakra-ui/react';

import { Author } from '../../types';
import { copyText } from '../../utils/copyText';
import { List } from '../../components/List/list';
import { toGeneric } from '../../utils/toGeneric';

const getAuthor = gql`
    query($id: Int!) {
        getAuthor(id: $id) {
            id
            firstName
            lastName
            fullName
            orcid
            publications {
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
`;

const AuthorPage = ({ id }: any): ReactElement | null => {
    const { loading, error, data } = useQuery(getAuthor, {
        variables: { id: Number(id) },
        // variables: { id: -1 },
    });

    if (loading) return null;
    if (error) return <p>{String(error)}</p>;

    let author: Author | Record<string, never> = data.getAuthor;

    if (author == null) {
        author = {};
    }

    const genericPublications = toGeneric(author?.publications, 'publication');
    const numPublications = author?.publications?.length || 0;

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
                            {author.fullName}
                        </Heading>
                        <Box>{numPublications} Publication{numPublications === 1 ? '' : 's'}</Box>
                        <Box fontSize="13px" opacity={0.9} p="5px 0">
                            <span className="interactive" onClick={() => copyText('orcid-link')}>
                                ORCID:{' '}
                            </span>
                            <Link id="orcid-link" href={author?.orcid}>
                                {(author?.orcid?.match(/[\w-]+$/) || ['Unknown'])[0]}
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

const AuthorWrapper = (): ReactElement | null => {
    const router = useRouter();

    const defaultParams: any = { id: -1 };
    const params = { ...defaultParams, ...router.query };

    return (
        <Box>
            <AuthorPage {...params} />
        </Box>
    );
};

export default AuthorWrapper;
