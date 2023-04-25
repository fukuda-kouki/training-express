interface PlayerItems {
    playerId?: number,
    itemId?: number,
    count?: number
}

type PlayerItemsKey = keyof PlayerItems;
export {PlayerItems, PlayerItemsKey};