import React, { useEffect, useRef, useState } from "react";

import { Range } from "react-range";

import useAnim from "../../lib/useAnim";

import style from "./ReplayControls.module.scss";

const ReplayControls = ({
    turn,
    maxTurn,
    gameOver,
    onNextTurn,
    onPreviousTurn,
    onSetTurn,
}: {
    turn: number;
    maxTurn: number;
    gameOver: boolean;
    onNextTurn: () => void;
    onPreviousTurn: () => void;
    onSetTurn: (turn: number) => void;
}) => {
    const [autoTurn, setAutoTurn] = useState(false);
    const [autoTurnSpeed, setAutoTurnSpeed] = useState(1);
    const autoTurnButton = useRef<HTMLButtonElement>(null);
    const lastTurnTime = useRef(0);
    const [jumpTarget, setJumpTarget] = useState(0);

    const animCallback = (time: number) => {
        if (!autoTurn) return;
        if (time < lastTurnTime.current + 0.5 / autoTurnSpeed) return;

        if (!gameOver) {
            if (onNextTurn) onNextTurn();
            lastTurnTime.current = time;
        }
    };
    useAnim(animCallback, [autoTurn, autoTurnSpeed, turn, gameOver, onNextTurn]);

    useEffect(() => {
        const handleKey = (key: any) => {
            if (key.key === "ArrowRight" && !autoTurn && !gameOver) {
                if (onNextTurn) onNextTurn();
            } else if (key.key === "ArrowLeft" && !autoTurn) {
                if (onPreviousTurn) onPreviousTurn();
            } else if (key.key === " ") {
                autoTurnButton.current.click();
            }
        };
        document.addEventListener("keydown", handleKey);

        return () => {
            document.removeEventListener("keydown", handleKey);
        };
    }, [autoTurn, autoTurnButton, onNextTurn, onPreviousTurn, gameOver]);

    const startAutoTurn = (speed: number) => {
        setAutoTurn(true);
        setAutoTurnSpeed(speed);
    };

    const speedClass = (speed: number) => {
        return autoTurnSpeed === speed ? style.active : null;
    };

    const getFullTurnNumber = (turn: number) => {
        return Math.round((turn + 1) / 2);
    };

    const getIsHalfTurn = (turn: number) => {
        return turn % 2 === 1;
    };

    return (
        <div className={style.turnControls}>
            <div className={style.turn}>
                {turn > 0 ? (
                    <p className={getIsHalfTurn(turn) ? style.point : null}>
                        Turn {getFullTurnNumber(turn)}
                    </p>
                ) : (
                    <p>Turn 1</p>
                )}
                <div>
                    <button onClick={() => onPreviousTurn()}>Last</button>
                    <button onClick={() => onNextTurn()}>Next</button>
                </div>
            </div>
            <div className={style.auto}>
                <button ref={autoTurnButton} onClick={() => setAutoTurn(cur => !cur)}>
                    Toggle Auto Play
                </button>
                {autoTurn ? (
                    <div>
                        <button className={speedClass(0.5)} onClick={() => startAutoTurn(0.5)}>
                            0.5x
                        </button>
                        <button className={speedClass(1)} onClick={() => startAutoTurn(1)}>
                            1x
                        </button>
                        <button className={speedClass(2)} onClick={() => startAutoTurn(2)}>
                            2x
                        </button>
                        <button className={speedClass(5)} onClick={() => startAutoTurn(5)}>
                            5x
                        </button>
                        <button className={speedClass(10)} onClick={() => startAutoTurn(10)}>
                            10x
                        </button>
                    </div>
                ) : (
                    <div></div>
                )}
            </div>
            <div className={style.jump}>
                <Range
                    min={0}
                    max={maxTurn}
                    step={2}
                    values={[jumpTarget]}
                    onChange={(values: number[]) => setJumpTarget(values[0])}
                    renderTrack={({ props, children }) => (
                        <div {...props} style={{ ...props.style }} className={style.sliderTrack}>
                            {children}
                        </div>
                    )}
                    renderThumb={({ props }) => (
                        <div {...props} style={{ ...props.style }} className={style.sliderThumb} />
                    )}
                />
                <button onClick={() => onSetTurn(jumpTarget)}>
                    Jump to turn {getFullTurnNumber(jumpTarget)}
                </button>
            </div>
        </div>
    );
};

export default ReplayControls;
