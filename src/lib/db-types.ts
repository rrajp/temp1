export type Schema = {
  semes: {
    id?: string;
    seme: string;
    category: string;
    description: string;
    clauses: string; // JSON string of string[]
    metadataFields: string; // JSON string of string[]
    createdAt?: string;
    updatedAt?: string;
  }
}

export type Seme = {
  id: string;
  seme: string;
  category: string;
  description: string;
  clauses: string[];
  metadataFields: string[];
  createdAt: Date;
  updatedAt: Date;
}

export type SemeFormData = {
  seme: string;
  category: string;
  description: string;
  clauses: string[];
  metadataFields: string[];
}