const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "cricketTeam.db");

const app = express();

app.use(express.json());

const port = process.env.PORT || "3000";

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(port, () => {
      console.log(`Server Starting https://localhost:${port}`);
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//GET API
app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT *
    FROM cricket_team;
    `;
  const playersArray = await database.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//GET API WITH ID
app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getPlayersQuery = `
    SELECT * 
    FROM cricket_team
    WHERE player_id = ${playerId};
    `;
  const player = await database.get(getPlayersQuery);
  response.send(convertDbObjectToResponseObject(player));
});

// POST API
app.post("/players/", async (request, response) => {
  const { playerName, jerseyNumber, role } = request.body;
  const postPlayerQuery = `
  INSERT INTO
    cricket_team (player_name, jersey_number, role)
  VALUES
    ('${playerName}', ${jerseyNumber}, '${role}');`;
  const player = await database.run(postPlayerQuery);
  response.send("Player Added to Team");
});

// PUT API
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerName, jerseyNumber, role } = request.body;
  const updatedPlayerQuery = `
    UPDATE 
      cricket_team
    SET 
         player_name = '${playerId}',
         jersey_number = '${jerseyNumber}',
         role = '${role}'
    WHERE
         player_id = ${playerId};
    `;
  await database.run(updatedPlayerQuery);
  response.send("Player Details Updated");
});

//DELETE API
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deletePlayerQuery = `
    DELETE FROM
        cricket_team
    WHERE 
        player_id = ${playerId};
    `;
  await database.run(deletePlayerQuery);
  response.send("Player Removed");
});

module.export = app;
