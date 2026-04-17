import { useMemo, useState } from "react";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Users,
  TrendingUp,
  AlertTriangle,
  Target,
  Activity,
  XCircle,
  Inbox,
  CalendarRange,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { vagas, avg, sum, formatDate, excelDateToJs, type Vaga } from "@/lib/recruitment";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ChartCard } from "@/components/dashboard/ChartCard";
import { FiltersBar, type Filters } from "@/components/dashboard/FiltersBar";
import { PeriodFilter, type PeriodRange } from "@/components/dashboard/PeriodFilter";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const MONTH_LABELS = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

/** A vaga is considered "in" the period if its opening date falls within it.
 *  This makes "volume of vacancies in the period" intuitive and consistent. */
const filterByPeriod = (data: Vaga[], from: Date | null, to: Date | null) => {
  if (!from && !to) return data;
  const start = from ? from.getTime() : -Infinity;
  const end = to
    ? new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59).getTime()
    : Infinity;
  return data.filter((v) => {
    const op = excelDateToJs(v.dataAbertura)?.getTime();
    if (op === undefined) return false;
    return op >= start && op <= end;
  });
};

const pctChange = (curr: number, prev: number): number | null => {
  if (prev === 0) return curr === 0 ? 0 : null;
  return (curr - prev) / prev;
};


const PALETTE = [
  "hsl(217 91% 45%)",
  "hsl(175 70% 41%)",
  "hsl(38 95% 55%)",
  "hsl(152 65% 45%)",
  "hsl(280 70% 55%)",
  "hsl(0 75% 60%)",
  "hsl(200 95% 55%)",
  "hsl(340 75% 55%)",
  "hsl(45 90% 55%)",
];

const Index = () => {
  const [filters, setFilters] = useState<Filters>({
    status: "",
    recrutador: "",
    tipoVaga: "",
    setor: "",
  });

  const filtered = useMemo(() => {
    return vagas.filter(
      (v) =>
        (!filters.status || v.status === filters.status) &&
        (!filters.recrutador || v.recrutador === filters.recrutador) &&
        (!filters.tipoVaga || v.tipoVaga === filters.tipoVaga) &&
        (!filters.setor || v.setor === filters.setor)
    );
  }, [filters]);

  const kpis = useMemo(() => {
    const total = filtered.length;
    const fechadas = filtered.filter((v) => v.status === "Fechada").length;
    const abertas = filtered.filter((v) => v.status === "Aberta").length;
    const canceladas = filtered.filter((v) => v.status === "Cancelada").length;
    const taxaFechamento = total ? (fechadas / total) * 100 : 0;

    const fechadasArr = filtered.filter((v) => v.status === "Fechada");
    const slaMedio = avg(fechadasArr.map((v) => v.diasUteis));
    const slaCorridoMedio = avg(fechadasArr.map((v) => v.diasCorridos));
    const atrasoMedio = avg(fechadasArr.map((v) => v.atraso));
    const noPrazo = fechadasArr.filter((v) => (v.atraso ?? 0) <= 0).length;
    const pctNoPrazo = fechadasArr.length ? (noPrazo / fechadasArr.length) * 100 : 0;

    return {
      total,
      fechadas,
      abertas,
      canceladas,
      taxaFechamento,
      slaMedio,
      slaCorridoMedio,
      atrasoMedio,
      pctNoPrazo,
    };
  }, [filtered]);

  // Por tipo de vaga
  const porTipo = useMemo(() => {
    const tipos = ["Estratégica", "Tática", "Operacional"];
    return tipos.map((t) => {
      const arr = filtered.filter((v) => v.tipoVaga === t);
      const fechadas = arr.filter((v) => v.status === "Fechada");
      return {
        tipo: t,
        total: arr.length,
        fechadas: fechadas.length,
        abertas: arr.filter((v) => v.status === "Aberta").length,
        slaMedio: Math.round(avg(fechadas.map((v) => v.diasUteis))),
      };
    });
  }, [filtered]);

  // Por recrutador
  const porRecrutador = useMemo(() => {
    const recs = Array.from(new Set(filtered.map((v) => v.recrutador).filter(Boolean))) as string[];
    return recs
      .map((r) => {
        const arr = filtered.filter((v) => v.recrutador === r);
        const fechadas = arr.filter((v) => v.status === "Fechada");
        return {
          recrutador: r,
          total: arr.length,
          fechadas: fechadas.length,
          abertas: arr.filter((v) => v.status === "Aberta").length,
          taxa: arr.length ? Math.round((fechadas.length / arr.length) * 100) : 0,
          slaMedio: Math.round(avg(fechadas.map((v) => v.diasUteis))),
          atrasoMedio: Math.round(avg(fechadas.map((v) => v.atraso))),
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [filtered]);

  // Por setor
  const porSetor = useMemo(() => {
    const setores = Array.from(new Set(filtered.map((v) => v.setor).filter(Boolean))) as string[];
    return setores
      .map((s) => {
        const arr = filtered.filter((v) => v.setor === s);
        return {
          setor: s,
          total: arr.length,
          fechadas: arr.filter((v) => v.status === "Fechada").length,
          abertas: arr.filter((v) => v.status === "Aberta").length,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [filtered]);

  // Funil por etapa (somente vagas em andamento)
  const funilEtapas = useMemo(() => {
    const ordem = ["Triagem", "Entrevista RH", "Entrevista Gestor", "Contratado", "Pausada", "Cancelada"];
    return ordem
      .map((e) => ({
        etapa: e,
        total: filtered.filter((v) => v.etapa === e).length,
      }))
      .filter((x) => x.total > 0);
  }, [filtered]);

  // Fontes de aprovação
  const fontes = useMemo(() => {
    const map = new Map<string, number>();
    filtered
      .filter((v) => v.status === "Fechada" && v.fonteAprovado)
      .forEach((v) => map.set(v.fonteAprovado!, (map.get(v.fonteAprovado!) ?? 0) + 1));
    return Array.from(map.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filtered]);

  // Volume de candidatos por canal
  const candidatosPorCanal = useMemo(() => {
    return [
      { canal: "LinkedIn", total: sum(filtered.map((v) => v.linkedin)) },
      { canal: "Indeed", total: sum(filtered.map((v) => v.indeed)) },
      { canal: "Catho", total: sum(filtered.map((v) => v.catho)) },
      { canal: "Sólides", total: sum(filtered.map((v) => v.solides)) },
      { canal: "Indicação", total: sum(filtered.map((v) => v.indicacao)) },
      { canal: "Site", total: sum(filtered.map((v) => v.siteEmpresa)) },
      { canal: "PAT", total: sum(filtered.map((v) => v.pat)) },
      { canal: "Outros", total: sum(filtered.map((v) => v.outros)) },
    ].filter((x) => x.total > 0).sort((a, b) => b.total - a.total);
  }, [filtered]);

  const vagasAbertasDetalhe = useMemo(
    () =>
      filtered
        .filter((v) => v.status === "Aberta")
        .sort((a, b) => (b.diasCorridos ?? 0) - (a.diasCorridos ?? 0)),
    [filtered]
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-sidebar text-sidebar-foreground border-b border-white/5">
        <div className="max-w-[1600px] mx-auto px-6 py-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center shadow-elegant">
              <Target className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Dashboard R&S Estratégico
              </h1>
              <p className="text-xs text-sidebar-foreground">
                Visão executiva · Recrutamento e Seleção
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <div>
              <p className="text-xs text-sidebar-foreground">Base atualizada</p>
              <p className="text-white font-medium">
                {new Date().toLocaleDateString("pt-BR")}
              </p>
            </div>
            <div className="h-10 w-px bg-white/10" />
            <div>
              <p className="text-xs text-sidebar-foreground">Vagas analisadas</p>
              <p className="text-white font-medium">{vagas.length}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-6 space-y-6">
        {/* Filtros */}
        <section className="bg-card rounded-xl p-4 border border-border/60 shadow-card">
          <FiltersBar filters={filters} setFilters={setFilters} data={vagas} />
        </section>

        {/* C-LEVEL KPIs */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-1.5 w-8 rounded-full bg-gradient-primary" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Visão C-Level
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <KpiCard
              variant="primary"
              label="Total de Vagas"
              value={kpis.total}
              hint="Demanda no período"
              icon={<Briefcase className="h-5 w-5" />}
            />
            <KpiCard
              variant="success"
              label="Vagas Fechadas"
              value={kpis.fechadas}
              hint={`${kpis.taxaFechamento.toFixed(1)}% de taxa`}
              icon={<CheckCircle2 className="h-5 w-5" />}
            />
            <KpiCard
              label="Vagas Abertas"
              value={kpis.abertas}
              hint="Em andamento"
              icon={<Activity className="h-5 w-5" />}
            />
            <KpiCard
              label="Canceladas"
              value={kpis.canceladas}
              hint="No período"
              icon={<XCircle className="h-5 w-5" />}
            />
            <KpiCard
              variant="accent"
              label="SLA Médio"
              value={`${kpis.slaMedio.toFixed(0)}d`}
              hint="Dias úteis até fechamento"
              icon={<Clock className="h-5 w-5" />}
            />
            <KpiCard
              variant={kpis.pctNoPrazo >= 70 ? "success" : kpis.pctNoPrazo >= 50 ? "warning" : "danger"}
              label="% No Prazo"
              value={`${kpis.pctNoPrazo.toFixed(0)}%`}
              hint={`Atraso médio: ${kpis.atrasoMedio.toFixed(1)}d`}
              icon={<TrendingUp className="h-5 w-5" />}
            />
          </div>
        </section>

        {/* Tipo de vaga + funil */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCard
            title="Vagas por Tipo (Estratégico)"
            subtitle="Volume e SLA médio por classificação"
            className="lg:col-span-2 h-[320px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porTipo} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="tipo" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="abertas" name="Abertas" fill="hsl(38 95% 55%)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="fechadas" name="Fechadas" fill="hsl(217 91% 45%)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="slaMedio" name="SLA médio (dias úteis)" fill="hsl(175 70% 41%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Funil — Etapas Atuais" subtitle="Distribuição por etapa do processo" className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={funilEtapas} margin={{ top: 5, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis dataKey="etapa" type="category" stroke="hsl(var(--muted-foreground))" fontSize={11} width={110} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="total" fill="hsl(217 91% 45%)" radius={[0, 6, 6, 0]}>
                  {funilEtapas.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </section>

        {/* Performance Recrutador */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-1.5 w-8 rounded-full bg-gradient-accent" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Performance por Recrutador
            </h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {porRecrutador.map((r, i) => (
              <div
                key={r.recrutador}
                className="rounded-xl bg-card border border-border/60 shadow-card p-5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-11 w-11 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-elegant"
                      style={{ background: `linear-gradient(135deg, ${PALETTE[i]}, ${PALETTE[(i + 2) % PALETTE.length]})` }}
                    >
                      {r.recrutador.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{r.recrutador}</p>
                      <p className="text-xs text-muted-foreground">{r.total} vagas</p>
                    </div>
                  </div>
                  <Badge
                    variant="secondary"
                    className={
                      r.taxa >= 70
                        ? "bg-success/15 text-success border-0"
                        : r.taxa >= 40
                        ? "bg-warning/15 text-warning border-0"
                        : "bg-destructive/15 text-destructive border-0"
                    }
                  >
                    {r.taxa}% fechamento
                  </Badge>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-2 border-t border-border/60">
                  <div>
                    <p className="text-xs text-muted-foreground">Fechadas</p>
                    <p className="text-xl font-bold text-foreground">{r.fechadas}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">SLA méd.</p>
                    <p className="text-xl font-bold text-foreground">{r.slaMedio || 0}d</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Atraso</p>
                    <p
                      className={
                        "text-xl font-bold " +
                        (r.atrasoMedio <= 0
                          ? "text-success"
                          : r.atrasoMedio <= 5
                          ? "text-warning"
                          : "text-destructive")
                      }
                    >
                      {r.atrasoMedio > 0 ? `+${r.atrasoMedio}` : r.atrasoMedio}d
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Setores + Fontes */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <ChartCard
            title="Vagas por Setor"
            subtitle="Demanda por área de negócio"
            className="lg:col-span-2 h-[360px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porSetor} margin={{ top: 10, right: 10, left: 0, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="setor" stroke="hsl(var(--muted-foreground))" fontSize={11} angle={-30} textAnchor="end" interval={0} height={60} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="fechadas" stackId="a" name="Fechadas" fill="hsl(217 91% 45%)" />
                <Bar dataKey="abertas" stackId="a" name="Abertas" fill="hsl(38 95% 55%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Origem do Aprovado" subtitle="Canais que mais fecham" className="h-[360px]">
            {fontes.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                Sem dados
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={fontes}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    label={(e) => `${e.name} (${e.value})`}
                    labelLine={false}
                    fontSize={11}
                  >
                    {fontes.map((_, i) => (
                      <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </section>

        {/* Canais de Captação + Tomada de Decisão */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard
            title="Volume de Candidatos por Canal"
            subtitle="Total de currículos captados em cada fonte"
            className="h-[340px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={candidatosPorCanal} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis dataKey="canal" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="total" fill="hsl(175 70% 41%)" radius={[6, 6, 0, 0]}>
                  {candidatosPorCanal.map((_, i) => (
                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="rounded-xl bg-card border border-border/60 shadow-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <h3 className="text-sm font-semibold">Insights para Decisão</h3>
            </div>
            <div className="space-y-3">
              {(() => {
                const insights: { tone: "ok" | "warn" | "bad"; text: string }[] = [];
                const melhorRec = porRecrutador[0];
                if (melhorRec)
                  insights.push({
                    tone: "ok",
                    text: `${melhorRec.recrutador} concentra o maior volume (${melhorRec.total} vagas) com ${melhorRec.taxa}% de taxa de fechamento.`,
                  });
                if (kpis.atrasoMedio > 5)
                  insights.push({
                    tone: "bad",
                    text: `Atraso médio de ${kpis.atrasoMedio.toFixed(1)} dias úteis vs. SLA acordado — revisar previsões e gargalos.`,
                  });
                else if (kpis.atrasoMedio > 0)
                  insights.push({
                    tone: "warn",
                    text: `Atraso leve (${kpis.atrasoMedio.toFixed(1)}d) sobre o SLA — monitorar.`,
                  });
                else
                  insights.push({
                    tone: "ok",
                    text: `SLA dentro do previsto (atraso médio ${kpis.atrasoMedio.toFixed(1)}d).`,
                  });

                const topFonte = fontes[0];
                if (topFonte)
                  insights.push({
                    tone: "ok",
                    text: `${topFonte.name} é a fonte que mais converte aprovados (${topFonte.value} contratações).`,
                  });

                const topSetor = porSetor[0];
                if (topSetor)
                  insights.push({
                    tone: "warn",
                    text: `${topSetor.setor} é o setor com maior demanda (${topSetor.total} vagas, ${topSetor.abertas} ainda em aberto).`,
                  });

                if (kpis.canceladas > 0)
                  insights.push({
                    tone: "warn",
                    text: `${kpis.canceladas} vaga(s) cancelada(s) — investigar root cause com gestores.`,
                  });

                return insights.map((i, idx) => (
                  <div
                    key={idx}
                    className={
                      "rounded-lg p-3 text-sm border-l-4 " +
                      (i.tone === "ok"
                        ? "bg-success/5 border-success text-foreground"
                        : i.tone === "warn"
                        ? "bg-warning/5 border-warning text-foreground"
                        : "bg-destructive/5 border-destructive text-foreground")
                    }
                  >
                    {i.text}
                  </div>
                ));
              })()}
            </div>
          </div>
        </section>

        {/* Tabela vagas abertas */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <div className="h-1.5 w-8 rounded-full bg-gradient-warning" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Vagas em Aberto — Aging
            </h2>
          </div>
          <div className="rounded-xl bg-card border border-border/60 shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead>Cargo</TableHead>
                    <TableHead>Setor</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Recrutador</TableHead>
                    <TableHead>Etapa</TableHead>
                    <TableHead>Aberta em</TableHead>
                    <TableHead className="text-right">Dias</TableHead>
                    <TableHead className="text-right">SLA</TableHead>
                    <TableHead className="text-right">Atraso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vagasAbertasDetalhe.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-muted-foreground py-8">
                        Nenhuma vaga em aberto com os filtros atuais.
                      </TableCell>
                    </TableRow>
                  ) : (
                    vagasAbertasDetalhe.map((v, i) => {
                      const atraso = v.atraso ?? 0;
                      return (
                        <TableRow key={i}>
                          <TableCell className="font-medium">{v.cargo ?? "—"}</TableCell>
                          <TableCell>{v.setor ?? "—"}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-normal">
                              {v.tipoVaga}
                            </Badge>
                          </TableCell>
                          <TableCell>{v.recrutador ?? "—"}</TableCell>
                          <TableCell className="text-xs">{v.etapa ?? "—"}</TableCell>
                          <TableCell className="text-xs">{formatDate(v.dataAbertura)}</TableCell>
                          <TableCell className="text-right tabular-nums">{v.diasCorridos ?? "—"}</TableCell>
                          <TableCell className="text-right tabular-nums">{v.sla ?? "—"}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            <span
                              className={
                                "font-semibold " +
                                (atraso <= 0
                                  ? "text-success"
                                  : atraso <= 5
                                  ? "text-warning"
                                  : "text-destructive")
                              }
                            >
                              {atraso > 0 ? `+${atraso}` : atraso}d
                            </span>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </section>

        <footer className="text-center text-xs text-muted-foreground py-4">
          Dashboard R&S · Dados extraídos de Controle_Recrutamento_GT.xlsx
        </footer>
      </main>
    </div>
  );
};

export default Index;
