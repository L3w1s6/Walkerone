import PrevRoute from "../components/Route";

export default function Routes() {
    // Test route from the db
    const testRoute = {
        _id: "6993059c4880fd16fd37df4c",
        name: "a route",
        distance: 1.99,
        caloriesBurned: 0,
        elevationGain: 0,
        stepCount: 0,
        startTime: "2026-02-16T11:55:03.488Z",
        endTime: "2026-02-16T11:55:06.429Z",
        coordinates: [
            {
                lat: 51.517500000000005,
                long: -0.0710756,
                timestamp: new Date("2026-02-16T11:55:03.488Z"),
                _id: "6993059c4880fd16fd37df4d"
            },
            {
                lat: 51.51760000000001,
                long: -0.0710756,
                timestamp: new Date("2026-02-16T11:55:03.674Z"),
                _id: "6993059c4880fd16fd37df4e"
            },
            {
                lat: 51.51770000000001,
                long: -0.0710756,
                timestamp: new Date("2026-02-16T11:55:03.850Z"),
                _id: "6993059c4880fd16fd37df4f"
            },
            {
                lat: 51.517800000000015,
                long: -0.0710756,
                timestamp: new Date("2026-02-16T11:55:04.033Z"),
                _id: "6993059c4880fd16fd37df50"
            },
            {
                lat: 51.51790000000002,
                long: -0.0710756,
                timestamp: new Date("2026-02-16T11:55:04.595Z"),
                _id: "6993059c4880fd16fd37df51"
            }
        ],
        username: "garrytheprophet",
        __v: 0
    }

    return(
        <div className="flex flex-col px-5 divide-y divide-gray-200">
            <PrevRoute route={testRoute}/>
            <PrevRoute route={testRoute}/>
            <PrevRoute route={testRoute}/>
        </div>
    )
}