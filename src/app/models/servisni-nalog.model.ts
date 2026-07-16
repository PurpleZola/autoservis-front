export interface ServisniNalog {
    id?: number;
    datumPrijema: string;
    datumZavrsetka?: string;
    opisProblema: string;
    status: string;
    sledeciServisDatum?: string;
    voziloId: number;
    serviserID: number;
}