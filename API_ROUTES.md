# HackEvent API Documentation

This document outlines all available endpoints in the HackEvent backend, their required parameters, request bodies, authentication methods, and expected JSON responses.

---

## Authentication (`/auth`)
*Handled by `authRoutes.js` and mostly related to admin/member sessions.*

### `POST /auth/login`
- **Description:** Login as an administrator.
- **Body:**
  - `login` (string)
  - `password` (string)
- **Session:** Sets `req.session.adminId`
- **Returns:**
  ```json
  { "message": "Admin logged in" }
  ```

### `POST /auth/logout`
- **Description:** Logout administrator.
- **Returns:**
  ```json
  { "message": "Logged out" }
  ```

### `POST /auth/member/login`
- **Description:** Login as a member/leader.
- **Body:**
  - `email` (string)
  - `password` (string)
- **Session:** Sets `req.session.memberId`
- **Returns:**
  ```json
  { "message": "Member logged in" }
  ```

### `POST /auth/member/logout`
- **Description:** Logout member/leader.
- **Returns:**
  ```json
  { "message": "Logged out" }
  ```

---

## Events (`/events`)
*Handled by `eventRoutes.js` and `eventController.js`*

### `POST /events`
- **Description:** Create a new event. Replaces any existing 'current' event with 'finished' if this one is set to 'current'.
- **Auth:** Admin (`authMiddleware`)
- **Body (`multipart/form-data`):**
  - `name` (string)
  - `event_date` (datetime string)
  - `status` ('waiting', 'current', 'finished')
  - `max_leaders` (integer)
  - `max_team_members` (integer)
  - `logo` (file - optional)
- **Returns:**
  ```json
  { "message": "Event created successfully" }
  ```

### `GET /events`
- **Description:** View all events.
- **Returns:**
  ```json
  [
    {
      "id": 1,
      "name": "Hackathon 2026",
      "logo": "filename.png",
      "event_date": "2026-10-10T10:00:00.000Z",
      "status": "waiting",
      "max_leaders": 10,
      "max_team_members": 4,
      "created_at": "..."
    }
  ]
  ```

### `GET /events/current`
- **Description:** Get the currently active event.
- **Returns:** Same JSON object as a single event from `GET /events`. (Or 404 if none).

### `GET /events/:id`
- **Description:** View a specific event.
- **Params:** `id` (Event ID)
- **Returns:** Same JSON object as a single event.

### `PUT /events/:id`
- **Description:** Update an event. Overrides any other 'current' event to 'finished' if status is 'current'.
- **Auth:** Admin (`authMiddleware`)
- **Params:** `id` (Event ID)
- **Body (`multipart/form-data`):** Same as POST.
- **Returns:**
  ```json
  { "message": "Event updated" }
  ```

### `DELETE /events/:id`
- **Description:** Delete an event.
- **Auth:** Admin (`authMiddleware`)
- **Params:** `id` (Event ID)
- **Returns:**
  ```json
  { "message": "Event deleted" }
  ```

---

## Invitations (`/invites`)
*Handled by `invitationRoutes.js` and `invitationController.js`*

### `POST /invites/leader`
- **Description:** Generate a leader invitation code for an event.
- **Auth:** Admin (`authMiddleware`)
- **Body:**
  - `event_id` (integer)
- **Returns:**
  ```json
  { "code": "ABC123XYZ" }
  ```

### `POST /invites/leader/join`
- **Description:** Register as a new leader using a code. Checks `max_leaders` limit.
- **Body:**
  - `code` (string)
  - `first_name` (string)
  - `last_name` (string)
  - `email` (string)
  - `password` (string)
  - `portfolio` (string - optional)
- **Returns:**
  ```json
  { "message": "Leader registered" }
  ```

### `POST /invites/team`
- **Description:** Generate a team invitation code.
- **Auth:** Member Session && Must be Leader (`memberAuth`, `isLeader`)
- **Session:** Uses `req.session.memberId`
- **Returns:**
  ```json
  { "code": "DEF456UVW" }
  ```

### `POST /invites/team/join`
- **Description:** Register as a new team member using a code. Checks `max_team_members` limit.
- **Body:** Same as Leader Join.
- **Returns:**
  ```json
  { "message": "Member joined team" }
  ```

---

## Teams (`/teams`)
*Handled by `teamRoutes.js` and `teamController.js`*

### `POST /teams`
- **Description:** Create a new team.
- **Auth:** Admin OR Leader (`isAdminOrLeader`)
- **Session:** Uses `req.session.memberId`
- **Body (`multipart/form-data`):**
  - `name` (string)
  - `color` (string)
  - `logo` (file - optional)
- **Returns:**
  ```json
  {
    "message": "Team created",
    "team_id": 1
  }
  ```

### `GET /teams`
- **Description:** Get all teams.
- **Returns:** Array of Team objects.

### `GET /teams/:id`
- **Description:** Get specific team.
- **Params:** `id` (Team ID)
- **Returns:** Single Team object.

### `GET /teams/scoreboard/:eventId`
- **Description:** Get all teams for an event ordered by total score.
- **Params:** `eventId` (Event ID)
- **Returns:**
  ```json
  [
    {
      "id": 1,
      "name": "Alpha",
      "logo": "logo.png",
      "color": "#FF0000",
      "practical_score": 15,
      "theoretical_score": 18,
      "total_score": 33
    }
  ]
  ```

### `PUT /teams/:id`
- **Description:** Update a team.
- **Auth:** Admin OR Team Leader of this team (`isAdminOrTeamLeader`)
- **Params:** `id` (Team ID)
- **Body (`multipart/form-data`):** `name`, `color`, `logo` (file)
- **Returns:**
  ```json
  { "message": "Team updated" }
  ```

### `PUT /teams/:id/scores`
- **Description:** Update scores for a team.
- **Auth:** Admin (`authMiddleware`)
- **Params:** `id` (Team ID)
- **Body (`multipart/form-data` due to upload.none()):**
  - `practical_score` (int, 0-20)
  - `theoretical_score` (int, 0-20)
- **Returns:**
  ```json
  { "message": "Team scores updated" }
  ```

### `DELETE /teams/:id`
- **Description:** Delete a team.
- **Auth:** Admin OR Team Leader (`isAdminOrTeamLeader`)
- **Params:** `id` (Team ID)
- **Returns:**
  ```json
  { "message": "Team deleted" }
  ```

### `DELETE /teams/:id/members/:memberId`
- **Description:** Remove a member from a team and completely delete their user record.
- **Auth:** Admin OR Team Leader (`isAdminOrTeamLeader`)
- **Params:** `id` (Team ID), `memberId` (Member ID to remove)
- **Returns:**
  ```json
  { "message": "Team member removed. User deleted." }
  ```

---

## Workshops (`/workshops`)
*Handled by `workshopRoutes.js` and `workshopController.js`*

### `GET /workshops/event/:eventId`
- **Description:** Get all workshops for a specific event.
- **Params:** `eventId` (Event ID)
- **Returns:**
  ```json
  [
    {
      "id": 1,
      "title": "React Basics",
      "description": "Learn React hooks.",
      "technology": "React",
      "duration": 120,
      "event_id": 1
    }
  ]
  ```

### `GET /workshops/:id`
- **Description:** Get specific workshop.
- **Params:** `id` (Workshop ID)
- **Returns:** Single Workshop JSON object.

### `POST /workshops`
- **Description:** Create a workshop.
- **Auth:** Admin (`authMiddleware`)
- **Body (JSON):**
  - `title` (string)
  - `description` (string)
  - `technology` (string)
  - `duration` (integer)
  - `event_id` (integer)
- **Returns:**
  ```json
  { "message": "Workshop created successfully", "workshop_id": 1 }
  ```

### `PUT /workshops/:id`
- **Description:** Update workshop.
- **Auth:** Admin (`authMiddleware`)
- **Params:** `id` (Workshop ID)
- **Body (JSON):** `title`, `description`, `technology`, `duration`
- **Returns:**
  ```json
  { "message": "Workshop updated" }
  ```

### `DELETE /workshops/:id`
- **Description:** Delete workshop.
- **Auth:** Admin (`authMiddleware`)
- **Params:** `id` (Workshop ID)
- **Returns:**
  ```json
  { "message": "Workshop deleted" }
  ```

---

## Timers (`/timers`)
*Handled by `timerRoutes.js` and `timerController.js`*

### `GET /timers/event/:eventId`
- **Description:** Get the current timer state for an event.
- **Params:** `eventId` (Event ID)
- **Returns:**
  ```json
  {
    "id": 1,
    "event_id": 1,
    "start_time": "2026-03-15T09:00:00.000Z",
    "end_time": "2026-03-15T18:00:00.000Z",
    "status": "running"
  }
  ```

### `POST /timers/event/:eventId`
- **Description:** Explicitly create a timer record for an event.
- **Auth:** Admin (`authMiddleware`)
- **Params:** `eventId` (Event ID)
- **Returns:**
  ```json
  { "message": "Timer created" }
  ```

### `PUT /timers/event/:eventId/start`
- **Description:** Start the timer.
- **Auth:** Admin (`authMiddleware`)
- **Params:** `eventId` (Event ID)
- **Body (JSON):**
  - `end_time` (datetime string - optional)
- **Returns:**
  ```json
  { "message": "Timer started" }
  ```

### `PUT /timers/event/:eventId/pause`
- **Description:** Pause the timer.
- **Auth:** Admin (`authMiddleware`)
- **Params:** `eventId` (Event ID)
- **Returns:**
  ```json
  { "message": "Timer paused" }
  ```

### `PUT /timers/event/:eventId/resume`
- **Description:** Resume a paused timer.
- **Auth:** Admin (`authMiddleware`)
- **Params:** `eventId` (Event ID)
- **Returns:**
  ```json
  { "message": "Timer resumed" }
  ```

### `PUT /timers/event/:eventId/finish`
- **Description:** Finish/stop the timer.
- **Auth:** Admin (`authMiddleware`)
- **Params:** `eventId` (Event ID)
- **Returns:**
  ```json
  { "message": "Timer finished" }
  ```

---

## Admin Members Control (`/admin`)
*Handled by `adminRoutes.js` and `adminController.js`*

### `GET /admin/members`
- **Description:** Get all registered members.
- **Auth:** Admin (`authMiddleware`)
- **Returns:** Array of Member JSON objects without password hashes.

### `DELETE /admin/members/:id`
- **Description:** Forcefully delete any member from the platform.
- **Auth:** Admin (`authMiddleware`)
- **Params:** `id` (Member ID)
- **Returns:**
  ```json
  { "message": "Member deleted successfully" }
  ```

### `PUT /admin/members/:id/role`
- **Description:** Change a member's role ('leader' or 'member'). Handled with complex logic to guarantee only one leader per team.
- **Auth:** Admin (`authMiddleware`)
- **Params:** `id` (Member ID)
- **Body (JSON):**
  - `role` ('leader' or 'member')
- **Returns:**
  ```json
  { "message": "Role updated to leader and previous leader downgraded" }
  ```
  *(Or `{ "message": "Role updated" }` depending on context).*
