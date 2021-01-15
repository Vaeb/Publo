import React from 'react';
import { useQuery, gql } from '@apollo/client';
import styled from 'styled-components';

const getPublications = gql`
    query {
        publications {
            id
            title
            type
            volume
            year
        }
    }
`;

const ListDiv = styled.div`
    margin-left: 8px;
`;

const List = () => {
    const { loading, error, data } = useQuery(getPublications);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return data.publications.map((publication) => (
        <ListDiv>
            <h3>Publication {publication.id}</h3>
            <p><b>Title:</b> {publication.title}</p>
            <p><b>Type:</b> {publication.type}</p>
            <p><b>Volume:</b> {publication.volume}</p>
            <p><b>Year:</b> {publication.year}</p>
            <hr />
        </ListDiv>
    ));
};

export default List;
