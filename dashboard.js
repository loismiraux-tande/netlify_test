// Dashboard logic. API_KEY is defined in app.js, which is loaded first.

// Source Flourish visualisation: stacked columns of EU cell demand by sourcing,
// faceted by target year, with EU supply capacity drawn as y-axis highlight lines.
const CHART = { id: "29782294", container: "#chart-0", visual: null, options: null };

const DATA_FILE = "Data.1786972610194.csv";

// Value columns stacked in the chart, in stacking order.
const VALUE_COLUMNS = ["EU cell demand", "Undetermined relocation (EU or FTA)", "Non-EU"];

// Cumulative EU production capacity (GWh/yr) by project confidence tier, from the
// ramp-up model. Mirrors the axis highlight lines defined in the visualisation.
const SUPPLY = {
    "2027": { high: 258, medium: 311 },
    "2030": { high: 397, medium: 571, low: 642 }
};

const STRICT_SCENARIO = "IAA, strict EU scope for private";

// The CSV carries trailing empty columns; drop those and blank rows.
const data_promise = d3.csv(DATA_FILE, row => {
    const clean = {};
    for (const key in row) {
        const k = key.trim();
        if (!k) continue;
        clean[k] = row[key] ? row[key].trim() : "";
    }
    return clean.Year ? clean : null;
});

const chart_promise = d3.json(
    `https://public.flourish.studio/visualisation/${CHART.id}/visualisation-object.json`
);

function hideLoader() {
    const loader = document.getElementById("loader-wrapper");
    if (!loader) return;
    loader.classList.add("fade-out");
    setTimeout(() => { loader.style.display = "none"; }, 600);
}

function num(value) {
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : 0;
}

function totalDemand(rows, year) {
    const row = rows.find(d => d.Year === year);
    if (!row) return 0;
    return VALUE_COLUMNS.reduce((sum, col) => sum + num(row[col]), 0);
}

function euScopeDemand(rows, year, scenario) {
    const row = rows.find(d => d.Year === year && d.Scenario === scenario);
    return row ? num(row["EU cell demand"]) : 0;
}

// Headline figures are derived from the CSV so the dashboard stays in step with the data.
function buildKpis(rows) {
    const years = Array.from(new Set(rows.map(d => d.Year))).sort();
    const cards = [];

    years.forEach(year => {
        const demand = euScopeDemand(rows, year, STRICT_SCENARIO);
        const supply = SUPPLY[year] || {};
        const gap = demand - num(supply.high);
        const coveredByMedium = supply.medium && demand <= supply.medium;

        cards.push({
            label: `${year} · strict EU scope`,
            value: `${gap > 0 ? "−" : "+"}${Math.abs(Math.round(gap))}`,
            unit: "GWh/yr",
            note: gap > 0
                ? `shortfall vs. high-confidence capacity (${supply.high} GWh/yr)` +
                  (coveredByMedium ? "; closed only if medium-confidence projects deliver" : "")
                : `headroom vs. high-confidence capacity (${supply.high} GWh/yr)`,
            tone: gap > 0 ? (coveredByMedium ? "warn" : "bad") : "good"
        });
    });

    years.forEach(year => {
        cards.push({
            label: `${year} · total cell demand`,
            value: Math.round(totalDemand(rows, year)).toString(),
            unit: "GWh/yr",
            note: "identical across all three IAA design options",
            tone: "neutral"
        });
    });

    const card = d3.select("#kpi-row").selectAll("div.kpi").data(cards).join("div")
        .attr("class", d => `kpi kpi--${d.tone} box`);

    card.append("div").attr("class", "kpi__label").text(d => d.label);
    card.append("div").attr("class", "kpi__value")
        .html(d => `${d.value}<span class="kpi__unit">${d.unit}</span>`);
    card.append("div").attr("class", "kpi__note").text(d => d.note);
}

function buildChart(base, rows) {
    CHART.options = base;
    CHART.options.api_key = API_KEY;
    CHART.options.container = CHART.container;
    CHART.options.data = { data: rows };

    // Let the dashboard layout own the surrounding chrome; the chart keeps its own
    // titles and axis highlights from the published visualisation.
    CHART.options.state = CHART.options.state || {};
    CHART.options.state.layout = Object.assign({}, CHART.options.state.layout, {
        background_color_enabled: false,
        footer_logo_enabled: false,
        margin_left: 0,
        margin_right: 0,
        margin_top: 0,
        margin_bottom: 0
    });

    try {
        CHART.visual = new Flourish.Live(CHART.options);
    } catch (e) {
        console.error("Failed to build the chart", e);
    }
}

Promise.all([data_promise, chart_promise])
    .then(([rows, base]) => {
        buildChart(base, rows);
        buildKpis(rows);
        setTimeout(hideLoader, 1200);
    })
    .catch(err => {
        console.error("Failed to load dashboard data", err);
        hideLoader();
    });
