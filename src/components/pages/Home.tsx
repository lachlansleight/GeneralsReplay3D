import axios from "axios";
import React, { useRef, useState } from "react";
import Convert from "../../lib/generals-utils/converter";
import Simulator from "../../lib/generals-utils/simulator";
import useAnim from "../../lib/useAnim";
//import Board2D from "../Board2D";
import Board3D from "../Board3D";

import Layout from "../layout/Layout";

const Home = () => {

    const [replayId, setReplayId] = useState("rdCnIf1sO");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [simulator, setSimulator] = useState<Simulator>();
    const [turn, setTurn] = useState(0);
    const [autoTurn, setAutoTurn] = useState(false);
    const [autoTurnSpeed, setAutoTurnSpeed] = useState(1);
    const lastTurnTime = useRef(0);

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

    const animCallback = (time: number) => {
        if(!autoTurn) return;
        if(time < lastTurnTime.current + 0.5 / autoTurnSpeed) return;
        
        if(!simulator.game.isOver()) {
            simulator.nextTurn();
            setTurn(simulator.game.turn);
            lastTurnTime.current = time;
        }
    }
    useAnim(animCallback, [autoTurn, autoTurnSpeed, simulator, turn]);
    

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
            {simulator && simulator.game ? (
                <div>
                    <button onClick={() => {
                        simulator.nextTurn();
                        setTurn(simulator.game.turn);
                    }}>Next Turn</button>
                    <p>Auto Turn: {autoTurn ? autoTurnSpeed + "x" : "off"}</p>
                    { autoTurn ? (
                        <button onClick={() => {
                            setAutoTurn(false);
                        }}>Stop Auto Turn</button>
                    ) : (
                        <button onClick={() => {
                            setAutoTurn(true);
                        }}>Start Auto Turn</button>
                    )}
                    <button onClick={() => {
                        setAutoTurn(true);
                        setAutoTurnSpeed(0.5);
                    }}>0.5x</button>
                    <button onClick={() => {
                        setAutoTurn(true);
                        setAutoTurnSpeed(1);
                    }}>1x</button>
                    <button onClick={() => {
                        setAutoTurn(true);
                        setAutoTurnSpeed(2);
                    }}>2x</button>
                    <button onClick={() => {
                        setAutoTurn(true);
                        setAutoTurnSpeed(5);
                    }}>5x</button>
                    <button onClick={() => {
                        setAutoTurn(true);
                        setAutoTurnSpeed(10);
                    }}>10x</button>
                    {turn > 0 ? (
                        <p>Turn {Math.round((turn + 1) / 2)}{turn % 2 === 1 ? "." : ""}</p>
                    ) : <p>Turn 0</p>}
                    
                    <Board3D game={simulator.game} turn={turn} />
                </div>
             ) : null}
        </Layout>
    );
};

export default Home;
