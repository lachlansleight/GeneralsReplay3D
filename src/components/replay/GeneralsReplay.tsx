import React, { useEffect, useState } from "react";

import Board3D from "../Board3D";
import Constants from "../../lib/generals-utils/Constants";

import { TReplay } from "../../lib/generals-utils/types";
import Simulator from "../../lib/generals-utils/simulator";
import ReplayControls from "./ReplayControls";
import ReplayScores from "./ReplayScores";

import style from "./GeneralsReplay.module.scss";
import BalanceGraph from "./BalanceGraph";

const GeneralsReplay = ({ replay, defaultTurn }: { replay: TReplay; defaultTurn: number }) => {
    const [simulator, setSimulator] = useState<Simulator>();
    const [turn, setTurn] = useState(0);
    const [showUi, setShowUi] = useState(true);

    useEffect(() => {
        const sim = new Simulator(replay);
        sim.setTurn(defaultTurn);
        setSimulator(sim);
    }, [replay, defaultTurn]);

    if (!simulator) {
        return (
            <div>
                <p>Preparing Simulation...</p>
            </div>
        );
    }

    const nextTurn = () => {
        if (simulator.gameOver) return;
        simulator.nextTurn();
        setTurn(simulator.game.turn);
    };

    const previousTurn = () => {
        simulator.previousTurn();
        setTurn(simulator.game.turn);
    };

    const jumpToTurn = (newTurn: number) => {
        simulator.setTurn(newTurn);
        setTurn(simulator.game.turn);
    };

    return (
        <div>
            <div className={style.resetContainer}>
                <button
                    onClick={() => {
                        console.log(showUi);
                        setShowUi(cur => !cur);
                    }}
                >
                    {showUi ? ">" : "<"}
                </button>
            </div>
            <BalanceGraph
                showing={showUi}
                turn={simulator.game.turn}
                width={window.innerWidth}
                height={160}
                colors={replay.playerColors}
                games={simulator.gameStates.map(state => state.game)}
                onClick={jumpToTurn}
            />
            <ReplayControls
                turn={simulator.game.turn}
                defaultTurn={defaultTurn}
                maxTurn={simulator.maxTurn}
                gameOver={simulator.gameOver}
                showing={showUi}
                onNextTurn={nextTurn}
                onPreviousTurn={previousTurn}
                onSetTurn={jumpToTurn}
            />
            <ReplayScores
                scores={simulator.game.scores}
                sockets={simulator.game.sockets}
                colors={replay.playerColors}
                showing={showUi}
            />
            <Board3D
                game={simulator.game}
                colors={replay.playerColors.map(c => Constants.colors[c])}
                turn={turn}
            />
        </div>
    );
};

export default GeneralsReplay;
