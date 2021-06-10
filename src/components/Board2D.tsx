import React, { useState, useEffect } from "react";
import Game from "../lib/generals-utils/Game";

const Board2D = ({ game, turn }: { game: Game; turn: number }) => {
    const [board, setBoard] = useState<JSX.Element>(null);

    useEffect(() => {
        if (!game) return;

        updateBoard(game);
    }, [turn]);

    const updateBoard = (game: Game) => {
        if (!game) return;
        const map = game.map;
        if (!map) return;

        const tiles: any[] = [];
        for (let y = 0; y < map.height; y++) {
            for (let x = 0; x < map.width; x++) {
                const i = y * map.width + x;
                const isCity = game.cities.includes(i);
                const isGeneral = game.generals.includes(i);
                const isMountain = map._map[i] === -2;
                const bg = isCity
                    ? "img/city.png"
                    : isGeneral
                    ? "img/crown.png"
                    : isMountain
                    ? "img/mountain.png"
                    : "";
                const army = map._armies[i];
                tiles.push(
                    <div
                        key={`tile_${i}`}
                        style={{
                            boxSizing: "border-box",
                            border: "1px solid black",
                            display: "grid",
                            placeItems: "center",
                            backgroundPosition: "center",
                            backgroundSize: "cover",
                            backgroundImage: `url("${bg}")`,
                            backgroundColor:
                                map._map[i] >= 0
                                    ? `hsl(${Math.round(
                                          (360 * map._map[i]) / game.sockets.length
                                      )}, 100%, 40%)`
                                    : "#666",
                            color: "#FFF",
                            fontSize: "0.8rem",
                        }}
                    >
                        {army > 0 ? army : ""}
                    </div>
                );
            }
        }
        const widthLarger = map.width > map.height;
        const width = widthLarger ? "1000px" : Math.round((1000 * map.width) / map.height) + "px";
        const height = widthLarger ? Math.round((1000 * map.height) / map.width) + "px" : "1000px";
        setBoard(
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${map.width}, 1fr)`,
                    gridTemplateRows: `repeat(${map.height}, 1fr)`,
                    width,
                    height,
                }}
            >
                {tiles}
            </div>
        );
    };

    return board;
};

export default Board2D;
