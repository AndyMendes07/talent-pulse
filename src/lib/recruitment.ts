import rawData from "@/data/vagas.json";

export type Vaga = {
  nVagas: string | null;
  status: "Aberta" | "Fechada" | "Cancelada" | string;
  etapa: string | null;
  setor: string | null;
  gestor: string | null;
  cargo: string | null;
  tipoVaga: "Estratégica" | "Tática" | "Operacional" | string;
  local: string | null;
  sla: number | null;
  diasCorridos: number | null;
  diasUteis: number | null;
  atraso: number | null;
  dataAbertura: number | null;
  dataFechamento: number | null;
  fonteAprovado: string | null;
  recrutador: string | null;
  motivo: string | null;
  linkedin: number | null;
  catho: number | null;
  indeed: number | null;
  siteEmpresa: number | null;
  solides: number | null;
  indicacao: number | null;
  pat: number | null;
  outros: number | null;
};

export const vagas: Vaga[] = rawData as Vaga[];

export const avg = (nums: (number | null | undefined)[]) => {
  const v = nums.filter((n): n is number => typeof n === "number" && !isNaN(n));
  if (!v.length) return 0;
  return v.reduce((a, b) => a + b, 0) / v.length;
};

export const sum = (nums: (number | null | undefined)[]) =>
  nums.reduce<number>((a, b) => a + (typeof b === "number" ? b : 0), 0);

export const uniq = <T,>(arr: T[]) => Array.from(new Set(arr));

export const excelDateToJs = (serial: number | null) => {
  if (!serial) return null;
  const utc = (serial - 25569) * 86400 * 1000;
  return new Date(utc);
};

export const formatDate = (serial: number | null) => {
  const d = excelDateToJs(serial);
  if (!d) return "—";
  return d.toLocaleDateString("pt-BR");
};
