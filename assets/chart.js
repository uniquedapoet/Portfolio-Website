// chart.js
(function(vegaEmbed) {
    var spec = {
      "config": {"view": {"continuousWidth": 300, "continuousHeight": 300}},
      "data": {"name": "data-e6b170a823e007b48871f3ef77f0f746"},
      "mark": {"type": "circle", "size": 100},
      "encoding": {
        "color": {"field": "weighted_score", "scale": {"scheme": "viridis"}, "title": "Weighted Score", "type": "quantitative"},
        "tooltip": [
          {"field": "team", "type": "nominal"},
          {"field": "score", "type": "quantitative"},
          {"field": "yards_per_game", "type": "quantitative"},
          {"field": "weighted_score", "type": "quantitative"}
        ],
        "x": {"field": "score", "title": "Score", "type": "quantitative"},
        "y": {"field": "yards_per_game", "title": "Yards per Game", "type": "quantitative"}
      },
      "height": 400,
      "params": [{"name": "param_8", "select": {"type": "interval", "encodings": ["x", "y"]}, "bind": "scales"}],
      "title": "NFL Teams: Score vs Yards per Game",
      "width": 700,
      "$schema": "https://vega.github.io/schema/vega-lite/v5.8.0.json",
      "datasets": {
        "data-e6b170a823e007b48871f3ef77f0f746": [
          {"team": "49ers", "score": 28.55, "first_downs": 22.4, "possession": 1888.95, "yards_per_game": 267.64, "weighted_score": 90.56148026615622},
          {"team": "Bears", "score": 21.18, "first_downs": 18.94, "possession": 1917.76, "yards_per_game": 354.11, "weighted_score": 96.35823114083983},
          {"team": "Bengals", "score": 21.53, "first_downs": 19.35, "possession": 1856.59, "yards_per_game": 324.08, "weighted_score": 92.186042924353},
          {"team": "Bills", "score": 26.63, "first_downs": 22.74, "possession": 1941.74, "yards_per_game": 288.74, "weighted_score": 93.64618609901629},
          {"team": "Broncos", "score": 21.0, "first_downs": 17.71, "possession": 1770.82, "yards_per_game": 293.44, "weighted_score": 86.8415332730345},
          {"team": "Browns", "score": 22.78, "first_downs": 19.06, "possession": 1949.06, "yards_per_game": 334.41, "weighted_score": 96.30704725044346},
          {"team": "Buccaneers", "score": 21.21, "first_downs": 18.21, "possession": 1775.47, "yards_per_game": 307.59, "weighted_score": 88.06118227775323},
          {"team": "Cardinals", "score": 19.41, "first_downs": 19.41, "possession": 1757.59, "yards_per_game": 366.72, "weighted_score": 91.41197422575601},
          {"team": "Chargers", "score": 20.35, "first_downs": 18.76, "possession": 1736.65, "yards_per_game": 350.19, "weighted_score": 89.60511277984617},
          {"team": "Chiefs", "score": 22.19, "first_downs": 21.05, "possession": 1854.33, "yards_per_game": 333.88, "weighted_score": 93.00568631987828},
          {"team": "Colts", "score": 23.29, "first_downs": 19.06, "possession": 1768.18, "yards_per_game": 317.06, "weighted_score": 88.82087741808824},
          {"team": "Commanders", "score": 19.35, "first_downs": 18.88, "possession": 1778.12, "yards_per_game": 336.81, "weighted_score": 89.98899195781885},
          {"team": "Cowboys", "score": 30.06, "first_downs": 23.44, "possession": 1905.44, "yards_per_game": 317.61, "weighted_score": 94.92788680647581},
          {"team": "Dolphins", "score": 27.94, "first_downs": 20.72, "possession": 1796.11, "yards_per_game": 357.89, "weighted_score": 93.43128387426994},
          {"team": "Eagles", "score": 24.56, "first_downs": 21.67, "possession": 1850.5, "yards_per_game": 304.51, "weighted_score": 91.18795706162399},
          {"team": "Falcons", "score": 18.88, "first_downs": 19.18, "possession": 1749.12, "yards_per_game": 383.73, "weighted_score": 92.2172440630193},
          {"team": "Giants", "score": 15.65, "first_downs": 15.71, "possession": 1773.18, "yards_per_game": 349.88, "weighted_score": 89.9910954053694},
          {"team": "Jaguars", "score": 22.18, "first_downs": 19.76, "possession": 1854.88, "yards_per_game": 349.69, "weighted_score": 94.04163423851692},
          {"team": "Jets", "score": 15.76, "first_downs": 15.29, "possession": 1749.41, "yards_per_game": 312.38, "weighted_score": 86.51444717892626},
          {"team": "Lions", "score": 27.35, "first_downs": 22.6, "possession": 1868.7, "yards_per_game": 414.58, "weighted_score": 100.0},
          {"team": "Packers", "score": 23.79, "first_downs": 20.0, "possession": 1782.37, "yards_per_game": 328.13, "weighted_score": 90.23053785153867},
          {"team": "Panthers", "score": 13.88, "first_downs": 17.47, "possession": 1866.65, "yards_per_game": 350.21, "weighted_score": 93.16624948290246},
          {"team": "Patriots", "score": 13.88, "first_downs": 15.35, "possession": 1682.76, "yards_per_game": 319.88, "weighted_score": 84.44430421460774},
          {"team": "Raiders", "score": 19.53, "first_downs": 17.18, "possession": 1714.06, "yards_per_game": 366.76, "weighted_score": 89.74919893705784},
          {"team": "Rams", "score": 23.72, "first_downs": 20.72, "possession": 1845.67, "yards_per_game": 332.7, "weighted_score": 92.81076684686201},
          {"team": "Ravens", "score": 27.74, "first_downs": 20.89, "possession": 1865.42, "yards_per_game": 365.34, "weighted_score": 96.36734608022549},
          {"team": "Saints", "score": 23.65, "first_downs": 19.82, "possession": 1870.24, "yards_per_game": 332.91, "weighted_score": 93.61393323657475},
          {"team": "Seahawks", "score": 21.41, "first_downs": 18.65, "possession": 1614.18, "yards_per_game": 387.18, "weighted_score": 88.04610757030773},
          {"team": "Steelers", "score": 17.83, "first_downs": 17.17, "possession": 1768.67, "yards_per_game": 372.36, "weighted_score": 91.81723845382582},
          {"team": "Texans", "score": 22.74, "first_downs": 18.58, "possession": 1746.16, "yards_per_game": 402.78, "weighted_score": 93.94838139710987},
          {"team": "Titans", "score": 17.94, "first_downs": 17.53, "possession": 1792.12, "yards_per_game": 369.28, "weighted_score": 92.46404857561544},
          {"team": "Vikings", "score": 20.24, "first_downs": 20.0, "possession": 1755.76, "yards_per_game": 388.42, "weighted_score": 93.02707136997539}
        ]
      }
    };
    var embedOpt = {"mode": "vega-lite"};
  
    function showError(el, error){
        el.innerHTML = ('<div style="color:red;">'
                        + '<p>JavaScript Error: ' + error.message + '</p>'
                        + "<p>This usually means there's a typo in your chart specification. "
                        + "See the javascript console for the full traceback.</p>"
                        + '</div>');
        throw error;
    }
    const el = document.getElementById('vis');
    vegaEmbed("#vis", spec, embedOpt)
      .catch(error => showError(el, error));
  })(vegaEmbed);