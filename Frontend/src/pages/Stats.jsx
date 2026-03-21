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

//custom element for date change buttons
const DateBtn = ({icon: Icon, click, label}) => {
    return (
        <button className="w-20 rounded-lg flex flex-col items-center text-gray-600 clickHover-1.25" aria-label={label} onClick={click}>
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

//turn string into hash
function genHashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const c = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + c;
        hash |= 0;//convert to 32-bit int
    }
    return hash;
}

//Mulberry32 PRNG algorithm: takes seed & returns function that generates float between 0 & 1
function mulberry32(seed) {
    return function() {
        var t = (seed += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

//generate heartrate data using pseudo-random algorithm
function genHR(str1, str2, noPoints) {
    const seed = genHashString(str1 + str2);
    const rand = mulberry32(seed);//instead of using Math.random() because not pseudo-random

    const data = []
    const maxBPM = 180;
    const minBPM = 60;
    var curBPM = 60;

    const volt = 50;//how volatile data is

    for (let i = 0; i < noPoints; i++) {
        const change = Math.floor(rand() * (volt * 2 - 1)) - volt;
        curBPM = Math.max(minBPM, Math.min(maxBPM, curBPM + change));
        data.push({x: i, y: curBPM});
    }
    return data;
}

export default function Stats() {
    const email = localStorage.getItem("userEmail");

    const [weekStr, setWeekStr] = useState(dateRangeStr(weekRange));//display date range
    const [heartLabels, setHeartLabels] = useState([0,1]);//heartrate x axis labels
    const [heartData, setHeartData] = useState([{x: 0, y: 60},{x: 1, y: 180}]);//heartrate data (points)
    const [stepData, setStepData] = useState([0, 1]);//steps data (taken, remaining)
    const [calData, setCalData] = useState([0, 1]);//calories data (burned, remaining)

    // Export current stats and heartrate data as a CSV file
    const exportCsv = () => {
        const esc = (v) => `"${String(v).replace(/"/g, '""')}"`; // Escape quotes to keep valid CSV cells
        const rows = [
            ["Week", weekStr],
            ["Steps Done", stepData[0] ?? 0],
            ["Calories Burned", calData[0] ?? 0],
            ["Heartrate Time", "BPM"],
            ...heartData.map((p) => [p.x, p.y]), // Expand heartrate points into CSV rows
        ];
        const csv = rows
            .map((r) => (r.length ? r.map(esc).join(",") : "")) // Convert each row array into one CSV line
            .join("\n"); // Join all lines into one CSV string

        const blob = new Blob([csv], {type: "text/csv;charset=utf-8;"});
        const url = URL.createObjectURL(blob); // Temporary download URL for the CSV file
        const a = document.createElement("a");
        a.href = url;
        a.download = `weeklyStats.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url); // Empty temporary browser memory after download
    }

    //Heartrate chart
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
                tension: 0.3
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
                    size: 18,
                },
                color: "#4b5563"
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
                    },
                    color: "#4b5563"
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
                    },
                    color: "#4b5563"
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
        setHeartData(genHR(email, weekRange.start.toISOString(), 24));//roughly 24 "hours"
    }

    //Get routes within date range & convert to charts
    const getPeriodData = async() => {
        try {
            //fetch data
            const response = await fetch(`/getRoutesPeriod?email=${email}&start=${weekRange.start.toISOString()}&end=${weekRange.end.toISOString()}`);
            if (!response.ok) {
                console.log("not found");
                return;
            }

            //check data exists
            const data = await response.json();
            if (!data) {
                console.error("Period fetch returned nothing")
            }
            console.log("Data: ", data);

            //update charts
            setStepData(data.steps)
            setCalData(data.calories)
        } catch (e) {
            console.error("Period fetch error: ", e);
        }
    }

    //init
    useEffect(() => {
        dateShift(0);
    }, []);

    //update heartrate labels when heartrate data changed
    useEffect(() => {
        var labels = [];
        heartData.forEach((value) => {
            labels.push(value.x);
        });
        setHeartLabels(labels);
    }, [heartData])

    return (
        <div className="flex flex-col w-full h-full justify-around gap-4 p-2 overflow-x-clip">
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

            <div className="flex justify-between items-center w-full mb-2"> {/* Date Incrementer */}
                <DateBtn icon={HiRewind} label="Previous week" click={() => dateShift(-7)}/>
                <p className="text-2xl font-bold text-gray-600">{weekStr}</p>
                <DateBtn icon={HiFastForward} label="Next week" click={() => dateShift(7)}/>
            </div>
            <div className='flex flex-row justify-between items-center pb-4'>
                <span className="bg-green-300 rounded-full px-6 py-4 text-xl clickHover-[1.1] hover:bg-green-400 m-2">Import</span>
                <button className="bg-green-300 rounded-full px-6 py-4 text-xl clickHover-[1.1] hover:bg-green-400 m-2" aria-label="Export stats as CSV" onClick={exportCsv}>Export</button>
            </div>
        </div>
    )
}