export type ResultType = 'any' | 'publication' | 'author' | 'venue';

export interface GenericResult {
    id: string;
    resultType: ResultType;
    text: string;
    subText1?: string;
    subText2?: string;
    rightText1?: string;
}

export interface Publication {
    id: string
    resultType?: string
    title: string
    doi: string
    type: string
    year: number
    stampCreated?: string
    volume?: string
    number?: string
    pages?: string
    pdfUrl?: string
    pageUrl?: string
    authors: Author[]
    venue?: Venue
}

export interface Author {
    id: string
    sourceId: string
    resultType?: string
    firstName: string
    lastName: string
    fullName: string
    orcid?: string
    publications: Publication[]
}

export interface Venue {
    id: string
    resultType?: string
    title: string
    type: string
    issn?: string
    publications: Publication[]
}
