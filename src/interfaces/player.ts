interface Player {
    id?: number;
    name?: string;
    hp?: number;
    mp?: number;
    money?: number;
  }
  type PlayerKey = keyof Player;
  const PlayerKeyString = ["id","name","hp","mp","money"];
  export { Player, PlayerKey, PlayerKeyString };