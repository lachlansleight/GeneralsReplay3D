import axios from "axios";
import React, { useState } from "react";
import Convert from "../../lib/generals-utils/converter";
import { TReplay } from "../../lib/generals-utils/types";
//import Board2D from "../Board2D";

import Layout from "../layout/Layout";
import GeneralsReplay from "../replay/GeneralsReplay";

import style from "./Home.module.scss";

const Home = () => {
    const [replayId, setReplayId] = useState("rdCnIf1sO");
    const [server, setServer] = useState("na");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [replay, setReplay] = useState<TReplay>();

    const loadReplay = () => {
        const doLoad = async (id: string) => {
            setLoading(true);
            setError("");
            try {
                const url = `https://generalsio-replays-${server}.s3.amazonaws.com/${id}.gior`;
                const response = await axios(url, {
                    method: "GET",
                    responseType: "blob",
                });
                const replayGior = response.data;

                const buffer = await replayGior.arrayBuffer();
                const replay = Convert(buffer);
                console.log("Loaded replay", replay);
                setReplay(replay);
            } catch (err) {
                if (err.message === "Request failed with status code 404") {
                    setError(`Replay id '${id}' not found on this server (${server})`);
                } else {
                    setError(err.message);
                }
            }
            setLoading(false);
        };

        doLoad(replayId);
    };

    return (
        <Layout>
            {replay ? (
                <GeneralsReplay replay={replay} />
            ) : loading ? (
                <div className={style.idForm}>
                    <p>Loading...</p>
                </div>
            ) : (
                <div className={style.idForm}>
                    <div>
                        <h2>Enter your Replay ID</h2>
                        <input
                            id="replayId"
                            value={replayId}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                setReplayId(e.target.value)
                            }
                            placeholder={"Replay Id"}
                        />
                        <select
                            id="server"
                            value={server}
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                setServer(e.target.value)
                            }
                        >
                            <option value="na">North America</option>
                            <option value="eu">Europe</option>
                            <option value="bot">Bot</option>
                        </select>
                        <button onClick={() => loadReplay()} disabled={!replayId}>
                            Load Replay
                        </button>
                        {error ? <p style={{ color: "salmon" }}>{error}</p> : null}
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Home;
