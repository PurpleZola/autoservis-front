export interface PredvidjanjeKvara {
    vozilo_id: number;
    marka?: string;
    model?: string;
    kilometraza?: number;
    godina?: number;
    broj_servisa?: number;
    istorija_kvarova: string[];
    preporuke: string[];
    preporuka?: string;
}

export interface PreporukaDijela {
    naziv: string;
    razlog: string;
}

export interface NajcesciDio {
    naziv: string;
    broj_zamjena: number;
}

export interface PreporukaDijelova {
    vozilo_id: number;
    marka?: string;
    model?: string;
    kilometraza?: number;
    najcesci_dijelovi: NajcesciDio[];
    preporuceni_dijelovi: PreporukaDijela[];
    greska?: string;
}
