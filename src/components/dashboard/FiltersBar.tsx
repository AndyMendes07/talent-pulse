import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Vaga } from "@/lib/recruitment";

export interface Filters {
  status: string;
  recrutador: string;
  tipoVaga: string;
  setor: string;
}

interface FiltersBarProps {
  filters: Filters;
  setFilters: (f: Filters) => void;
  data: Vaga[];
}

const ALL = "__all__";

export const FiltersBar = ({ filters, setFilters, data }: FiltersBarProps) => {
  const opts = (key: keyof Vaga) =>
    Array.from(new Set(data.map((d) => d[key]).filter(Boolean) as string[])).sort();

  const blocks: { key: keyof Filters; label: string; values: string[] }[] = [
    { key: "status", label: "Status", values: opts("status") },
    { key: "tipoVaga", label: "Tipo de Vaga", values: opts("tipoVaga") },
    { key: "recrutador", label: "Recrutador", values: opts("recrutador") },
    { key: "setor", label: "Setor", values: opts("setor") },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {blocks.map((b) => (
        <div key={b.key}>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">
            {b.label}
          </label>
          <Select
            value={filters[b.key] || ALL}
            onValueChange={(v) =>
              setFilters({ ...filters, [b.key]: v === ALL ? "" : v })
            }
          >
            <SelectTrigger className="bg-card">
              <SelectValue placeholder={`Todos`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Todos</SelectItem>
              {b.values.map((v) => (
                <SelectItem key={v} value={v}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      ))}
    </div>
  );
};
