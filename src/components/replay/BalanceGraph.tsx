import React, { useRef, useEffect, useState } from "react";
import { GetColor } from "../../lib/generals-utils/Constants";
import { TGame } from "../../lib/generals-utils/types";

import style from "./BalanceGraph.module.scss";

const getOffset = (el: any) => {
    let _x = 0;
    let _y = 0;
    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        el = el.offsetParent;
    }
    return { top: _y, left: _x };
};

const BalanceGraph = ({
    showing,
    turn,
    colors,
    width,
    height,
    games,
    onClick,
}: {
    showing: boolean;
    turn: number;
    colors: number[];
    width: number;
    height: number;
    games: TGame[];
    onClick: (turn: number) => void;
}) => {
    const canvasRef = useRef<HTMLCanvasElement>();
    const parentRef = useRef<HTMLDivElement>();
    const [clicking, setClicking] = useState(false);

    const handleClick = (e: React.MouseEvent) => {
        if (!clicking) return;
        const parentOffset = getOffset(parentRef.current);
        const x = (e.pageX - parentOffset.left + 1) / parentRef.current.offsetWidth;
        onClick(Math.floor(x * games.length));
    };

    useEffect(() => {
        if (!games || games.length === 0) return;
        if (!canvasRef.current) return;

        const ctx = canvasRef.current.getContext("2d");

        const pxPerTurn = width / games.length;

        const armyPoints: { players: number[]; total: number }[] = [];
        games.forEach(game => {
            const armyPoint = {
                players: game.sockets.map(() => 0),
                total: 0,
            };
            for (let i = 0; i < game.map._armies.length; i++) {
                if (Number(game.map._map[i]) < 0) continue;
                armyPoint.total += game.map._armies[i];
                armyPoint.players[game.map._map[i]] += game.map._armies[i];
            }
            armyPoints.push(armyPoint);
        });

        const points = armyPoints.map(point => {
            let total = point.players[0];
            const output: number[] = [point.players[0] / point.total];
            for (let i = 1; i < point.players.length; i++) {
                total += point.players[i];
                output[i] = total / point.total;
            }
            return output;
        });

        ctx.clearRect(0, 0, width, height);

        for (let i = 1; i < points.length; i++) {
            const x1 = Math.floor(pxPerTurn * (i - 1));
            const x2 = Math.floor(pxPerTurn * i);
            for (let j = 0; j < points[0].length; j++) {
                const yA1 = Math.floor(j === 0 ? height : height - height * points[i - 1][j - 1]);
                const yA2 = Math.floor(height - height * points[i - 1][j]);
                const yB1 = Math.floor(j === 0 ? height : height - height * points[i][j - 1]);
                const yB2 = Math.floor(height - height * points[i][j]);

                ctx.fillStyle = GetColor(colors[j]);
                ctx.beginPath();
                ctx.moveTo(x1, yA1);
                ctx.lineTo(x1, yA2);
                ctx.lineTo(x2, yB2);
                ctx.lineTo(x2, yB1);
                ctx.closePath();
                ctx.fill();
            }
        }

        ctx.strokeStyle = "#FFF";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(pxPerTurn * turn, 0);
        ctx.lineTo(pxPerTurn * turn, height);
        ctx.stroke();
    }, [width, height, games, canvasRef, colors, turn]);

    return (
        <div className={`${style.balanceGraph} ${showing ? null : style.hiding}`} ref={parentRef}>
            <canvas
                width={width}
                height={height}
                ref={canvasRef}
                onMouseMove={handleClick}
                onMouseDown={() => setClicking(true)}
                onMouseUp={e => {
                    handleClick(e);
                    setClicking(false);
                }}
                onMouseLeave={() => setClicking(false)}
            />
            ;
        </div>
    );
};

export default BalanceGraph;
