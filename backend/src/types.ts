import PrismaWrapper from '@prisma/client';

export type PrismaClient = PrismaWrapper.PrismaClient;

export interface Context {
    prisma: PrismaClient;
    serverUrl: string;
}

export type ResultType = 'any' | 'publication' | 'author' | 'venue';

export interface GenericResult {
    id: number;
    resultType: ResultType;
    text: string;
    subText1?: string;
    subText2?: string;
    rightText1?: string;
}
