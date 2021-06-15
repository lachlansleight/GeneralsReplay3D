const Constants = {
    MIN_CITY_ARMY: 40,
    RECRUIT_RATE: 2, // 1 recruit per city/general every _ turns.
    FARM_RATE: 50, // 1 recruit per land every _ turns.
    colors: [
        [0, 100, 50],
        [227, 66, 55],
        [120, 100, 25],
        [180, 100, 25],
        [25, 91, 58],
        [303, 86, 57],
        [300, 100, 25],
        [0, 100, 25],
        [52, 57, 44],
        [32, 62, 37],
        [240, 100, 50],
        [248, 39, 39],
    ],
};

export const GetBackgroundColor = (index: number) => {
    const col = Constants.colors[index];
    if (!col) return "#ffffff";
    return `hsl(${col[0]}, ${col[1]}%, ${col[2]}%)`;
};

export default Constants;
