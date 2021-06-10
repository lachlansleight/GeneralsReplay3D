import axios from "axios";
import { setServers } from "dns";
import React, { useRef, useState } from "react";
import Convert from "../../lib/generals-utils/converter";
import Simulator from "../../lib/generals-utils/simulator";
import { TReplay } from "../../lib/generals-utils/types";
import useAnim from "../../lib/useAnim";
//import Board2D from "../Board2D";
import Board3D from "../Board3D";

import Layout from "../layout/Layout";

import style from "./Home.module.scss"

const Home = () => {

    const [replayId, setReplayId] = useState("rdCnIf1sO");
    const [server, setServer] = useState("na");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [replay, setReplay] = useState<TReplay>();
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
                const url = `https://generalsio-replays-${server}.s3.amazonaws.com/${id}.gior`;
                const response = await axios(url, {
                    method: "GET",
                    responseType: "blob"
                });                
                const replayGior = response.data;
                
                const buffer = await replayGior.arrayBuffer();
                const replay = Convert(buffer);
                setReplay(replay);
                const sim = new Simulator(replay);
                setSimulator(sim);
            } catch(err) {
                if(err.message === "Request failed with status code 404") {
                    setError(`Replay id '${id}' not found on this server (${server})`);
                } else {
                    setError(err.message);
                }
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
            {simulator && simulator.game ? (
                <>
                    <div className={style.resetContainer}>
                        <div>
                            <button onClick={() => {
                                setSimulator(new Simulator(replay));
                                setAutoTurn(false);
                                setAutoTurnSpeed(1);
                                setTurn(0);
                            }}>Reset</button>
                            <button onClick={() => {
                                setSimulator(null);
                                setAutoTurn(false);
                                setAutoTurnSpeed(1);
                                setTurn(0);
                            }}>Exit</button>
                        </div>
                    </div>
                    <div className={style.turnControls}>
                        <div className={style.turn}>
                            {turn > 0 ? (
                                <p className={turn % 2 === 1 ? style.point : null}>Turn {Math.round((turn + 1) / 2)}</p>
                            ) : <p>Turn 1</p>}
                            <button onClick={() => {
                                simulator.nextTurn();
                                setTurn(simulator.game.turn);
                            }}>Next Turn</button>
                        </div>
                        <div className={style.auto}>
                            <button onClick={() => {
                                setAutoTurn(cur => !cur);
                            }}>Toggle Auto Play</button>
                            {autoTurn ? (
                                <div>
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
                                </div>
                            ) : <div></div>}
                        </div>
                    </div>
                    <div className={style.scores}>
                        <div>
                            <span className={style.stars}>⭐</span>
                            <span className={style.username}>Player</span>
                            <span className={style.army}>Army</span>
                            <span className={style.land}>Land</span>
                        </div>
                        {simulator.game.scores.map((score, i) => {
                            const index = score.i === undefined ? i : score.i;
                            return (
                                <div key={score + "_" + i}>
                                    <span className={style.stars}>⭐{simulator.game.sockets[index].stars}</span>
                                    <span className={style.username}>{simulator.game.sockets[index].username}</span>
                                    <span className={style.army}>{score.total}</span>
                                    <span className={style.land}>{score.tiles}</span>
                                </div>
                            )
                        })}
                    </div>
                    
                    <Board3D game={simulator.game} turn={turn} />
                </>
             ) : loading ? (
                    <div className={style.idForm}>
                        <p>Loading...</p>
                    </div>
                ) : (
                    <div className={style.idForm}>
                        <div>
                            <h2>Enter your Replay ID</h2>
                            <input id="replayId" value={replayId} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReplayId(e.target.value)} placeholder={"Replay Id"} />
                            <select id="server" value={server} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setServer(e.target.value)}>
                                <option value="na">North America</option>
                                <option value="eu">Europe</option>
                                <option value="bot">Bot</option>
                            </select>
                            <button onClick={() => loadReplay()} disabled={!replayId}>Load Replay</button>
                            {error ? <p style={{color: "salmon"}}>{error}</p> : null}
                        </div>
                    </div>
                )}
        </Layout>
    );
};

export default Home;
