import React from "react";
import { TScore, TSocket } from "../../lib/generals-utils/types";
import { GetColor } from "../../lib/generals-utils/Constants";

import style from "./ReplayScores.module.scss";

const ReplayScores = ({
    scores,
    sockets,
    colors,
    showing,
}: {
    scores: TScore[];
    sockets: TSocket[];
    colors: number[];
    showing: boolean;
}) => {
    return (
        <div className={`${style.scores} ${showing ? null : style.hiding}`}>
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
                                backgroundColor: GetColor(colors[index]),
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
