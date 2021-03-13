import React from 'react';
import { gql, useMutation } from '@apollo/client';
import ReactJson from 'react-json-view';
import styled from 'styled-components';
import {
    Box, Textarea, Heading, Text, InputGroup, InputLeftAddon, Button,
} from '@chakra-ui/react';

const { useState } = React;

const RUN_CODE = gql`
    mutation($code: String!) {
        runCode(code: $code)
    }
`;

const Test = () => {
    const [showCode, setShowCode] = useState(true);
    const [runCode, { loading, error, data }] = useMutation(RUN_CODE);

    const result = data != undefined ? JSON.parse(data.runCode) : data;
    if (result) console.log('> Output:', result);

    let codeInput;

    return (
        <Box className="side-padding">
            <Button
                variant="ghost"
                w="100%"
                fontSize="xl"
                onClick={() => {
                    setShowCode(!showCode);
                }}
            >
                Code:
            </Button>
            <Textarea
                ref={(el) => {
                    codeInput = el;
                }}
                variant="unstyled"
                bg="blackAlpha.800"
                pl="10px"
                pr="10px"
                mt="2px"
                color="white"
                {...(!showCode ? { display: 'none' } : {})}
                onInput={(e) => {
                    e.currentTarget.style.height = '';
                    e.currentTarget.style.height = `${e.currentTarget.scrollHeight + 3}px`;
                }}
            />
            <Button
                mt="10px"
                mb="5px"
                w="100%"
                fontSize="xl"
                onClick={() => {
                    const code = codeInput.value;
                    console.log('Running code:', code);
                    codeInput.focus();
                    codeInput.select();
                    document.execCommand('copy');
                    window.getSelection().removeAllRanges();
                    codeInput.blur();
                    runCode({ variables: { code } });
                }}
            >
                Run
            </Button>
            {loading && <p>Loading...</p>}
            {error && <p>Error: {String(error)}</p>}
            {result && (
                <ReactJson
                    src={result}
                    iconStyle="triangle"
                    displayDataTypes={false}
                    quotesOnKeys={false}
                    enableClipboard={false}
                    style={{ overflow: 'scroll', height: 'calc(100vh - 180px)', marginBottom: '10px' }}
                />
            )}
        </Box>
    );
};

export default Test;
