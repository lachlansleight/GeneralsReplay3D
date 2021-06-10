import React, { useState, useEffect } from "react";
import BoardScene from "../lib/BoardScene";
import Game from "../lib/generals-utils/Game";
import ThreeScene from "../lib/ThreeReactUtils/ThreeScene";

const Board3D = ({ game, colors, turn }: { game: Game; colors: number[][], turn: number }) => {
    const [scene, setScene] = useState<BoardScene>();
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        setScene(new BoardScene());
    }, []);

    useEffect(() => {
        if (!scene) return;
        if (!game) return;
        if (!game.map) return;

        scene.game = game;
        scene.colors = colors;
        setInitialized(true);
    }, [scene, game, turn, colors]);

    if (!initialized) return null;
    return (
        <ThreeScene scene={scene} displayMode="wideContent" divHeight={1000} headerHeight={64} />
    );
};

export default Board3D;
