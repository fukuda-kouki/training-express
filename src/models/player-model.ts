import { PoolConnection } from "mysql2/promise";
import { Player } from "../interfaces/player";
import { RowDataPacket,OkPacket } from "mysql2";

const selectPlayersIdAndName = async (dbConnection: PoolConnection): Promise<RowDataPacket[]> => {
  const [PlayerIdAndName] = await dbConnection.query<RowDataPacket[]>(
    "SELECT id,name FROM `players`;"
  );

  return PlayerIdAndName;
};

const insertPlayer = async (
  data: Player,
  dbConnection: PoolConnection
): Promise<OkPacket> => {
  const [rows] = await dbConnection.query<OkPacket>(
    "INSERT INTO `players` (`name`, `hp`, `mp`, `money`) VALUES (?,?,?,?)",
    [data.name, data.hp, data.mp, data.money]
  );

  return rows;
};

export { selectPlayersIdAndName ,insertPlayer };