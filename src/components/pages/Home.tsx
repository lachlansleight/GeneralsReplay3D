import axios from "axios";
import React, { useEffect, useState } from "react";
import Convert from "../../lib/generals-utils/converter";
import Game from "../../lib/generals-utils/Game";
import Simulator from "../../lib/generals-utils/simulator";

import Layout from "../layout/Layout";

const Home = () => {

    const [replayId, setReplayId] = useState("rdCnIf1sO");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [simulator, setSimulator] = useState<any>({});
    const [board, setBoard] = useState<JSX.Element>(null);

    const loadReplay = () => {
        const doLoad = async (id: string) => {
            setLoading(true);
            setError("");
            try {
                const url = `https://generalsio-replays-na.s3.amazonaws.com/${id}.gior`;
                const replayGior = (await axios(url, {
                    method: "GET",
                    responseType: "blob"
                })).data;
                const buffer = await replayGior.arrayBuffer();
                const replay = Convert(buffer);
                const sim = new Simulator(replay);
                setSimulator(sim);
            } catch(err) {
                setError(err);
            }
            setLoading(false);
        }

        doLoad(replayId);
    }

    useEffect(() => {
        if(!simulator) return;
        if(!simulator.game) return;
        if(!simulator.game.map) return;

        console.log(simulator);
        updateBoard(simulator.game);
    }, [simulator])

    const updateBoard = (game: Game) => {
        if(!game) return;
        const map = game.map;
        if(!map) return;

        const tiles: any[] = [];
        for(let y = 0; y < map.height; y++) {
            for(let x = 0; x < map.width; x++) {
                const i = y * map.width + x;
                const isCity = game.cities.includes(i);
                const isGeneral = game.generals.includes(i);
                const isMountain = map._map[i] === -2;
                const bg = isCity 
                    ? "img/city.png" 
                    : isGeneral
                        ? "img/crown.png"
                        : isMountain 
                            ? "img/mountain.png"
                            : "";
                const army = map._armies[i];
                tiles.push(<div key={`tile_${i}`} style={{
                    boxSizing: "border-box",
                    border: "1px solid black",
                    display: "grid",
                    placeItems: "center",
                    backgroundPosition: "center",
                    backgroundSize: "cover",
                    backgroundImage: `url("${bg}")`,
                    backgroundColor: map._map[i] >= 0 
                        ? `hsl(${Math.round(360 * map._map[i] / game.sockets.length)}, 100%, 40%)` 
                        : "#666",
                    color: "#FFF",
                    fontSize: "0.8rem",
                }}>{army > 0 ? army : ""}</div>)
            }
        }
        const widthLarger = map.width > map.height;
        const width = widthLarger ? "1000px" : Math.round(1000 * map.width / map.height) + "px";
        const height = widthLarger ? Math.round(1000 * map.height / map.width) + "px" : "1000px";
        setBoard((
            <div style={{
                display: "grid",
                gridTemplateColumns: `repeat(${map.width}, 1fr)`,
                gridTemplateRows: `repeat(${map.height}, 1fr)`,
                width,
                height,
            }}>
                {tiles}
            </div>
        ));
    }

    return (
        <Layout>
            <h1>Generals IO 3D Replay</h1>
            { loading ? (
                <p>Loading...</p>
            ) : (
                <div>
                    <label htmlFor="replayId">Replay ID</label>
                    <input id="replayId" value={replayId} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReplayId(e.target.value)} placeholder={"Replay Id"} />
                    <button onClick={() => loadReplay()} disabled={!replayId}>Load Replay</button>
                    {error ? <p>{error}</p> : null}
                </div>
            )}
            {simulator ? (
                <div>
                    <button onClick={() => {
                        simulator.nextTurn();
                        updateBoard(simulator.game);
                    }}>Next Turn</button>
                    <button onClick={() => {
                        setInterval(() => {
                            simulator.nextTurn();
                            updateBoard(simulator.game);
                        }, 10)
                    }}>Auto Turn</button>
                    {board}
                </div>
             ) : null}
        </Layout>
    );
};

export default Home;
