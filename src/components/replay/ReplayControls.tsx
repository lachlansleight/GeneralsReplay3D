import React, { useEffect, useRef, useState } from "react";

import { Range } from "react-range";
import useActiveElement from "../../lib/useActiveElement";

import useAnim from "../../lib/useAnim";

import style from "./ReplayControls.module.scss";

const ReplayControls = ({
    turn,
    defaultTurn,
    maxTurn,
    gameOver,
    onNextTurn,
    onPreviousTurn,
    onSetTurn,
}: {
    turn: number;
    defaultTurn: number;
    maxTurn: number;
    gameOver: boolean;
    onNextTurn: () => void;
    onPreviousTurn: () => void;
    onSetTurn: (turn: number) => void;
}) => {
    const activeElement = useActiveElement();
    const [autoTurn, setAutoTurn] = useState(false);
    const [autoTurnSpeed, setAutoTurnSpeed] = useState(1);
    const lastTurnTime = useRef(0);
    const [jumpTarget, setJumpTarget] = useState(defaultTurn);

    const autoTurnButton = useRef<HTMLButtonElement>(null);
    const nextTurnButton = useRef<HTMLButtonElement>(null);
    const previousTurnButton = useRef<HTMLButtonElement>(null);

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
        const handleKey = (e: KeyboardEvent) => {
            if (activeElement) return;
            e.preventDefault();
            if (e.key === "ArrowRight" && !autoTurn && !gameOver) {
                nextTurnButton.current.click();
            } else if (e.key === "ArrowLeft" && !autoTurn) {
                previousTurnButton.current.click();
            } else if (e.key === " ") {
                autoTurnButton.current.click();
            }
        };

        const supressKeyUp = (e: KeyboardEvent) => {
            if (activeElement) return;
            e.preventDefault();
        };

        document.addEventListener("keydown", handleKey);
        window.addEventListener("keyup", supressKeyUp);

        return () => {
            document.removeEventListener("keydown", handleKey);
            window.removeEventListener("keyup", supressKeyUp);
        };
    }, [
        autoTurn,
        autoTurnButton,
        nextTurnButton,
        previousTurnButton,
        onNextTurn,
        onPreviousTurn,
        gameOver,
        activeElement,
    ]);

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

    const jumpToTurnAndPause = () => {
        setAutoTurn(false);
        onSetTurn(jumpTarget);
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
                    <button ref={previousTurnButton} onClick={() => onPreviousTurn()}>
                        Last
                    </button>
                    <button ref={nextTurnButton} onClick={() => onNextTurn()}>
                        Next
                    </button>
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
                <button onClick={jumpToTurnAndPause}>
                    Jump to turn {getFullTurnNumber(jumpTarget)}
                </button>
            </div>
        </div>
    );
};

export default ReplayControls;
