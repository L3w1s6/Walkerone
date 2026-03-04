import {Doughnut, Line} from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    RadialLinearScale,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels'

//required to explicitly register used components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    RadialLinearScale,
);

//function to create heartrate colour gradient
function getGrad(context) {
    let {ctx, chartArea} = context.chart
    let grad = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    grad.addColorStop(0, "#ffaa00")//safe
    grad.addColorStop(1, "#ff0000")//elevated
    return grad
}

export default function Stats() {
    //Heartrate chart
    //manual data & labels for now
    const heartLabels = [1,2,3,4,5,6,7,8,9,10]
    const heartData = [
        {x: 1, y: 100},
        {x: 2, y: 120},
        {x: 3, y: 80},
        {x: 4, y: 180},
        {x: 5, y: 160},
        {x: 6, y: 120},
        {x: 7, y: 60},
        {x: 8, y: 70},
    ]
    const heartDatasets = {
        labels: heartLabels,
        datasets: [
            {
                label: "BPM",
                data: heartData,
                borderWidth: 1,
                borderColor: function(context) {
                    if (!context.chart.chartArea) {//initial load
                        return
                    }
                    return getGrad(context)
                },
                tension: 0.4
            }
        ],
    }
    const heartOps = {
        scales: {//axis
            x: {
                title: {
                    display: true,
                    text: "Time"
                }
            },
            y: {
                suggestedMin: 60,
                suggestedMax: 180,
                title: {
                    display: true,
                    text: "BPM"
                }
            }
        },
        plugins: {
            legend: {//key
                display: false
            },
            title: {
                display: true,
                text: "Heartrate",
                font: {
                    weight: "bold",
                    size: 15
                }
            }
        },
        interaction: {//hover tooltip behaviour
            intersect: false,
            mode: "nearest",
            axis: "x"
        }
    }

    //Steps chart
    const stepData = [7500,2500]
    const stepDatasets = {
        labels: ["Done","Remaining"],
        datasets: [
            {
                label: "Steps",
                data: stepData,
                backgroundColor: ["#00aaff", "#eeeeee"]
            }
        ]
    }
    const stepOps = {
        plugins: {
            legend: {
                display: true,
                title: {
                    display: true,
                    text: "Steps",
                    font: {
                        weight: "bold",
                        size: 15
                    }
                }
            },
            datalabels: {
                color: "#000000",
                font: {
                    size: 12
                },
                formatter: (v, ctx) => {
                    return v
                }
            }
        }
    }

    //Calories chart
    const calData = [1500,1500]
    const calDatasets = {
        labels: ["Burned","Remaining"],
        datasets: [
            {
                label: "Calories",
                data: calData,
                backgroundColor: ["#00ffaa", "#eeeeee"]
            }
        ]
    }
    const calOps = {
        plugins: {
            legend: {
                display: true,
                title: {
                    display: true,
                    text: "Calories",
                    font: {
                        weight: "bold",
                        size: 15
                    }
                }
            },
            datalabels: {
                color: "#000000",
                font: {
                    size: 12
                },
                formatter: (v, ctx) => {
                    return v + " kcal"
                }
            }
        }
    }

    return(
        <div className="flex flex-col justify-around w-full h-full">
            <div className="flex w-full"> {/* Heartrate line graph */}
                <Line data={heartDatasets} options={heartOps} />
            </div>

            <div className="flex flex-row justify-between w-full">
                <div className="flex flex-col w-full"> {/* Steps pie? */}
                    <Doughnut data={stepDatasets} options={stepOps} plugins={[ChartDataLabels]} />
                </div>

                <div className="flex flex-col w-full"> {/* Calories pie? */}
                    <Doughnut data={calDatasets} options={calOps} plugins={[ChartDataLabels]} />
                </div>
            </div>

            <div className="flex w-full">
                history button
            </div>
        </div>
    )
}