import React, { ReactElement } from 'react';
import { useRouter } from 'next/router';
import { gql, useQuery } from '@apollo/client';
import {
    Box, VStack, StackDivider, Center, Text, Heading, Flex, Link,
} from '@chakra-ui/react';
import he from 'he';

const getPublication = gql`
    query($id: Int!) {
        getPublication(id: $id) {
            id
            title
            doi
            type
            year
            volume
            pdfUrl
            authors {
                id
                firstName
                lastName
            }
            venue {
                id
                title
            }
        }
    }
`;

const Publication = ({ id }: any): ReactElement | null => {
    const { loading, error, data } = useQuery(getPublication, {
        variables: { id: Number(id) },
        // variables: { id: -1 },
    });

    if (loading) return null;
    if (error) return <p>{String(error)}</p>;

    let publ = data.getPublication;

    if (publ == null) {
        publ = {
            authors: [],
        };
    }

    const copyText = () => {
        if (!window) return;

        window.getSelection()?.selectAllChildren(
            document.getElementById('doi-link') as Node
        );

        /* Copy the text inside the text field */
        document.execCommand('copy');
    };

    return (
        <div>
            <Box bg="#e5e5e5" w="calc(100%)" boxShadow="8px 8px 21px #bebebe, -8px -8px 21px #ffffff" borderRadius="0px" padding="30px 0" pos="relative" >
                <Flex justifyContent="center">
                    <Box w="50%">
                        <span>{publ.year}</span>{publ.venue ? <>
                            <span> • </span>
                            <Link>{publ.venue.title}</Link>
                        </> : <div>&zwnj;</div>}
                        <Heading mt="0" size="lg" color="#1c1d1e">{publ.title}</Heading>
                        {publ.authors.map((author: any, i: number) => (
                            <span key={i}>
                                {i > 0 && <span> • </span>}
                                <Link>{`${author.firstName} ${author.lastName}`}</Link>
                            </span>
                        ))}
                        <Box fontSize="13px" opacity={0.9} p="5px 0">
                            <span className="interactive" onClick={copyText}>DOI: </span><Link id="doi-link" href={`https://doi.org/${publ.doi}`}>{publ.doi}</Link>
                        </Box>
                        {publ.pdfUrl
                            ? <Box fontSize="15px">
                                <Link href={publ.pdfUrl} isExternal>🔗 PDF</Link>
                            </Box>
                            : null}
                    </Box>

                </Flex>
                <Flex justifyContent="center" />
            </Box>
            <Box>
                <Center h="50vh">
                    <Text fontSize={20}>Related papers...</Text>
                </Center>
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
            <Publication {...params} />
        </Box>
    );
};

export default PublicationWrapper;
