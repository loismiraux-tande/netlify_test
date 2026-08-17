const API_KEY = "QjDqiYcwNRvCwZLiIDj50O-fvzAyGcadaOG091tD52t0hul3TA1b5ZXLKoNCe2NI";
const charts = [
    { id: "28311711", container: "#chart-0", visual: null, options: null },
    { id: "28311773", container: "#chart-1", visual: null, options: null },
    { id: "28332762", container: "#chart-2", visual: null, options: null },
    { id: "28363053", container: "#chart-3", visual: null, options: null },

];

let raw_line_data = [];
let raw_waterfall_data = [];
let raw_table_data = [];
let raw_table2_data = [];




const line_csv_promise = d3.csv("data_line.csv", d => {
    const clean = {};
    for (let key in d) clean[key.trim()] = d[key] ? d[key].trim() : "";
    clean.Petrol = +clean.Petrol || 0;
    clean.Diesel = +clean.Diesel || 0;
    return clean;
});

const waterfall_csv_promise = d3.csv("data_waterfall.csv", d => {
    const clean = {};
    for (let key in d) clean[key.trim()] = d[key] ? d[key].trim() : "";
    clean.Value = clean.Value === "" ? "" : parseFloat(clean.Value);
    return clean;
});

const table_csv_promise = d3.dsv("\t", "data_table.tsv", d => {
    const clean = {};
    for (let key in d) {
        const cleanKey = key.trim();
        let value = d[key] ? d[key].trim() : "";
        clean[cleanKey] = value;
    }
    return clean;
});
const table_2_csv_promise = d3.dsv("\t", "data_table_refineries.tsv", d => {
    const clean = {};
    for (let key in d) {
        const cleanKey2 = key.trim();
        let value = d[key] ? d[key].trim() : ""
        clean[cleanKey2] = value;
    }
    return clean;
});

const chart_promises = charts.map(c => d3.json(`https://public.flourish.studio/visualisation/${c.id}/visualisation-object.json`));

function filterByCountry(selectedCountry) {
    if (!selectedCountry || !raw_table_data[0]) return;
    if (!selectedCountry || !raw_table2_data[0]) return;

    const searchCountry = selectedCountry.trim();

    const colNames = Object.keys(raw_table_data[0]);
    const countryKey = colNames.find(k => k.toLowerCase().trim() === "country") || "Country";



    const filteredTable = raw_table_data.filter(d => (d[countryKey] || "").trim() === searchCountry);


    const colNames2 = Object.keys(raw_table2_data[0]);

    const countryKey2 = colNames2.find(k => k.toLowerCase().trim() === "country") || "Country";
    const filteredTable2 = raw_table2_data.filter(d => (d[countryKey2] || "").trim() === searchCountry);

    const filteredLine = raw_line_data.filter(d => (d.Country || "").trim() === searchCountry);
    const filteredWaterfall = raw_waterfall_data.filter(d => {
        const country = (d.Country || d.country || "").trim();
        const label = (d.Label || d.label || "").trim().toLowerCase();
        return country === searchCountry || label === "label";
    });

    if (charts[0] && charts[0].visual) {
        charts[0].options.data = { data: filteredLine };
        charts[0].visual.update(charts[0].options);
    }

    if (charts[1] && charts[1].visual) {
        charts[1].options.data = { data: filteredWaterfall };
        charts[1].options.state.waterfall_total_mode = "absolute";
        charts[1].visual.update(charts[1].options);
    }

    if (charts[2] && charts[2].visual) {
        const tableDataForDisplay = filteredTable.map(row => {
            const { Country, country, ...rest } = row;
            return rest;
        });

        const displayColumns = Object.keys(tableDataForDisplay[0] || {});

        charts[2].visual.update({
            data: {
                rows: tableDataForDisplay
            },
            bindings: {
                rows: { columns: displayColumns }
            },
            state: {

                "header_font_size": 0,

                "layout": {
                    "background_color_enabled": false,
                    "footer_logo_enabled": false,
                    "footer_logo_height": 0,
                    "footer_logo_src": "",
                    "header_align": "center",
                    "header_logo_align": "outside",
                    "header_logo_enabled": false,
                    "header_logo_height": 0,
                    "header_logo_margin_left": 1,
                    "header_logo_margin_top": 0,
                    "margin_bottom": 0,
                    "margin_left": 0,
                    "margin_right": 0,
                    "margin_top": 0,
                    "max_width": 450,

                    "header_logo_position_inside": "top",
                    "header_logo_src": "",
                    "title": "<div class=\"title_header\"><h3>Upstream excess profits: crude oil production</h3>\n</div>\n<style>\n.title_header h3 {\npadding:15px;\n  color: #FF8754; \n  background-color: #FF875420;\n    border-radius: 10px;\n    font-size: 0.8em;\nfont-weight:700;\nline-height:1;\n}\n</style>\n",
                    "title_line_height": 0,
                    "title_size": "custom",
                    "title_size_custom": 1.5,
                    "title_space_above": "custom",
                    "title_space_above_custom": 0,
                    "title_styling": true,
                    "title_weight": "normal",
                },
                "markdown_enabled": false,

                "mobile": {
                    "cell_font_size": "custom",
                    "pagination_amount": 4,
                    "view": false,
                },
            }
        });

    }
    if (charts[3] && charts[3].visual) {
        const tableDataForDisplay2 = filteredTable2.map(row => {
            const { Country, country, ...rest } = row;
            return rest;
        });

        const displayColumns2 = Object.keys(tableDataForDisplay2[0] || {});

        charts[3].visual.update({
            data: {
                rows: tableDataForDisplay2
            },
            bindings: {
                rows: { columns: displayColumns2 }
            },
            state: {

                "header_font_size": 0,

                "layout": {
                    "background_color_enabled": false,
                    "footer_logo_enabled": false,
                    "footer_logo_height": 0,
                    "footer_logo_src": "",
                    "header_align": "center",
                    "header_logo_align": "outside",
                    "header_logo_enabled": false,
                    "header_logo_height": 0,
                    "header_logo_margin_left": 1,
                    "header_logo_margin_top": 0,
                    "margin_bottom": 0,
                    "margin_left": 0,
                    "margin_right": 0,
                    "margin_top": 0,
                    "max_width": 450,

                    "header_logo_position_inside": "top",
                    "header_logo_src": "",
                    "title": "<div class=\"title_header\"><h3>Downstream excess profits: refiners and distributors</h3>\n</div>\n<style>\n.title_header h3 {\npadding:15px;\n color: #C2447A;\n   background-color: #C2447A20;\n    border-radius: 10px;\n    font-size: 0.8em;\nfont-weight:700;\nline-height:1;\n}\n</style>\n",
                    "title_line_height": 0,
                    "title_size": "custom",
                    "title_size_custom": 1.5,
                    "title_space_above": "custom",
                    "title_space_above_custom": 0,
                    "title_styling": true,
                    "title_weight": "normal",
                },
                "markdown_enabled": false,

                "mobile": {
                    "cell_font_size": "custom",
                    "pagination_amount": 4,
                    "view": false,
                },
            }
        });

    }
}
function hideLoader() {
    const loader = document.getElementById('loader-wrapper');
    if (!loader) return;

    loader.classList.add('fade-out');
    setTimeout(() => {
        loader.style.display = 'none';
    }, 600); 
}

function buildCharts(base_charts) {
    base_charts.forEach((base, i) => {
        
        const chart = charts[i];
        chart.options = base;
        chart.options.api_key = API_KEY;
        chart.options.container = chart.container;

        if (i === 0) chart.options.data = { data: raw_line_data };
        if (i === 1) {
            chart.options.data = { data: raw_waterfall_data };
            chart.options.state = chart.options.state || {};
            chart.options.state.chart_type = "column_waterfall";
            chart.options.state.waterfall_total_column = "Label";
            chart.options.state.waterfall_total_value = "X";
            chart.options.state.waterfall_total_mode = "absolute";
            chart.options.state.waterfall_show_total = true;
        }

        if (i === 2) {
            chart.options.data = { rows: raw_table_data };
            chart.options.state = chart.options.state || {};

        }
        if (i === 3) {
            chart.options.data = { rows: raw_table2_data };
            chart.options.state = chart.options.state || {};

        }

        try {
            chart.visual = new Flourish.Live(chart.options);
        } catch (e) {
            console.error("Error en gráfico " + i, e);
        }
    });
    setTimeout(() => {
        hideLoader();
    }, 1200);
}

function buildCountryDropdown(data) {
    const uniqueCountries = Array.from(new Set(data.map(d => (d.Country || d.Country || "").trim()))).filter(Boolean);

    const parent = d3.select("#controls").append("div").attr("class", "country-control");

    const select = parent.append("select");
    select.selectAll("option").data(uniqueCountries).join("option").attr("value", d => d).html(d => d);

    select.on("change", function () { filterByCountry(this.value); });

    return uniqueCountries[0];
}

function main(lineData, waterfallData, tableData, tableData2, base_charts) {
    raw_line_data = lineData;
    raw_waterfall_data = waterfallData;
    raw_table_data = tableData;
    raw_table2_data = tableData2;

    buildCharts(base_charts);
    const firstCountry = buildCountryDropdown(waterfallData);

    setTimeout(() => {
        filterByCountry(firstCountry);
    }, 400);
}

Promise.all([line_csv_promise, waterfall_csv_promise, table_csv_promise, table_2_csv_promise, ...chart_promises])
    .then(res => {
        main(res[0], res[1], res[2], res[3], res.slice(4));
    })
