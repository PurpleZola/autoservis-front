export interface Termin {
    id?: number;
    datumTermina: string;
    vrijemeTermina: string;
    opisProblema: string;
    status: string;
    voziloId: number;
    klijentId: number;
    razlogOdbijanja?: string;
    servisniNalogId?: number;
}
