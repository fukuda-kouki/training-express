import { PoolConnection } from "mysql2/promise";
import { Player } from "../interfaces/player";
import { RowDataPacket,OkPacket } from "mysql2";

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

export { selectPlayersIdAndName ,insertPlayer };