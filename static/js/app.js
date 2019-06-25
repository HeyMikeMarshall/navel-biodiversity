function buildMetadata(sample) {

  d3.select("#sample-metadata").html("");
  d3.json(`/metadata/${sample}`).then(function(response){
    for (let [key, value] of Object.entries(response)) {
      d3.select("#sample-metadata")
      .append("p")
      .html(`<b>${key}:</b>  ${value}`);
      }
    })
  };

function buildCharts(sample) {
  // Use `d3.json` to fetch the sample data for the plots
  d3.json(`/samples/${sample}`).then(function(data){
    var dataset = Object.entries(data);
    var otu_ids = dataset[0][1];
    var otu_labels = dataset[1][1];
    var sample_values = dataset[2][1];

    // Pie Chart
    var pietrace1 = {
      labels: otu_ids.slice(0,9),
      values: sample_values.slice(0,9),
      hover: otu_labels.slice(0,9),
      type: 'pie'
    };
    var piedata = [pietrace1];
    Plotly.newPlot("pie", piedata);

    // Bubble Chart
    var bubbletrace1 = {
      x: otu_ids,
      y: sample_values,
      mode: "markers",
      type: "scatter",
      text: otu_labels,
      marker: {
        size: sample_values,
        color: otu_ids
      }
    };
    var bubbledata = [bubbletrace1];
    Plotly.newPlot("bubble", bubbledata);
  });
    
  // BONUS: Build the Gauge Chart
    d3.json(`/metadata/${sample}`).then(function(data){
      var dataset = Object.entries(data);
      var wfreq = dataset[5][1];
      // gauge level must be value between 0 and 180.
      var level = (18 * wfreq);
      // Trig to calc meter point
      var degrees = 180 - level,
          radius = .5;
      var radians = degrees * Math.PI / 180;
      var x = radius * Math.cos(radians);
      var y = radius * Math.sin(radians);
      // Path: may have to change to create a better triangle
      var mainPath = 'M -.0 -0.025 L .0 0.025 L ',
          pathX = String(x),
          space = ' ',
          pathY = String(y),
          pathEnd = ' Z';
      var path = mainPath.concat(pathX,space,pathY,pathEnd);

      var data = [{ type: 'scatter',
        x: [0], y:[0],
          marker: {size: 28, color:'850000'},
          showlegend: false,
          name: 'Scrubs',
          text: wfreq,
          hoverinfo: 'text+name'},
        { values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
        rotation: 90,
        text: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1'],
        textinfo: 'text',
        textposition:'inside',
        // gauge colors were calculated taking the darkest and lightest greens and incrimenting the RGB
        // values by 1/8 of the difference between the two extremes. One additional value used to "whiteout"
        // the 50% of the pie that will not be used for the gauge.
        marker: {colors:['rgba(14, 127, 0, .5)', 'rgba(43, 142, 27, .5)', 'rgba(70, 154, 52, .5)',
                          'rgba(97, 166, 77, .5)', 'rgba(124, 178, 102, .5)', 'rgba(151, 190, 127, .5)',
                          'rgba(178, 202, 152, .5)', 'rgba(205, 214, 177, .5)', 'rgba(232, 226, 202, .5)',
                              'rgba(255, 255, 255, 0)']},
        labels: ['8-9', '7-8', '6-7', '5-6', '4-5', '3-4', '2-3', '1-2', '0-1'],
        hoverinfo: 'label',
        hole: .5,
        type: 'pie',
        showlegend: false
      }];
      var layout = {
        shapes:[{
            type: 'path',
            path: path,
            fillcolor: '850000',
            line: {
              color: '850000'
            }
          }],
        title: '<b>Belly Button Washing Frequency</b> <br> Scrubs per Week',
        height: 600,
        width: 600,
        xaxis: {zeroline:false, showticklabels:false,
                  showgrid: false, range: [-1, 1]},
        yaxis: {zeroline:false, showticklabels:false,
                  showgrid: false, range: [-1, 1]}
      };
      Plotly.newPlot('gauge', data, layout);     
    });
};

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");
  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });
    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}
function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}
// Initialize the dashboard
init();
