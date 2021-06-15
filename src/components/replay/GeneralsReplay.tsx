import React, { useEffect, useState } from "react";

import Board3D from "../Board3D";
import Constants from "../../lib/generals-utils/Constants";

import { TReplay } from "../../lib/generals-utils/types";
import Simulator from "../../lib/generals-utils/simulator";
import ReplayControls from "./ReplayControls";
import ReplayScores from "./ReplayScores";

const GeneralsReplay = ({ replay }: { replay: TReplay }) => {
    const [simulator, setSimulator] = useState<Simulator>();
    const [turn, setTurn] = useState(0);

    useEffect(() => {
        const sim = new Simulator(replay);
        setSimulator(sim);
    }, [replay]);

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
            <ReplayControls
                turn={simulator.game.turn}
                maxTurn={simulator.maxTurn}
                gameOver={simulator.gameOver}
                onNextTurn={nextTurn}
                onPreviousTurn={previousTurn}
                onSetTurn={jumpToTurn}
            />
            <ReplayScores
                scores={simulator.game.scores}
                sockets={simulator.game.sockets}
                colors={replay.playerColors}
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
