import {Line} from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';

//required to explicitly register used components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
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
                label: "Heartrate",
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
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Time (mins)"
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
            legend: {
                position: "top"
            }
        }
    }

    //Steps chart

    //Calories chart

    return(
        <div className="flex flex-col w-full h-full p-2 justify-between">
            <div className="flex w-full"> {/* Heartrate line graph */}
                <Line data={heartDatasets} options={heartOps} />
            </div>

            <div className="flex flex-row justify-between">
                <div className="flex"> {/* Steps pie? */}
                    steps
                </div>

                <div className="flex"> {/* Calories pie? */}
                    calories
                </div>
            </div>

            <div className="flex w-full">
                history button
            </div>
        </div>
    )
}