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
        if(simulator.gameOver) return;
        simulator.nextTurn();
        setTurn(simulator.game.turn);
    };

    const previousTurn = () => {
        simulator.previousTurn();
        console.log(simulator.game.turn);
        setTurn(simulator.game.turn);
    };

    return (
        <div>
            {/* <div className={style.resetContainer}>
                <div>
                    <button
                        onClick={() => {
                            setSimulator(new Simulator(replay));
                            setAutoTurn(false);
                            setAutoTurnSpeed(1);
                            setTurn(0);
                        }}
                    >
                        Reset
                    </button>
                    <button
                        onClick={() => {
                            setSimulator(null);
                            setAutoTurn(false);
                            setAutoTurnSpeed(1);
                            setTurn(0);
                        }}
                    >
                        Exit
                    </button>
                </div>
            </div> */}
            <ReplayControls
                turn={simulator.game.turn}
                gameOver={simulator.gameOver}
                onNextTurn={nextTurn}
                onPreviousTurn={previousTurn}
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
