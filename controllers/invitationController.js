const pool = require("../config/db");
const generateCode = require("../utils/generateCode");
const bcrypt = require("bcrypt");


// CREATE LEADER INVITE
exports.createLeaderInvite = async (req, res) => {

  try {

    const { event_id } = req.body;

    const code = generateCode();

    await pool.query(
      "INSERT INTO leader_invitations (code, event_id) VALUES (?, ?)",
      [code, event_id]
    );

    res.json({ code });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};


// JOIN AS LEADER
exports.joinAsLeader = async (req, res) => {

  try {

    const { code, first_name, last_name, email, password,portfolio } = req.body;

    const [rows] = await pool.query(
      "SELECT * FROM leader_invitations WHERE code=? AND used=false",
      [code]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: "Invalid code" });
    }

    const invite = rows[0];

    // Check max_leaders constraint
    const [eventRows] = await pool.query(
      "SELECT max_leaders FROM events WHERE id=?",
      [invite.event_id]
    );

    if (eventRows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    const max_leaders = eventRows[0].max_leaders;

    const [leaderCountRows] = await pool.query(
        "SELECT COUNT(*) as count FROM members WHERE event_id=? AND role='leader'",
        [invite.event_id]
    );

    if (leaderCountRows[0].count >= max_leaders) {
        return res.status(400).json({ error: "Maximum number of leaders reached for this event" });
    }

    try {
      const password_hash = await bcrypt.hash(password, 10);
      await pool.query(
        `INSERT INTO members
        (first_name, last_name, email, password_hash, role, portfolio, event_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [first_name, last_name, email, password_hash, "leader", portfolio, invite.event_id]
      );

      await pool.query(
        "UPDATE leader_invitations SET used=true WHERE id=?",
        [invite.id]
      );

      res.json({ message: "Leader registered. Please log in and create your team." });

    } catch (err) {
      res.status(500).json({ error: err.message });
    }

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// CREATE TEAM INVITE
exports.createTeamInvite = async (req, res) => {

  try {

    const leaderId = req.session.memberId;

    //check if leader already has a team
    const [member] = await pool.query(
    "SELECT team_id FROM members WHERE id=?",
    [leaderId]
    );

    if (member[0].team_id === null) {
    return res.status(400).json({
        error: "You must have a team to create an invite"
    });
    }
    const team_id = member[0].team_id;

    const code = generateCode();

    await pool.query(
      "INSERT INTO team_invitations (code, team_id) VALUES (?, ?)",
      [code, team_id]
    );

    res.json({ code });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};


// JOIN TEAM
exports.joinTeam = async (req, res) => {

  try {

    const {
      code,
      first_name,
      last_name,
      email,
      password,
      portfolio
    } = req.body;

    const [rows] = await pool.query(
      `SELECT t.*, ti.id AS invite_id
       FROM team_invitations ti
       JOIN teams t ON t.id = ti.team_id
       WHERE ti.code=? AND ti.used=false`,
      [code]
    );

    if (rows.length === 0) {
      return res.status(400).json({ error: "Invalid code" });
    }

    const team = rows[0];

    // Check max_team_members constraint
    const [eventRows] = await pool.query(
      "SELECT max_team_members FROM events WHERE id=?",
      [team.event_id]
    );

    if (eventRows.length === 0) {
      return res.status(404).json({ error: "Event not found" });
    }

    const max_team_members = eventRows[0].max_team_members;

    const [memberCountRows] = await pool.query(
        "SELECT COUNT(*) as count FROM members WHERE team_id=?",
        [team.id]
    );

    // Leader is part of the team, so count >= max_team_members logic still applies. 
    // Example: max 4 members total (1 leader, 3 members).
    // If the database has 3 inside the team, and limit is 4, they can join.
    if (memberCountRows[0].count >= max_team_members) {
        return res.status(400).json({ error: "Maximum number of team members reached for this team" });
    }

    await pool.query(
      `INSERT INTO members
      (first_name,last_name,email,password_hash,portfolio,role,event_id,team_id)
      VALUES (?,?,?,?,?,?,?,?)`,
      [
        first_name,
        last_name,
        email,
        await bcrypt.hash(password, 10),
        portfolio,
        "member",
        team.event_id,
        team.id
      ]
    );

    await pool.query(
      "UPDATE team_invitations SET used=true WHERE id=?",
      [team.invite_id]
    );
    

    res.json({ message: "Member joined team" });

  } catch (err) {

    res.status(500).json({ error: err.message });

  }

};