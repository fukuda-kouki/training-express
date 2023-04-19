import { PoolConnection } from "mysql2/promise";
import { Player } from "../interfaces/player";
import { RowDataPacket, OkPacket } from "mysql2";
import { NotFoundError } from "../interfaces/my-error";

const selectPlayersIdAndName = async (dbConnection: PoolConnection): Promise<Player[]> => {
  const [rows] = await dbConnection.query<RowDataPacket[]>(
    "SELECT id,name FROM `players`;"
  );

  //DBから取得したデータをPlayerに変換
  const idAndName: Player[] = rows.map((row) => {
    return {
      id: row.id,
      name: row.name
    };
  });

  return idAndName;
};

const selectPlayerDataById = async (
  id: number,
  dbConnection: PoolConnection
): Promise<Player> => {
  const [rows] = await dbConnection.query<RowDataPacket[]>(
    "SELECT * FROM `players` WHERE id = ?;",
    id
  );

  let playerData: Player;
  if(rows[0] == null) throw new NotFoundError(`Data not found. id:${id}`); //データが存在しない場合

  //DBから取得したデータをPlayerに変換
  playerData = {
    id: rows[0].id,
    name: rows[0].name,
    hp: rows[0].hp,
    mp: rows[0].mp,
    money: rows[0].money
  };

  return playerData;
}

const insertPlayer = async (
  data: Player,
  dbConnection: PoolConnection
): Promise<number> => {
  const [rows] = await dbConnection.query<OkPacket>(
    "INSERT INTO `players` (`name`, `hp`, `mp`, `money`) VALUES (?,?,?,?)",
    [data.name, data.hp, data.mp, data.money]
  );

  return rows.insertId;
};

export { selectPlayersIdAndName, selectPlayerDataById, insertPlayer };