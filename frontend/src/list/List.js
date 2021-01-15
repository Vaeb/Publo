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

const ListWrapperDiv = styled.div`
    margin-left: 8px;
`;

const List = () => {
    const { loading, error, data } = useQuery(getPublications);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>{String(error)}</p>;

    return data.publications.map((publication) => (
        <div>
            <h3>Publication {publication.id}</h3>
            <p><b>Title:</b> {publication.title}</p>
            <p><b>Type:</b> {publication.type}</p>
            <p><b>Volume:</b> {publication.volume}</p>
            <p><b>Year:</b> {publication.year}</p>
            <hr />
        </div>
    ));
};

const ListWrapper = () => (
    <ListWrapperDiv>
        <List />
    </ListWrapperDiv>
);

export default ListWrapper;
