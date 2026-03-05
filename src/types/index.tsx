// src/types/index.ts

export interface Contrato {
  id: string;
  clienteNome: string;
  banco: string;
  tipo: string;
  valor: number;
  dataVencimento: Date;
}

export interface DocumentoAnexo {
  uri: string; // URI do arquivo (local ou cache)
  nome: string; // Nome do arquivo (opcional)
  tipo: "image" | "pdf";
}
