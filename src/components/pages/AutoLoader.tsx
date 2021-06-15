import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Convert from "../../lib/generals-utils/converter";
import { TReplay } from "../../lib/generals-utils/types";

import Layout from "../layout/Layout";
import GeneralsReplay from "../replay/GeneralsReplay";

import style from "./Home.module.scss";

const Home = () => {
    const { replayId } = useParams<{ replayId: string }>();
    const [error, setError] = useState("");
    const [replay, setReplay] = useState<TReplay>();

    useEffect(() => {
        const doLoad = async (id: string) => {
            setError("");
            let server = localStorage.getItem("replayServer");
            if (!server) server = "na";
            const servers =
                server === "na"
                    ? ["na", "eu", "bot"]
                    : server === "eu"
                    ? ["eu", "na", "bot"]
                    : ["bot", "na", "eu"];

            for (let i = 0; i < servers.length; i++) {
                server = servers[i];
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
                    localStorage.setItem("replayServer", server);
                    return;
                } catch (err) {
                    if (err.message === "Request failed with status code 404") {
                        //this is OK
                    } else {
                        setError(err.message);
                        return;
                    }
                }
            }
            setError("Replay not found on any server!");
        };

        if (!replayId) setError("Invalid replay ID");
        doLoad(replayId);
    }, [replayId]);

    return (
        <Layout>
            {replay ? (
                <GeneralsReplay replay={replay} />
            ) : (
                <div className={style.idForm}>
                    <p>Loading...</p>
                    {error ? <p style={{ color: "salmon" }}>{error}</p> : null}
                </div>
            )}
        </Layout>
    );
};

export default Home;
