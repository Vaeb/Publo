export type ResultType = 'any' | 'publication' | 'author' | 'venue';

export interface GenericResult {
    id: number;
    resultType: ResultType;
    text: string;
    subText1?: string;
    subText2?: string;
    rightText1?: string;
}

export interface Publication {
    id: number
    resultType?: string
    title: string
    doi: string
    type: string
    year: number
    stampCreated?: string
    volume?: string
    pdfUrl?: string
    pageUrl?: string
    authors: Author[]
    venue?: Venue
}

export interface Author {
    id: number
    resultType?: string
    firstName: string
    lastName: string
    fullName: string
    orcid?: string
    publications: Publication[]
}

export interface Venue {
    id: number
    resultType?: string
    title: string
    type: string
    issn?: string
    publications: Publication[]
}
