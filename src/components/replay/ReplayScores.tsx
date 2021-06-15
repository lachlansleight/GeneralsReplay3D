import React from "react";
import { TScore, TSocket } from "../../lib/generals-utils/types";
import { GetBackgroundColor } from "../../lib/generals-utils/Constants";

import style from "./ReplayScores.module.scss";

const ReplayScores = ({
    scores,
    sockets,
    colors,
}: {
    scores: TScore[];
    sockets: TSocket[];
    colors: number[];
}) => {
    return (
        <div className={style.scores}>
            <div>
                <span className={style.stars} role="img" aria-label="star">
                    ⭐
                </span>
                <span className={style.username}>Player</span>
                <span className={style.army}>Army</span>
                <span className={style.land}>Land</span>
            </div>
            {scores.map((score, i) => {
                const index = score.i === undefined ? i : score.i;
                return (
                    <div key={score + "_" + i}>
                        <span className={style.stars}>
                            <div>
                                <span className={style.singleStar} role="img" aria-label="star">
                                    ⭐
                                </span>
                                <span className={style.singleStar}>{sockets[index].stars}</span>
                            </div>
                        </span>
                        <span
                            className={style.username}
                            style={{
                                backgroundColor: GetBackgroundColor(colors[index]),
                            }}
                        >
                            {sockets[index].username}
                        </span>
                        <span className={style.army}>{score.total}</span>
                        <span className={style.land}>{score.tiles}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default ReplayScores;
