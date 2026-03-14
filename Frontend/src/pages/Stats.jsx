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
import ChartDataLabels from 'chartjs-plugin-datalabels';
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

import {HiRewind, HiFastForward} from 'react-icons/hi';
import {useState, useEffect} from 'react';

//function to create heartrate colour gradient
function getGrad(context) {
    let {ctx, chartArea} = context.chart
    let grad = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    grad.addColorStop(0, "#ffaa00")//safe
    grad.addColorStop(1, "#ff0000")//elevated
    return grad
}

const DateBtn = ({icon: Icon, click}) => {
    return (
        <button className="w-20 rounded-lg flex flex-col items-center text-gray-600 cursor-pointer transition hover:scale-115" onClick={click}>
            <Icon className="w-12 h-12 text-green-300"/>
        </button>
    )
};

//helper funs for converting dates to strings
function dateFormatted(date) {return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear() % 100}`;}

function dateRangeStr(range) {return dateFormatted(range.start) + " - " + dateFormatted(range.end);}

//date range
var weekRange = {
    start: Date,
    end: Date
}
//init range to current week
const today = new Date();
weekRange.start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (today.getDay() - 1) - 1)
weekRange.end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (7 - (today.getDay() - 1)) - 1)

export default function Stats() {
    const email = localStorage.getItem("userEmail");

    const [weekStr, setWeekStr] = useState(dateRangeStr(weekRange));//display date range
    const [heartData, setHeartData] = useState([
        {x: 1, y: 100},
        {x: 2, y: 120},
        {x: 3, y: 80},
        {x: 4, y: 180},
        {x: 5, y: 160},
        {x: 6, y: 120},
        {x: 7, y: 60},
        {x: 8, y: 70},
    ]);//heartrate data (points)
    const [stepData, setStepData] = useState([7500, 2500]);//steps data (taken, remaining)
    const [calData, setCalData] = useState([1500, 1500]);//calories data (burned, remaining)

    //Heartrate chart
    //manual data & labels for now
    const heartLabels = [1,2,3,4,5,6,7,8,9,10]
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
                    size: 18
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
                        size: 18
                    }
                }
            },
            datalabels: {
                color: "#000000",
                font: {
                    size: 15
                },
                formatter: (v, ctx) => {
                    return v
                }
            }
        }
    }

    //Calories chart
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
                        size: 18
                    }
                }
            },
            datalabels: {
                color: "#000000",
                font: {
                    size: 15
                },
                formatter: (v, ctx) => {
                    return v + " kcal"
                }
            }
        }
    }

    //onClick fun to move date range
    const dateShift = async(diff) => {
        weekRange.start.setDate(weekRange.start.getDate() + diff);
        weekRange.end.setDate(weekRange.end.getDate() + diff);
        setWeekStr(dateRangeStr(weekRange));
        getPeriodData();
        console.log(weekRange);
    }

    //Get routes within date range & convert to charts
    const getPeriodData = async() => {
        try {
            const response = await fetch(`/getRoutesPeriod?email=${email}&offset=${7}`);
            if (!response.ok) {
                console.log("not found");
                return;
            }
            console.log(response);

            const data = await response.json();//always empty for some reason
            console.log("Data: ", data);
        } catch (e) {
            console.error("Period fetch error: ", e);
        }
    }

    return (
        <div className="flex flex-col w-full h-full justify-around gap-4 p-2">
            <div className="flex flex-col w-full gap-2 text-center mt-2"> {/* Title */}
                <h1 className="text-4xl font-black text-green-700">Stats</h1>
                <p className="text-gray-600 font-medium">View your walking stats!</p>
            </div>

            <div className="flex w-full justify-center"> {/* Heartrate line graph */}
                <Line data={heartDatasets} options={heartOps} />
            </div>

            <div className="flex w-full justify-center"> {/* Steps pie */}
                <Doughnut data={stepDatasets} options={stepOps} plugins={[ChartDataLabels]} />
            </div>

            <div className="flex w-full justify-center"> {/* Calories pie */}
                <Doughnut data={calDatasets} options={calOps} plugins={[ChartDataLabels]} />
            </div>

            <div className="flex justify-between items-center w-full pb-2"> {/* Date Incrementer */}
                <DateBtn icon={HiRewind} click={() => dateShift(-7)}/>
                <p className="text-2xl font-bold text-gray-600">{weekStr}</p>
                <DateBtn icon={HiFastForward} click={() => dateShift(7)}/>
            </div>
        </div>
    )
}