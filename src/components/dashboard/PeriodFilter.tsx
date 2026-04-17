import { useMemo } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { excelDateToJs, vagas } from "@/lib/recruitment";

export interface PeriodRange {
  from: Date | null;
  to: Date | null;
}

interface PeriodFilterProps {
  range: PeriodRange;
  setRange: (r: PeriodRange) => void;
}

const ALL = "__all__";

export const PeriodFilter = ({ range, setRange }: PeriodFilterProps) => {
  const { years, monthsByYear, minDate, maxDate } = useMemo(() => {
    const ds = vagas
      .flatMap((v) => [excelDateToJs(v.dataAbertura), excelDateToJs(v.dataFechamento)])
      .filter((d): d is Date => !!d);
    const ys = Array.from(new Set(ds.map((d) => d.getFullYear()))).sort();
    const map: Record<number, number[]> = {};
    ds.forEach((d) => {
      const y = d.getFullYear();
      const m = d.getMonth();
      map[y] = map[y] || [];
      if (!map[y].includes(m)) map[y].push(m);
    });
    Object.values(map).forEach((arr) => arr.sort((a, b) => a - b));
    return {
      years: ys,
      monthsByYear: map,
      minDate: ds.length ? new Date(Math.min(...ds.map((d) => d.getTime()))) : null,
      maxDate: ds.length ? new Date(Math.max(...ds.map((d) => d.getTime()))) : null,
    };
  }, []);

  const selectedYear =
    range.from && range.to && range.from.getFullYear() === range.to.getFullYear()
      ? range.from.getFullYear()
      : null;

  const isFullYear =
    selectedYear !== null &&
    range.from?.getMonth() === 0 &&
    range.from?.getDate() === 1 &&
    range.to?.getMonth() === 11 &&
    range.to?.getDate() === 31;

  const isFullMonth =
    selectedYear !== null &&
    range.from?.getDate() === 1 &&
    range.to &&
    range.to.getMonth() === range.from!.getMonth() &&
    new Date(selectedYear, range.from!.getMonth() + 1, 0).getDate() === range.to.getDate();

  const yearValue = isFullYear || isFullMonth ? String(selectedYear) : ALL;
  const monthValue = isFullMonth ? String(range.from!.getMonth()) : ALL;

  const selectYear = (y: string) => {
    if (y === ALL) {
      setRange({ from: null, to: null });
      return;
    }
    const yn = Number(y);
    setRange({ from: new Date(yn, 0, 1), to: new Date(yn, 11, 31) });
  };

  const selectMonth = (m: string) => {
    const yn = selectedYear ?? new Date().getFullYear();
    if (m === ALL) {
      setRange({ from: new Date(yn, 0, 1), to: new Date(yn, 11, 31) });
      return;
    }
    const mn = Number(m);
    setRange({
      from: new Date(yn, mn, 1),
      to: new Date(yn, mn + 1, 0),
    });
  };

  const monthOptions = selectedYear ? monthsByYear[selectedYear] ?? [] : [];

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Ano</label>
        <Select value={yearValue} onValueChange={selectYear}>
          <SelectTrigger className="w-[120px] bg-card">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos</SelectItem>
            {years.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">Mês</label>
        <Select
          value={monthValue}
          onValueChange={selectMonth}
          disabled={!selectedYear}
        >
          <SelectTrigger className="w-[150px] bg-card">
            <SelectValue placeholder="Todos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>Todos</SelectItem>
            {monthOptions.map((m) => (
              <SelectItem key={m} value={String(m)}>
                {format(new Date(2000, m, 1), "MMMM", { locale: ptBR })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          Data inicial
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[160px] justify-start text-left font-normal bg-card",
                !range.from && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {range.from ? format(range.from, "dd/MM/yyyy") : "Início"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={range.from ?? undefined}
              onSelect={(d) => setRange({ ...range, from: d ?? null })}
              defaultMonth={range.from ?? minDate ?? undefined}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1 block">
          Data final
        </label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-[160px] justify-start text-left font-normal bg-card",
                !range.to && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {range.to ? format(range.to, "dd/MM/yyyy") : "Fim"}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={range.to ?? undefined}
              onSelect={(d) => setRange({ ...range, to: d ?? null })}
              defaultMonth={range.to ?? maxDate ?? undefined}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
      </div>

      {(range.from || range.to) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setRange({ from: null, to: null })}
        >
          Limpar período
        </Button>
      )}
    </div>
  );
};
